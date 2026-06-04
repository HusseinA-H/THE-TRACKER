# System Architecture

This document describes the high-level system architecture, component relationships, data flow, and technologies powering **THE TRACKER**.

---

## 1. High-Level Component Architecture

"THE TRACKER" uses a hybrid modern stack combining a **Serverless/Edge Frontend** (Next.js 14) and a **Backend-as-a-Service (BaaS)** (Supabase) backed by a relational database (**PostgreSQL**).

```mermaid
graph TD
    %% Clients
    subgraph Client ["Client Layer (Browser)"]
        UI["React Server/Client Components<br>(shadcn/ui + Tailwind)"]
        State["State Manager & LocalCache<br>(React Context / localStorage)"]
        UI --- State
    end

    %% Routing / Hosting Layer
    subgraph EdgeHost ["Hosting & Edge Layer (Vercel)"]
        MW["Next.js Middleware<br>(Session Validation)"]
        SA["Next.js Server Actions & API Routes<br>(Data Fetching & Mutations)"]
    end

    %% Backend Layer
    subgraph Backend ["BaaS Layer (Supabase)"]
        SAuth["Supabase Auth<br>(Google OAuth 2.0)"]
        SDB["PostgreSQL Database<br>(Tables, Triggers, Views)"]
        RLS["Row Level Security Policies<br>(Access Control)"]
        SDB --- RLS
    end

    %% Interactions
    UI -->|1. Request Route| MW
    MW -->|2. Verify Session / Fetch JWT| SAuth
    UI -->|3. Invoke Mutations / Actions| SA
    SA -->|4. Query / Write Data| SDB
    UI -->|5. Client-side DB Reads| SDB
    SAuth -->|6. Trigger User Creation| SDB

    style Client fill:#f9f,stroke:#333,stroke-width:2px
    style EdgeHost fill:#bbf,stroke:#333,stroke-width:2px
    style Backend fill:#dfd,stroke:#333,stroke-width:2px
```

---

## 2. Frontend Architecture: Next.js 14 App Router

The application is structured around the Next.js App Router, utilizing **React Server Components (RSC)** by default and opting into **Client Components** (`"use client"`) only when user interactivity is required.

### Server Components vs. Client Components Strategy
* **Server Components (`app/dashboard/page.tsx`, `app/exercises/page.tsx`)**:
  * Used for fetching static system data (such as the default exercise library) and performing initial page renders directly at the edge.
  * Direct secure database queries using the Supabase Server Client.
  * Reduces JavaScript bundle size shipped to the client.
* **Client Components (`components/workout/workout-logger.tsx`, `components/weight/weight-form.tsx`)**:
  * Used for interactive features that require immediate state updates (e.g., ticking set checkboxes, typing weights/reps, running the active stopwatch rest timer).
  * Submits data to the backend using **Next.js Server Actions** or Supabase Client SDK calls.

### Application State & Offline Resilience
* **Core Global State**: Provided by standard React Context (e.g., `AuthContext` to track user profiles).
* **Workout Logging State**: Managed locally in state within the active workout view, backed by a synchronization hook to `localStorage` (via a customized `useLocalStorage` React hook). This ensures that if the browser crashes, refreshes, or loses internet connectivity in the gym, the user's progress is entirely recoverable.

---

## 3. Backend Architecture: Supabase BaaS

Supabase serves as the backend platform, providing database, authentication, and security services.

### Supabase Auth
* Handles authentication through a Google OAuth provider connection.
* Manages JSON Web Tokens (JWTs) and refresh tokens.
* Next.js Middleware reads the session cookies, extracting the JWT, and validates it prior to completing server rendering.

### PostgreSQL Database & RLS
* A relational schema designed with constraints and indexes (see **[Database Design](DATABASE_DESIGN.md)**).
* **Row Level Security (RLS)** is enabled on all tables, ensuring that data isolation is enforced at the database level. Even if client-side code is compromised or a malicious user attempts to query the Supabase REST API directly, they can only view data where:
  
  $$\text{auth.uid()} = \text{user\_id}$$

---

## 4. Key Architectural Data Flows

### A. Authentication & Session Setup
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Client Browser
    participant App as Next.js Edge
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    User->>Browser: Click "Sign In with Google"
    Browser->>Auth: Initiate OAuth Flow (Google Provider)
    Auth-->>User: Google Consent Screen
    User->>Auth: Approve Permission
    Auth->>DB: Write User to auth.users (System)
    DB->>DB: Trigger: on_auth_user_created() -> Insert into public.profiles
    Auth-->>Browser: Redirect with session code to /auth/callback
    Browser->>App: Exchange code for session token
    App->>Browser: Set HTTP-Only Cookie with Session JWT
    App-->>Browser: Redirect to /dashboard
```

### B. Workout Logging and PR Evaluation
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as Workout UI
    participant Cache as LocalStorage Cache
    participant SA as Server Actions
    participant DB as Supabase DB

    User->>UI: Enter weight & reps for Bench Press set
    UI->>Cache: Save draft workout state
    User->>UI: Click checkmark (complete set)
    UI->>UI: Calculate estimated 1RM & display rest timer
    User->>UI: Click "Finish Workout"
    UI->>SA: Submit completed workout payload
    SA->>DB: Insert Workout & Workout_Sets rows
    Note over DB: Database triggers verify if any set<br/>exceeds previous max weight or 1RM PR.<br/>Flags is_pr = true if so.
    DB-->>SA: Success Response with PR status
    SA-->>UI: Clear cache & redirect to Summary Page (Show PR Celebrations)
```
