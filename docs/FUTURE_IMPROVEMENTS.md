# Future Improvements

This document lists planned future expansions, integrations, and architectural upgrades for **THE TRACKER**.

---

## 1. PWA & Offline-First Database Sync (P0 Priority for v2)

### The Challenge
Gyms are often located in concrete basements with poor cellular signals. While the current app caches active sessions in `localStorage`, users cannot search the exercise library or view historical trends offline.

### Proposed Architecture
* **Service Workers**: Implement Next-PWA to cache static app shells, page routes, and stylesheets.
* **IndexedDB Database (RxDB or Dexie)**: Build a local database inside the browser.
* **Synchronization Worker**:
  ```
  [UI Actions] ---> [Write to Browser IndexedDB]
                           |
                           v
                   [Check Online State]
                   /                 \
            (Online)                (Offline)
               /                         \
    [Push immediately to Supabase]   [Queue write & sync when connection returns]
  ```

---

## 2. AI Workout Copilot

By integrating LLM APIs (such as Gemini or OpenAI) via Edge functions, we can turn raw training data into personalized coaching guidance.

### Features
1. **Dynamic Increment Suggestion**: Look at a user's logged set (e.g., Squat: 100kg for 5 reps at RPE 7) and mathematically suggest the next training weight using RPE metrics.
2. **AI Routine Builder**: A chat dialog allowing users to type: *"I have a minor shoulder tweak and want a 4-day lower-body focused block,"* generating a custom routine template.
3. **Form Feedback**: Using webcams to record lifts, running local MediaPipe pose tracking, and advising on barbell path consistency.

---

## 3. Wearable Device Integrations

Track physiological metrics during workouts to correlate training intensity with biological stress.

### Platforms
* **Apple Watch (HealthKit)**: Track heart rate variability, active calorie expenditure, and workout duration directly inside iOS client sessions.
* **Garmin & WHOOP API**: Pull daily sleep quality and recovery scores, overlaying them onto the training analytics dashboard to help users decide if they should push for PRs.

---

## 4. Coaching Portal (B2B SaaS Extension)

Extend the application's single-user bounds into a multi-sided marketplace.

### Functional Roles
* **Coach Dashboard**: An administrative portal to create workout schedules, assign weight percentages based on clients' 1RMs, and leave text feedback on logged sets.
* **Client Interface**: Automatically shows assigned workouts for the day, uploading videos directly to Supabase Storage for their coach to review.
