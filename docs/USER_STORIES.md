# User Stories

This document outlines the user stories and their associated acceptance criteria written in Gherkin syntax (`Given-When-Then`) for verification and testing.

---

## 1. Authentication & Onboarding

### Story US-1: Google OAuth Authentication
> **As a** new or returning user,  
> **I want to** sign in to the application using my Google account,  
> **So that** I don't have to create and memorize another username and password.

#### Acceptance Criteria
* **Scenario: Successful Sign-In & Profile Creation**
  * **Given** a user is on the Login page (`/login`) and is unauthenticated,
  * **When** they click the "Sign in with Google" button,
  * **And** they authorize the application on the Google login portal,
  * **Then** they should be redirected back to the application `/dashboard`,
  * **And** a new profile record must be created in the `profiles` database table (if it is their first login).

---

## 2. Exercise Management

### Story US-2: Search & Filter Exercise Library
> **As a** gym member,  
> **I want to** search for exercises by name and filter by muscle group,  
> **So that** I can quickly find the exact exercise I need to perform.

#### Acceptance Criteria
* **Scenario: Filtering by Muscle Group**
  * **Given** a user is viewing the exercise selection library,
  * **When** they tap the "Legs" muscle group badge,
  * **Then** the list should filter to display only exercises targeting the leg muscles (e.g., Squats, Leg Extensions).

* **Scenario: Case-Insensitive Name Search**
  * **Given** a user is viewing the exercise selection library,
  * **When** they type "bench" into the search bar,
  * **Then** the list should display "Bench Press (Barbell)", "Incline Bench Press (Dumbbell)", and other matching items, regardless of character casing.

---

### Story US-3: Create Custom Exercises
> **As a** lifter with a custom routine,  
> **I want to** create a custom exercise that isn't in the default library,  
> **So that** I can track my niche movements accurately.

#### Acceptance Criteria
* **Scenario: Successful Creation of a Custom Exercise**
  * **Given** a user is authenticated and clicks the "+ Create Exercise" button,
  * **When** they fill out the modal form with Name "Cable Pull-Throughs" and Muscle Group "Glutes",
  * **And** click "Save",
  * **Then** the exercise should be added to their personal exercise library,
  * **And** it must not be visible to any other authenticated user.

---

## 3. Workout Tracking

### Story US-4: Log a Workout Session
> **As a** lifter in the gym,  
> **I want to** start a workout, add exercises, and log sets with weight and reps,  
> **So that** I can log my progress in real time.

#### Acceptance Criteria
* **Scenario: Logging a Set and Triggering Rest Timer**
  * **Given** a user has started an active workout and added "Bench Press",
  * **When** they enter "80" in the weight column and "8" in the reps column,
  * **And** click the set completion checkbox,
  * **Then** the set should be marked as completed,
  * **And** the visual rest timer should launch and count down from 90 seconds.

* **Scenario: Workout Session Auto-Save**
  * **Given** a user is logging an active workout,
  * **When** they close the browser tab or refresh the page,
  * **Then** reopening the application should restore their workout state (exercises, sets, inputs) exactly as it was.

---

## 4. Progress Analytics & Personal Records

### Story US-5: Automatic Personal Record Detection
> **As a** competitive lifter,  
> **I want the app to** notify me when I hit a personal record,  
> **So that** I feel motivated and can easily track my peak strength.

#### Acceptance Criteria
* **Scenario: Hitting a 1-Rep Max PR**
  * **Given** a user's previous estimated 1-Rep Max for deadlifts is 150kg,
  * **When** they log a completed deadlift set of 140kg for 4 reps (estimating a 1RM of $140 \times (1 + 4/30) = 158.67\text{kg}$),
  * **Then** the UI should trigger a confetti animation on the set row,
  * **And** the database record for that set should be stored with `is_pr = true`.

---

## 5. Weight Tracking

### Story US-6: Track Body Weight Over Time
> **As an** athlete monitoring my body composition,  
> **I want to** record my daily body weight and view it on a chart,  
> **So that** I can adjust my nutrition and track weight trends.

#### Acceptance Criteria
* **Scenario: Logging and Overwriting Weight**
  * **Given** a user has already logged a weight of "85.2 kg" for June 3rd,
  * **When** they attempt to log a weight of "84.9 kg" for the same date (June 3rd),
  * **Then** the application should prompt/automatically update the existing log to "84.9 kg",
  * **And** there should only be a single data point representing June 3rd on the weight chart.
