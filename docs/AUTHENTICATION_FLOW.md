# Authentication Flow

This document specifies the Google OAuth 2.0 authentication flow, Next.js middleware protection rules, and token-based session management implemented in **THE TRACKER**.

---

## 1. Authentication Architecture

The application uses **Supabase Auth** as the identity manager. Supabase handles Google OAuth redirection, credentials storage, and JSON Web Token (JWT) issuing, reducing security risk on our Next.js backend server.

---

## 2. Google OAuth 2.0 Redirect Lifecycle

The login flow is executed in a sequence of client redirects, middleware checks, and database hooks:

```
[User Browser]                 [Next.js App Server]             [Supabase Auth]
      |                                 |                             |
      | 1. Click "Sign in with Google"  |                             |
      |-------------------------------------------------------------->|
      |                                 |                             |
      | 2. Redirect to Google Consent   |                             |
      |<--------------------------------------------------------------|
      |                                 |                             |
      | 3. Complete auth & redirect to /auth/callback                 |
      |-------------------------------->|                             |
      |                                 | 4. Exchange Auth Code       |
      |                                 |---------------------------->|
      |                                 |                             |
      |                                 | 5. Return JWT & Refresh Tok |
      |                                 |<----------------------------|
      |                                 |                             |
      | 6. Set Cookies & Redirect       |                             |
      |<--------------------------------|                             |
      |                                 |                             |
      v                                 v                             v
```

1. **User Action**: The user clicks the Google Sign-in button, which invokes:
   ```typescript
   supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: `${window.location.origin}/auth/callback`,
     },
   });
   ```
2. **Consent & Verification**: The user is routed to Google's sign-in screen, where they input credentials and confirm permissions.
3. **Authorization Code**: Google routes the user back to the application's callback route: `/auth/callback?code=AUTH_CODE`.
4. **Token Exchange**: The backend route handler `/app/auth/callback/route.ts` captures the code and calls the Supabase Server Client to exchange it for a session token:
   ```typescript
   const supabase = createClient();
   const { error } = await supabase.auth.exchangeCodeForSession(code);
   ```
5. **Session Cookies Set**: The `@supabase/ssr` library handles setting security-enhanced cookies containing the `access_token` (JWT) and `refresh_token`.
6. **Final Routing**: The server redirects the user to the `/dashboard`.

---

## 3. Next.js Middleware Protection Rules

To prevent unauthenticated users from accessing training logs, a Next.js `middleware.ts` file intercepts all incoming requests and routes them according to session validity.

### Router Configuration Rules
* **Public Routes**: `/`, `/login`, `/auth/callback`
* **Protected Routes**: `/dashboard/*`, `/workout/*`, `/exercises/*`, `/weight/*`, `/api/data/*`

### Middleware logic (`middleware.ts`)
```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/workout') ||
                           request.nextUrl.pathname.startsWith('/exercises') ||
                           request.nextUrl.pathname.startsWith('/weight');

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}
```

---

## 4. Session Security Details

* **Access Token (JWT)**: Expired every 1 hour. It contains the user's encrypted ID (`sub` field) matching their profile.
* **Refresh Token**: Used by the middleware or client SDK to request a new JWT silently. It has a longer expiration window (typically 30 days).
* **Cookie Configuration**:
  * **HttpOnly**: Set to `true` (unreadable via browser JavaScript, eliminating XSS token theft).
  * **Secure**: Set to `true` (enforced HTTPS transport).
  * **SameSite**: Set to `Lax` (prevents cross-site request forgery CSRF attacks while allowing links from Google OAuth redirects to function).
