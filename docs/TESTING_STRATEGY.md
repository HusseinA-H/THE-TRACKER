# Testing Strategy

This document details the testing architecture, frameworks, and testing execution plans designed to maintain high code quality and prevent regressions in **THE TRACKER**.

---

## 1. The Testing Pyramid

Our verification workflow follows the standard three-tier testing pyramid:

```
    / \
   /   \     End-to-End (Playwright) - Core user flows, auth redirect, offline state.
  / E2E \    ~15% of total test coverage.
 /-------\
/  INTEG  \  Integration (Vitest) - Server Actions, database constraints, trigger evaluation.
/-----------\ ~35% of total test coverage.
/    UNIT     \ Unit (Vitest + RTL) - 1RM math formulas, formatting helper scripts, components.
/---------------\ ~50% of total test coverage.
```

---

## 2. Unit Testing (Vitest)

Unit tests focus on isolated helpers and pure functions. This includes the Epley formula math engine and local storage sync hooks.

* **Target Directory**: `__tests__/unit/`
* **Command**: `npm run test:unit`

### Example Test: 1RM Math Engine (`__tests__/unit/math.test.ts`)
```typescript
import { describe, it, expect } from 'vitest';
import { calculateEstimated1RM } from '@/lib/utils/math';

describe('calculateEstimated1RM', () => {
  it('should return correct 1RM for single rep sets', () => {
    expect(calculateEstimated1RM(100, 1)).toBe(100);
  });

  it('should calculate estimated 1RM using Epley formula for multi-rep sets', () => {
    // Epley: 100 * (1 + 5 / 30) = 116.67
    expect(calculateEstimated1RM(100, 5)).toBeCloseTo(116.67, 2);
  });

  it('should handle zero reps safely', () => {
    expect(calculateEstimated1RM(100, 0)).toBe(0);
  });

  it('should handle decimal weights correctly', () => {
    // Epley: 82.5 * (1 + 10 / 30) = 110
    expect(calculateEstimated1RM(82.5, 10)).toBe(110);
  });
});
```

---

## 3. Integration Testing (Vitest + MSW)

Integration tests verify that React Client components correctly handle and map API parameters, loading states, and error responses.

* **Target Directory**: `__tests__/integration/`
* **Command**: `npm run test:integration`

### Example Mock Server Action Test (`__tests__/integration/weight-form.test.tsx`)
We mock the Supabase client response behavior to ensure the weight logging form renders validation states correctly:

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WeightForm } from '@/components/weight/weight-form';
import * as actions from '@/app/actions/weight';

vi.mock('@/app/actions/weight', () => ({
  logBodyWeight: vi.fn(),
}));

describe('<WeightForm />', () => {
  it('triggers form validation error on negative weight input', async () => {
    render(<WeightForm />);
    
    const input = screen.getByPlaceholderText('0.0');
    const submitBtn = screen.getByRole('button', { name: /save/i });
    
    fireEvent.change(input, { target: { value: '-5' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Weight must be a positive number/i)).toBeInTheDocument();
    expect(actions.logBodyWeight).not.toHaveBeenCalled();
  });
});
```

---

## 4. End-to-End (E2E) Testing (Playwright)

E2E tests run in headless browsers (Chromium, Firefox, WebKit) simulating complete user sessions, verifying authentication cookies and local cache persistence.

* **Target Directory**: `tests/e2e/`
* **Command**: `npx playwright test`

### Example E2E Test: Workout Log Flow (`tests/e2e/workout.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test.describe('Active Workout Logging Journey', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Log in via mock auth page setup
    await page.goto('/login');
    await page.click('text=Bypass with Developer Account');
    await expect(page).toHaveURL('/dashboard');
  });

  test('successfully starts, logs, and completes a workout session', async ({ page }) => {
    // 2. Start workout
    await page.click('text=Start Empty Workout');
    await expect(page).toHaveURL('/workout/active');

    // 3. Add Squat exercise
    await page.click('text=Add Exercise');
    await page.fill('[placeholder="Search exercises..."]', 'Squat');
    await page.click('text=Squat (Barbell)');
    await page.click('text=Add Selected');

    // 4. Fill in weights and reps
    const weightInput = page.locator('input[placeholder="0.0"]').first();
    const repsInput = page.locator('input[placeholder="0"]').first();
    
    await weightInput.fill('100');
    await repsInput.fill('5');

    // 5. Complete set and verify rest timer launches
    await page.click('button:has-text("✓")');
    await expect(page.locator('text=Rest Timer')).toBeVisible();

    // 6. Complete and save session
    await page.click('text=Finish Workout');
    await expect(page).toHaveURL(/\/workout\/history/);
    await expect(page.locator('text=Squat (Barbell)')).toBeVisible();
  });
});
```
