# UI/UX Guidelines

This document outlines the visual design system, accessibility rules, color palettes, and interactive behaviors for **THE TRACKER**.

---

## 1. Design Philosophy: The Gym Environment

People using "THE TRACKER" are physically active, often holding a phone in one hand while standing, walking between equipment, or recovering from high-intensity sets. This environment dictates specific design choices:

1. **High-Contrast Dark Mode First**: Gyms are either dimly lit or flooded with overhead fluorescence. A deep, high-contrast dark theme minimizes eye strain and remains readable under direct glare.
2. **Fatigue-Resilient Touch Targets**: Users may have sweaty hands, trembling fingers, or be wearing lifting straps. Tap targets must be large and forgiving.
3. **Micro-Feedback**: Logging a set or hitting a PR should feel rewarding. Smooth, hardware-accelerated animations (using Tailwind transitions) provide immediate satisfaction.

---

## 2. Color Palette & Typography

The design features a premium, modern slate-and-emerald palette utilizing HSL variables mapping cleanly to Tailwind CSS.

### Color Swatches (HSL)

| Color Name | HSL Value | Hex (Approx) | Purpose |
| :--- | :--- | :--- | :--- |
| **Background (Dark)** | `hsl(222.2, 84%, 4.9%)` | `#020617` | Base body color. Deep, obsidian background. |
| **Card / Surface** | `hsl(222.2, 47.4%, 11.2%)` | `#0f172a` | Panel blocks, workout logs, lists. |
| **Primary Accent (Emerald)**| `hsl(142.1, 70.6%, 45.3%)` | `#10b981` | Interactive elements, active states, PR badges. |
| **Secondary Accent** | `hsl(217.2, 91.2%, 59.8%)` | `#3b82f6` | Weight log charts, links, navigation items. |
| **Destructive / Delete**| `hsl(0, 84.2%, 60.2%)` | `#ef4444` | Remove set, delete workout buttons. |
| **Muted Text** | `hsl(215.4, 16.3%, 56.9%)` | `#64748b` | Subheadings, previous stats labels, unit details. |

### Typography Rules

* **Primary Font**: **Geist Sans** or **Inter** (sans-serif) for high legibility on small screens.
* **Secondary Font (Numbers)**: **JetBrains Mono** or **Roboto Mono** (monospace) for logging weights, reps, and showing the rest timer, preventing numerical alignment shifting.

---

## 3. Responsive Breakpoints & Ergonomic Layout

### Breakpoint Matrix
* **Mobile (320px - 640px)**: Default view. Core navigation is placed in a sticky bottom tab bar for easy single-thumb reach.
* **Tablet (641px - 1024px)**: Transition to a split-screen view: Left-side active logging panel, right-side exercise description or historical logs.
* **Desktop (1025px+)**: Dashboard format with sidebar navigation, exposing multi-column analytics, interactive charts, and routine managers side-by-side.

### Bottom Navigation Bar (Mobile Ergonomics)
On screens smaller than `640px`, the header is kept minimal (profile icon + notifications). Navigation is placed entirely in a bottom sticky tab bar:

```
+-------------------------------------------------+
|                                                 |
|    [Dashboard]   [Log Session]   [Analytics]     |
|       (Home)       (Weights)       (Charts)     |
|                                                 |
+-------------------------------------------------+
```

---

## 4. Input Safety & Tap-target Standards

### Target Sizing
* **Minimum Target Area**: Every button, input box, and checkbox MUST have a minimum tap area of **44x44 pixels**.
* **Spacing**: An 8px (or `space-y-2`) safety buffer must exist between active buttons to prevent accidental clicks.

### Weight & Rep Input Layout (Logging Cards)
Instead of forcing the user to tap tiny text input boxes and use the keyboard, input fields use a customized number spinner design:

```
[ - ]  [ 80.0 kg ]  [ + ]     [ - ]  [ 8 reps ]  [ + ]  [ Check ]
```
* **Minus/Plus Buttons**: Tap to adjust weight by 2.5kg/5lbs or reps by 1.
* **Direct Input**: Tapping the center value opens a numeric-only virtual keyboard (`inputmode="decimal"` or `type="number"`).

---

## 5. Micro-Animations & Transitions

All state changes use CSS transitions with a duration of `150ms` and `cubic-bezier(0.4, 0, 0.2, 1)`:
* **Checkbox Toggle**: Checkmarks transition from scale-0 to scale-100 with a slight bounce.
* **PR Notification**: Achieving a personal record triggers a brief wave of confetti particles restricted to the set card area, accompanied by a glowing emerald border pulse.
* **Rest Timer Countdown**: The timer bar fills horizontally with a smooth transition, blinking red in the final 5 seconds.
