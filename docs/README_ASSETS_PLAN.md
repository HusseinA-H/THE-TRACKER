# README Assets Plan
## Recommended Screenshots for THE TRACKER

This document outlines every screenshot recommended for the README.

All screenshots should be saved to: `the-tracker/public/screenshots/`

---

## Screenshot List

| File | Route | Viewport | Description |
|------|-------|----------|-------------|
| `landing.png` | `/` | 1440px | Hero section with tagline, feature bullet list, Google sign-in CTA |
| `dashboard.png` | `/dashboard` | 1280px | Stats cards: current weight, last workout, total PRs, weekly activity heatmap |
| `exercises.png` | `/dashboard/exercises` | 1280px | Exercise library table: Name · Category · Primary Muscle. Show search active |
| `workouts.png` | `/dashboard/workouts` | 1280px | 6 template cards in grid layout. Show Upper A card in focus |
| `active-workout.png` | `/dashboard/workouts/active` | 1280px | Live session with 3+ exercises loaded, progression hints visible, rest timer running |
| `exercise-drawer.png` | `/dashboard/exercises` | 1280px | Exercise detail drawer open on right side. Show History tab with data |
| `weight.png` | `/dashboard/weight` | 1280px | Recharts line graph with data + log form on left + history table |
| `records.png` | `/dashboard/records` | 1280px | Personal records table with exercise name, max weight, estimated 1RM |
| `calendar.png` | `/dashboard/calendar` | 1280px | Month grid with colour-coded days: green (completed), red (missed), grey (rest) |
| `measurements.png` | `/dashboard/measurements` | 1280px | Stats cards top row, chart in center, measurement history table |
| `schedule.png` | `/dashboard/schedule` | 1280px | Rolling 10-day cycle view with today highlighted |
| `admin.png` | `/administration` | 1280px | Admin dashboard tabs: Overview tab showing user/workout/exercise counts |
| `admin-alternatives.png` | `/administration` | 1280px | Alternatives tab with base exercise selected and alt dropdowns visible |
| `admin-videos.png` | `/administration` | 1280px | Videos tab showing exercise table with URL input fields |

---

## Screenshot Guidelines

### Capture Settings
- **Browser:** Chrome or Edge (latest stable)
- **Viewport Width:** 1280px minimum (1440px preferred for hero)
- **Device Scale:** 1x (no retina scaling)
- **Format:** PNG
- **Quality:** Lossless

### Content Requirements
- Use **real training data** — do not use empty states
- Log at least **5 workouts** before taking screenshots
- Add **body weight logs** for the chart to show a trend line
- Set **at least 3 PRs** before capturing the records page
- Configure the **schedule start date** so the calendar shows a mix of states

### Dark Mode
- All screenshots should be taken in **dark mode** (default theme)
- Dark mode better communicates the premium design aesthetic

### What to Show
- **Active Workout**: Show the PR badge firing on a completed set
- **Exercise Drawer**: Show the History tab with at least 3 previous entries
- **Calendar**: Capture a month that has completed, missed, and rest days all visible
- **Admin Panel**: Show the overview stats with non-zero numbers

---

## Badge Assets

The README uses Shields.io badges — no local assets required:

```
https://img.shields.io/badge/Next.js-16.2.7-black?...
https://img.shields.io/badge/React-19-61DAFB?...
https://img.shields.io/badge/TypeScript-5-3178C6?...
https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?...
```

---

## Logo

The project logo is located at: `the-tracker/public/logo.png`

The README references it with:
```markdown
<img src="public/logo.png" alt="THE TRACKER Logo" width="120" height="120" />
```

If the logo needs updating, replace `public/logo.png` keeping the same filename.

---

## Mermaid Diagrams

The README includes inline Mermaid diagrams rendered by GitHub:

1. **ERD** — `erDiagram` showing all 12 tables and relationships
2. **Auth Flow** — `sequenceDiagram` showing Google OAuth → profile creation
3. **Feature Architecture** — `graph TD` showing feature module structure
4. **Application Architecture** — ASCII art diagram for broader visual context

GitHub renders Mermaid natively in markdown files — no external images required.
