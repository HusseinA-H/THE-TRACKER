# Feature Specifications

This document outlines the detailed functional and technical specifications for each primary feature within **THE TRACKER**.

---

## 1. Google Authentication

### User Flow
1. User lands on the application. If unauthenticated, they are redirected to `/login` or shown a prominent **"Sign in with Google"** button.
2. Clicking the button calls Supabase's `signInWithOAuth` client method, routing the user to Google's consent screen.
3. Upon approval, Google redirects the user back to the application `/auth/callback` route.
4. Next.js middleware detects the session token, sets the session cookies, and redirects the user to `/dashboard`.
5. An entry is automatically created in the `profiles` database table using a PostgreSQL trigger linked to the `auth.users` system table.

### Components Involved
* `components/auth/login-button.tsx` (Sign-in UI trigger)
* `app/login/page.tsx` (Login page layout)
* `app/auth/callback/route.ts` (API route handling the OAuth response code and exchanging it for a session)

### Technical Details & Edge Cases
* **Expired Sessions**: The Next.js middleware monitors JWT expiration. If a token is expired, it uses the refresh token to silently request a new JWT. If that fails, it wipes the cookie and redirects the user back to `/login`.
* **Database Sync**: If the database trigger fails to create the user profile, subsequent queries will fail. The system handles this with an idempotent fallback creation function in the database.

---

## 2. Exercise Management

### Functional Specification
* **Exercise Schema Type**: Two sources of exercises:
  1. **System Default**: Pre-seeded exercises available to all users. These cannot be edited or deleted.
  2. **Custom**: Created by individual users. These are private, search-isolated, and can be edited or deleted by the creator.
* **Filtering**: Users can search via a search bar (case-insensitive string match) and filter by muscle group using a badge-selector row.

### UI Specs
* The exercise library page features a search bar at the top, followed by a horizontal scrolling list of muscle group badges (e.g., *All, Chest, Back, Legs, Shoulders, Arms, Core*).
* A floating action button (FAB) or top button "+ Create Exercise" opens a modal overlay requesting:
  * Exercise Name (Required, e.g., "Incline Dumbbell Fly")
  * Primary Muscle Group (Required dropdown)
  * Secondary Muscle Group (Optional dropdown)
  * Custom Description/Notes (Optional textarea)

---

## 3. Workout Tracking & Logging

### Functional Specification
* **Active State**: The tracker operates in a dedicated, high-focus route (`/workout/active`).
* **Active Workout Schema**: Contains Workout Title (defaults to "Evening Workout" or similar), Start Time, Notes, and a list of exercises.
* **Set Entries**: Each exercise displays a table containing:
  * Set Number
  * Previous stats (grayed-out text showing reps and weight from the last time this exercise was performed).
  * Weight input (numeric field, supports decimals).
  * Reps input (integer field).
  * RPE input (Rate of Perceived Exertion, dropdown or click-selector from 1 to 10).
  * Checklist check button (marks the set as completed).
* **Rest Timer**: When a set's checklist button is checked:
  * An automatic pop-up overlay or top bar countdown timer begins.
  * Defaults to 90 seconds (customizable in-app).
  * Vibrates/plays a subtle audio beep when it reaches zero (browser API permitting).
* **Active Session Persistence**: To prevent loss of data, the active workout state is synced to `localStorage` on every input change. If the user refreshes, the app re-hydrates the state from `localStorage`.

---

## 4. Personal Records (PR) Engine

### Functional Specification
The PR Engine evaluates every set marked as completed against the user's historical log. It checks two categories of Personal Records:
1. **Absolute Weight PR**: The highest weight ever lifted for a specific exercise.
2. **Estimated 1-Rep Max (1RM) PR**: The highest estimated 1RM calculated from sub-maximal efforts.

### Calculations
The system uses the **Epley Formula** for estimated 1RM calculations:

$$\text{1RM} = w \left(1 + \frac{r}{30}\right)$$

*Where:*
* $w$ = weight lifted
* $r$ = number of repetitions completed ($r > 1$; if $r = 1$, $1\text{RM} = w$)

### Event Flow
1. User checks a set as complete (e.g., Squat: 100kg for 5 reps).
2. Client-side script calculates the estimated 1RM:

$$100 \times \left(1 + \frac{5}{30}\right) = 116.67\text{kg}$$

3. The system queries the local cache of user PRs (or queries the database trigger) to see if $116.67\text{kg}$ exceeds the user's current 1RM PR for squats.
4. If it's a PR:
   * A celebratory micro-animation (confetti or glowing border) triggers on the completed set card.
   * The database record for that set is flagged with `is_pr = true` and `estimated_1rm = 116.67`.

---

## 5. Weight Tracker

### Functional Specification
* **Log Entry**: Simple weight capture panel on `/weight` route.
* **Fields**: Weight (e.g., 82.4), unit (`kg`/`lbs`), and date (defaults to current date, with calendar picker for backdating).
* **Grid / History**: List of past entries displayed below the entry form, ordered newest first.
* **Visual Graph**: Interactive line chart displaying weight trends over 7 days, 30 days, 90 days, or All Time.

### Edge Cases
* **Double Logging**: If a user logs `80.1 kg` on June 3rd, and later logs `79.9 kg` on the same day, the database table uses a `UNIQUE(user_id, date)` constraint with an `ON CONFLICT (user_id, date) DO UPDATE SET weight = EXCLUDED.weight` to ensure only one entry per user per day exists.

---

## 6. Dashboard & Progress Analytics

### Data Visualization Layout
* **Hero Analytics Card**: Displays workout frequency this month compared to last month (e.g., "14 Workouts completed this month, +2 from last month").
* **Training Volume Chart**: Stacked bar chart showing total tonnage lifted per muscle group per week:

$$\text{Volume} = \sum (\text{weight} \times \text{reps})$$

* **Muscle Group Split**: Doughnut chart showing distribution of completed sets across main muscle groups (Chest, Back, Legs, etc.), helping users visualize training imbalances.
* **Weight Trend Overlay**: Optional overlay of average body weight trends alongside 1RM strength trends to monitor relative strength progress.
