# Technical Decisions (ADR)

This document contains Architecture Decision Records (ADRs) explaining key technical choices and trade-offs made during the creation of **THE TRACKER**.

---

## ADR 1: Choose Next.js App Router over SPA (Vite/React)

### Context
We need to build a responsive web application that loads rapidly on mobile devices, has clean SEO landing pages, and communicates securely with database APIs.

### Decision
Choose **Next.js 14 App Router** over standard Client-Side Rendered (CSR) frameworks.

### Consequence & Rationale
* **Pros**:
  * **Server Components (RSC)** allow us to run database queries on the server side, keeping database access keys secure and reducing JavaScript bundle size.
  * **Edge Rendering** enables pages to load in under 1 second, even on low-bandwidth gym networks.
  * **Routing & Middleware** are natively integrated, allowing us to implement JWT-based login gates easily.
* **Cons**:
  * Slightly higher hosting complexity compared to simple static S3 hosting, but Vercel manages Next.js serverless execution seamlessly.

---

## ADR 2: Choose Supabase over Custom Node.js (Express/NestJS) Backend

### Context
As a lean startup, speed-to-market and minimized operational overhead are critical. We want to avoid managing database configurations, server scaling, and API routing schemas from scratch.

### Decision
Choose **Supabase** (Backend-as-a-Service) for authentication, database hosting, and row-level security.

### Consequence & Rationale
* **Pros**:
  * **Built-in Authentication**: Google OAuth integration requires minimal configuration.
  * **PostgreSQL Engine**: Supabase runs on native PostgreSQL, meaning we do not lose relational constraints, indexes, or custom trigger features.
  * **Scale-to-Zero**: Serverless backend means zero maintenance and minimal hosting costs during early user acquisition stages.
* **Cons**:
  * Vendor lock-in to Supabase features, but database models are written in standard PostgreSQL DDL, making migrations to custom RDS instances straightforward if required.

---

## ADR 3: Choose PostgreSQL over MongoDB/NoSQL

### Context
Workout tracking data models are highly relational. A set belongs to an exercise inside a workout, which belongs to a user. Weights, reps, and dates must be strictly validated.

### Decision
Choose **PostgreSQL** over NoSQL solutions like MongoDB.

### Consequence & Rationale
* **Pros**:
  * **Data Integrity**: Enforces strict constraints (e.g. `set_number` must be unique per exercise inside a workout; weight cannot be negative).
  * **Relational Joins**: Fetching historical sets and comparing current weights to calculate Personal Records (PRs) is fast using PostgreSQL SQL joins and trigger procedures.
  * **Cascade Deletes**: Deleting a workout automatically cleans up junction rows cleanly via database constraints.
* **Cons**:
  * Modifying schemas requires migrations, but migrations are managed cleanly via Supabase CLI.

---

## ADR 4: Use Next.js Server Actions for Mutations

### Context
We want to mutate database records (like completing a workout or logging body weight) securely while avoiding writing redundant REST route boilerplate.

### Decision
Use **Next.js Server Actions** instead of custom `/api/workouts` REST routes.

### Consequence & Rationale
* **Pros**:
  * **Type Safety**: End-to-end typing from database models directly into client form event handlers.
  * **Reduced Code**: Eliminates API route templates, serialization pipelines, and manual fetch requests.
  * **Progressive Enhancement**: Forms submit successfully even if client-side Javascript has not fully hydrated, improving durability under slow connections.
* **Cons**:
  * Standard REST endpoints are still required for external data exports, which we configure separately in `app/api/*`.
