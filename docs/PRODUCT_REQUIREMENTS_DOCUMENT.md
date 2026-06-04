# Product Requirements Document (PRD)

## Document Control
* **Project Name**: THE TRACKER
* **Document Version**: 1.0.0
* **Status**: Approved
* **Authors**: Senior Product Manager / Startup Founder
* **Last Updated**: June 2026

---

## 1. Introduction & Purpose
The purpose of "THE TRACKER" is to provide gym-goers with an intuitive, hyper-fast, mobile-friendly fitness tracking application. Most fitness apps require payment for basic logs or overload the screen with complex menus. This app serves as a digital notebook that automatically calculates strength analytics, tracks body weight, and records personal bests, with zero financial barriers and zero input friction.

---

## 2. Goals & Success Metrics

### Business Goals
* Establish a highly engaged user base of fitness enthusiasts.
* Achieve rapid user growth through open-source distribution and organic word-of-mouth.
* Build a solid foundation for future premium B2B features (e.g., trainer/client portals).

### Success Metrics (KPIs)
* **User Engagement**: Average active sessions of >= 3 times per week per user.
* **Retention Rate**: D30 user retention rate of >= 45%.
* **Performance**: First Contentful Paint (FCP) of <= 800ms; time to log a set of <= 5 seconds.
* **Error Rate**: System error rate for API transactions of <= 0.05%.

---

## 3. User Personas (Summary)
* **Alex (The Serious Lifter)**: Focuses on quick logging and strength gains. Needs immediate feedback on PRs and rest time.
* **Sarah (The Analytics Tracker)**: Focuses on long-term weight tracking, workout volume, and muscle balance graphs.
* **Marcus (The Minimalist)**: Focuses on ease of use, using standard templates and system-default exercises.

---

## 4. Scope of the Release (MoSCoW)

### Must Have (P0)
* **Google Authentication**: Single Sign-On (SSO) utilizing Google accounts via Supabase.
* **Exercise Management**: A library of default exercises (e.g., Squat, Bench Press) plus the ability to create custom user exercises.
* **Workout Tracking**: Create, edit, and log workouts. Workouts consist of exercises, which contain sets. Sets track reps, weight, and RPE.
* **Weight Tracking**: Log body weight daily or weekly, viewable on a chronological line chart.
* **Personal Records (PRs)**: Automatically detect and store personal record sets (highest weight, highest estimated 1-rep max) for each exercise.
* **Responsive mobile-first UI**: Optimized UI for iPhone and Android devices.

### Should Have (P1)
* **Interactive Analytics Dashboard**: Visualizations of workout frequency, volume per muscle group, and body weight trends.
* **Rest Timer**: Dynamic visual stopwatch that starts automatically after a set is marked as complete.
* **Active Workout Auto-save**: Local session persistence to prevent losing workout logs if the page is accidentally closed or refreshed.
* **1RM Calculator**: In-app calculator using Epley or Brzycki formulas.

### Could Have (P2)
* **CSV/JSON Data Export**: One-click download of all workouts and weight history.
* **Dark/Light Mode Toggle**: System-theme matching with manual override.
* **Workout Templates**: Create a structured routine template (e.g., "Push A", "Legs B") and launch a workout from it.

### Won't Have (P3) (Future Releases)
* **Social Feed**: Sharing workouts with friends or commenting on activities.
* **Wearable Integration**: Syncing heart rate or active calories with Apple Health/Google Fit.
* **Offline-First Database Sync**: Full offline queue processing (PWA offline write syncing).

---

## 5. Functional Requirements (FR)

### FR-1: User Management & Authentication
* **FR-1.1**: The system MUST allow users to authenticate using Google OAuth 2.0.
* **FR-1.2**: On initial sign-in, the system MUST automatically create a user profile record in the database.
* **FR-1.3**: The system MUST maintain user sessions securely via JWT tokens stored in HTTP-only cookies (or Supabase local storage with route middleware protection).
* **FR-1.4**: Users MUST be able to sign out securely.

### FR-2: Exercise Management
* **FR-2.1**: The system MUST supply a default list of common exercises categorized by primary muscle group (Chest, Back, Legs, Shoulders, Arms, Core).
* **FR-2.2**: Users MUST be able to create custom exercises with a name, description, and primary/secondary muscle group.
* **FR-2.3**: Custom exercises MUST only be visible to the user who created them.
* **FR-2.4**: Users MUST be able to search and filter exercises by muscle group and name.

### FR-3: Workout Tracking & Logging
* **FR-3.1**: Users MUST be able to start an empty workout session.
* **FR-3.2**: Users MUST be able to add multiple exercises to an active workout session.
* **FR-3.3**: Users MUST be able to log multiple sets per exercise, specifying: Weight, Reps, and RPE (Rate of Perceived Exertion, scale 1-10).
* **FR-3.4**: Users MUST be able to mark a set as complete.
* **FR-3.5**: Users MUST be able to delete sets or exercises from an active workout.
* **FR-3.6**: Users MUST be able to complete and save a workout session. The system will record the start time, end time, and date.

### FR-4: Weight Tracking
* **FR-4.1**: Users MUST be able to log their body weight (in kg or lbs) along with a date.
* **FR-4.2**: The system MUST prevent logging multiple weight entries for the exact same date (it will overwrite or update the existing record).
* **FR-4.3**: Users MUST be able to delete past weight logs.

### FR-5: Progress Analytics & Personal Records
* **FR-5.1**: The system MUST automatically calculate and log a Personal Record (PR) when a user beats their previous maximum weight or estimated 1-Rep Max (1RM) for a given exercise.
* **FR-5.2**: The system MUST display a visual badge/icon indicating a PR was achieved when a set is completed.
* **FR-5.3**: The system MUST generate a dashboard displaying:
  * Weight logs plotted on a line chart.
  * Total weekly volume (Weight * Reps) per muscle group.
  * Monthly workout frequency (calendar heatmap or bar chart).

---

## 6. Non-Functional Requirements (NFR)

### NFR-1: Performance & Scalability
* **Latency**: Database reads and writes MUST take less than 200ms.
* **Loading Speed**: The application landing page and dashboard MUST load in under 1.5 seconds on a 3G mobile connection.
* **Serverless Scale**: Frontend hosting on Vercel and backend on Supabase MUST scale automatically to handle traffic spikes.

### NFR-2: Usability & Accessibility
* **Responsive Breakpoints**: The interface MUST be fully functional at mobile widths (down to 320px) up to ultra-wide desktop monitors.
* **Tap Target Sizes**: Interactive buttons and inputs on mobile screens MUST have a minimum size of 44x44 pixels to facilitate sweaty-hand logging in the gym.
* **Theme**: The default styling MUST be high-contrast dark mode to ensure readability under bright gym lighting.

### NFR-3: Reliability & Data Integrity
* **Data Persistence**: Active workout state MUST be stored locally (localStorage or indexedDB) until submitted to prevent data loss on network drops.
* **Backup**: Database backups MUST be automated daily by Supabase.

### NFR-4: Security & Compliance
* **Row Level Security (RLS)**: The database MUST enforce strict RLS policies ensuring users can never read, update, or delete another user's workouts, weight logs, or custom exercises.
* **TLS Encryption**: All data in transit MUST be encrypted using HTTPS/TLS 1.3.
