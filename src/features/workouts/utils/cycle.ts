import { differenceInCalendarDays, parseISO } from "date-fns";

export const CYCLE_DAYS = [
  { index: 0, name: "Upper A", isRest: false },
  { index: 1, name: "Lower A", isRest: false },
  { index: 2, name: "Rest", isRest: true },
  { index: 3, name: "Upper B", isRest: false },
  { index: 4, name: "Lower B", isRest: false },
  { index: 5, name: "Rest", isRest: true },
  { index: 6, name: "Upper C", isRest: false },
  { index: 7, name: "Rest", isRest: true },
  { index: 8, name: "Cardio + Abs", isRest: false },
  { index: 9, name: "Rest", isRest: true },
] as const;

export function calculateCycleDay(dateStr: string, cycleStartDateStr: string) {
  const date = parseISO(dateStr);
  const cycleStart = parseISO(cycleStartDateStr);
  
  const diffInDays = differenceInCalendarDays(date, cycleStart);
  const cycleIndex = ((diffInDays % 10) + 10) % 10;
  
  return CYCLE_DAYS[cycleIndex];
}
