# Deployment Guide

This guide details the steps required to deploy **THE TRACKER** from scratch, covering Supabase cloud backend setups, Google Developer Console OAuth registrations, and Vercel hosting integration.

---

## 1. Supabase Project Initialization

### A. Create the Project
1. Log in to the [Supabase Dashboard](https://supabase.com).
2. Click **New Project** and select your Organization.
3. Define the project name: `THE TRACKER`.
4. Generate and save a secure Database Password.
5. Set the Region to your closest user hub (e.g. `us-east-1` or `eu-central-1`).
6. Select the **Free Tier** (or upgrade) and click **Create New Project**.

### B. Database Migration Deployments
To push database definitions locally configured inside `supabase/migrations`:
1. Authenticate the local Supabase CLI:
   ```bash
   npx supabase login
   ```
2. Link your local project to the cloud instance:
   ```bash
   npx supabase link --project-ref your-supabase-project-ref
   ```
3. Push migrations to production:
   ```bash
   npx supabase db push
   ```

---

## 2. Google OAuth 2.0 Credentials Setup

### A. Google Developer Console Configuration
1. Go to the [Google Cloud Console Credentials Dashboard](https://console.cloud.google.com/apis/credentials).
2. Create or select a project (e.g. `my-training-tracker`).
3. Set up the **OAuth Consent Screen**:
   * User Type: **External**
   * App name: `THE TRACKER`
   * Developer Contact: your-email@domain.com
   * Authorized domains: `supabase.co`, `vercel.app`
4. Click **Create Credentials** -> **OAuth Client ID**:
   * Application Type: **Web Application**
   * **Authorized JavaScript Origins**:
     * `https://your-supabase-project-ref.supabase.co`
   * **Authorized Redirect URIs**:
     * `https://your-supabase-project-ref.supabase.co/auth/v1/callback`
5. Click **Create** and copy the generated **Client ID** and **Client Secret**.

### B. Supabase Auth Console Configurations
1. Return to the **Supabase Dashboard** and go to **Authentication** -> **Providers** -> **Google**.
2. Toggle Google login to **Enabled**.
3. Input the **Google Client ID** and **Google Client Secret** copied from Google Cloud Console.
4. Save the configurations.

---

## 3. Vercel Hosting Integration

### A. Configure Repository
1. Push your local codebase to a private/public GitHub repository.

### B. Setup Vercel Project
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project** and import your GitHub repository.
3. Configure the build parameters:
   * Framework Preset: **Next.js**
   * Build Command: `npm run build`
   * Install Command: `npm install`
4. Add the following **Environment Variables**:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-ref.supabase.co` | Browser API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Public anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Server Admin Key (for Server Actions) |

5. Click **Deploy**. Vercel will build and spin up edge server nodes.

### C. Update Supabase Site URL
1. Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Change the **Site URL** to your production Vercel link (e.g., `https://my-training-tracker.vercel.app`).
3. Add the staging/localhost environments to **Redirect URLs** (e.g., `http://localhost:3000/**`).

---

## 4. Post-Deployment Smoke Test Checklist
* [ ] Navigate to the deployed Vercel URL and check that it redirects to `/login`.
* [ ] Click "Sign in with Google" and ensure you are routed to Google's consent portal.
* [ ] Verify that successful login redirects back to `/dashboard` with cookies set.
* [ ] Navigate to `/weight`, log `75 kg`, and check that the entry successfully appears on the analytics chart.
