# Project Structure

This document outlines the codebase organization and directory structure for **THE TRACKER**, mapping the Next.js App Router setup and Supabase project configurations.

---

## 1. Directory Tree Map

```
my-training-tracker/
├── app/                        # Next.js App Router (Pages, Layouts, API Routes)
│   ├── actions/                # Next.js Server Actions (Database mutations)
│   │   ├── weight.ts           # Body weight logging actions
│   │   └── workouts.ts         # Workout creation and logging actions
│   ├── auth/
│   │   └── callback/           # OAuth exchange callback route
│   │       └── route.ts
│   ├── dashboard/              # User Dashboard (Analytics hub)
│   │   └── page.tsx
│   ├── exercises/              # Exercise library & search routes
│   │   └── page.tsx
│   ├── login/                  # Authentication page
│   │   └── page.tsx
│   ├── workout/
│   │   ├── active/             # Active workout logger screen
│   │   │   └── page.tsx
│   │   └── history/            # Past workout logs screen
│   │       └── page.tsx
│   ├── globals.css             # Tailwind base styles and CSS variables
│   ├── layout.tsx              # Base root layout wrapper
│   ├── middleware.ts           # Next.js session validation and route guard
│   └── page.tsx                # Public landing page
├── components/                 # Reusable React components (Modular UI)
│   ├── analytics/              # Recharts data charts
│   ├── auth/                   # Login buttons and auth status components
│   ├── ui/                     # shadcn/ui custom components (Buttons, Inputs, etc.)
│   └── workout/                # Set log rows, stopwatch, timers
├── lib/                        # Helper logic, utilities & client SDK setups
│   ├── hooks/                  # Custom hooks (e.g., useLocalStorage)
│   ├── supabase/               # Supabase browser/server client initializers
│   └── utils.ts                # Tailwind merge and utility helpers
├── supabase/                   # Supabase CLI Local Configuration
│   ├── migrations/             # SQL Migration files (DBSchema, Triggers, RLS)
│   │   ├── 20260603000000_init.sql
│   │   └── 20260603000100_pr_engine.sql
│   ├── seed.sql                # Seed script for default exercise library
│   └── config.toml             # Local Supabase configurations
├── types/                      # TypeScript definitions
│   ├── database.types.ts       # Supabase auto-generated DB types
│   └── index.ts                # Clean domain types (Profile, Exercise, etc.)
├── public/                     # Static assets (icons, logo images)
├── tailwind.config.ts          # Tailwind styling options & design system mappings
├── tsconfig.json               # TypeScript compiler config
└── package.json                # Project dependencies and script files
```

---

## 2. Directory Responsibilities

### `app/`
* Acts as the routing hierarchy. Inside `app`, folders represent URL segments (e.g. `app/dashboard` corresponds to `/dashboard`).
* Contains `layout.tsx` which houses the global HTML framework, context providers (like auth providers), and basic styling imports.
* `actions/` is an isolation directory for Server Actions, which communicate directly with the database, bypassing standard REST routes for secure writes.

### `components/`
* Categorized by feature domains (e.g., all components used strictly inside charts reside in `components/analytics`).
* `components/ui` houses raw presentational elements powered by `shadcn/ui` (such as `dialog.tsx`, `input.tsx`, `select.tsx`, and `button.tsx`). These are modular and styles are overridden using Tailwind utility parameters.

### `lib/`
* Houses standalone functional scripts. `lib/utils.ts` integrates `clsx` and `tailwind-merge` to compile custom classes securely.
* `lib/supabase` maintains client caching variables to prevent memory leaks during client-server token verification.

### `supabase/`
* Handles developer environment states. All database changes are structured sequentially as SQL migrations inside `supabase/migrations`.
* `supabase/seed.sql` populates the database with system-default exercises when creating a new development instance.
