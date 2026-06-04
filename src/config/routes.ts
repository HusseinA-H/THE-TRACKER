export const routes = {
  home: "/",
  login: "/login",
  authCallback: "/auth/callback",
  dashboard: "/dashboard",
  workouts: "/dashboard/workouts",
  workoutActive: "/dashboard/workouts/active",
  workoutDetail: (id: string) => `/dashboard/workouts/${id}` as const,
  exercises: "/dashboard/exercises",
  calendar: "/dashboard/calendar",
  schedule: "/dashboard/schedule",
  measurements: "/dashboard/measurements",
  photos: "/dashboard/photos",
  weight: "/dashboard/weight",
  records: "/dashboard/records",
  profile: "/dashboard/profile",
} as const;

export const publicRoutes = [routes.home, routes.login, routes.authCallback];

export const navItems = [
  { label: "Dashboard", href: routes.dashboard, icon: "LayoutDashboard" },
  { label: "Workouts", href: routes.workouts, icon: "Dumbbell" },
  { label: "Exercises", href: routes.exercises, icon: "ListChecks" },
  { label: "Calendar", href: routes.calendar, icon: "Calendar" },
  { label: "Schedule", href: routes.schedule, icon: "CalendarClock" },
  { label: "Metrics", href: routes.measurements, icon: "Activity" },
  { label: "Photos", href: routes.photos, icon: "Camera" },
  { label: "Weight", href: routes.weight, icon: "Scale" },
  { label: "Records", href: routes.records, icon: "Trophy" },
] as const;
