# Security Guidelines

This document outlines the security architecture, data protection rules, and coding standards required to safeguard user data in **THE TRACKER**.

---

## 1. Row-Level Security (RLS) Rules

Because Supabase exposes direct HTTP endpoints to read and write database tables, securing data **must** occur at the database level rather than just the frontend application server.

### Core Policies

1. **Deny by Default**: Every new table must enable RLS immediately:
   ```sql
   ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
   ```
2. **User Isolation**: Access rules are validated using the logged-in user's UID provided in the JWT token by checking:
   ```sql
   CREATE POLICY user_isolation_policy ON public.weight_logs
       FOR ALL 
       USING (auth.uid() = user_id)
       WITH CHECK (auth.uid() = user_id);
   ```
3. **Cascading Relational Isolation**: Junction tables (like `workout_exercises` and `workout_sets`) do not store a raw `user_id`. Instead, they check parent ownership using subqueries:
   ```sql
   CREATE POLICY set_isolation ON public.workout_sets
       FOR ALL
       USING (
           EXISTS (
               SELECT 1 FROM public.workout_exercises we
               JOIN public.workouts w ON we.workout_id = w.id
               WHERE we.id = workout_exercise_id AND w.user_id = auth.uid()
           )
       );
   ```

---

## 2. API Key Isolation

We differentiate public and private configurations to prevent sensitive leaks to the browser:

* **`NEXT_PUBLIC_SUPABASE_URL`**: Safe to expose to the client. Identifies the Supabase endpoint.
* **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: Safe to expose to the client. Enforces RLS policies during direct browser-based DB queries.
* **`SUPABASE_SERVICE_ROLE_KEY`**: **NEVER** expose to the client. This key bypasses RLS policies entirely. It should only be loaded inside server environments (Server Actions, Next.js API Routes).

---

## 3. Cross-Site Scripting (XSS) & Cross-Site Request Forgery (CSRF)

### XSS Protections
* **React Rendering**: Next.js automatically escapes values rendered in JSX, preventing simple HTML injection.
* **Avoid `dangerouslySetInnerHTML`**: Do not use this React feature unless user input is sanitized through a library like `DOMPurify`.
* **Content Security Policy (CSP)**: Set strict CSP headers in `next.config.js` restricting scripts to trusted origins.

### CSRF Protections
* **Cookie Attributes**: Authentication cookies use the `SameSite=Lax` configuration, blocking authorization headers from being sent automatically on cross-origin requests.
* **OAuth Authorization Code Flow**: Supabase's `pkce` verification exchange (Proof Key for Code Exchange) protects login requests from interception or replay attacks.

---

## 4. Input Validation & Query Sanitation

To prevent SQL injection and malicious payloads:
* **Parameterized Queries**: Direct SQL strings (`pg` module query templates) are avoided. Instead, we use Supabase's PostgREST query builder which automatically parameters-encodes inputs:
  ```typescript
  // Safe from SQL Injection
  const { data } = await supabase
    .from('exercises')
    .select('*')
    .eq('name', userInput); 
  ```
* **Schema Validation**: All input payloads submitted to Server Actions must be parsed and verified using validation schemas like **Zod**:
  ```typescript
  import { z } from 'zod';

  const WeightLogSchema = z.object({
    weight: z.number().positive().max(500),
    logDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  });
  ```
* **HTML Sanitization**: Custom exercise descriptions must be stripped of script attributes prior to rendering.
