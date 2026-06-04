"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Users, Dumbbell, BarChart2, Scale } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AnalyticsData {
  userGrowth: { date: string; users: number }[];
  workoutActivity: { date: string; workouts: number }[];
  mostUsedExercises: { name: string; count: number }[];
  weightLogStats: { date: string; averageWeight: number }[];
}

interface AdminAnalyticsDashboardProps {
  data: AnalyticsData;
}

export function AdminAnalyticsDashboard({ data }: AdminAnalyticsDashboardProps) {
  const { userGrowth, workoutActivity, mostUsedExercises, weightLogStats } = data;

  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* 1. User Growth Area Chart */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <span>User Signups & Growth</span>
            </CardTitle>
            <CardDescription>Cumulative athlete profile creation count</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {userGrowth.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={userGrowth}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(99, 102, 241)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="rgb(99, 102, 241)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-background p-2.5 shadow-md text-xs">
                            <p className="font-semibold text-muted-foreground">
                              {formatDate(payload[0].payload.date)}
                            </p>
                            <p className="font-bold text-foreground mt-0.5">
                              {payload[0].value} Registered Users
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="rgb(99, 102, 241)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[280px] w-full items-center justify-center text-xs text-muted-foreground">
              No user growth data available.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Workout Activity Bar Chart */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-violet-500" />
              <span>Workout Volume Activity</span>
            </CardTitle>
            <CardDescription>Daily number of completed training sessions</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {workoutActivity.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={workoutActivity}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-background p-2.5 shadow-md text-xs">
                            <p className="font-semibold text-muted-foreground">
                              {formatDate(payload[0].payload.date)}
                            </p>
                            <p className="font-bold text-foreground mt-0.5">
                              {payload[0].value} Workouts Logged
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="workouts"
                    fill="rgb(139, 92, 246)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[280px] w-full items-center justify-center text-xs text-muted-foreground">
              No workout completions recorded.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Most Popular Exercises Horizontal Bar Chart */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-emerald-500" />
              <span>Exercise Popularity</span>
            </CardTitle>
            <CardDescription>Most frequently selected exercises in workout entries</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {mostUsedExercises.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mostUsedExercises}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={9}
                    tickLine={false}
                    axisLine={false}
                    width={90}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-background p-2.5 shadow-md text-xs">
                            <p className="font-bold text-foreground">
                              {payload[0].payload.name}
                            </p>
                            <p className="text-muted-foreground mt-0.5">
                              Logged {payload[0].value} times
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="rgb(16, 185, 129)"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[280px] w-full items-center justify-center text-xs text-muted-foreground">
              No exercise tracking history found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Average Logged Weight Line Chart */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-500" />
              <span>Weight Logs Trend</span>
            </CardTitle>
            <CardDescription>Average body weight (kg) logged over time</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {weightLogStats.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weightLogStats}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    domain={["dataMin - 2", "dataMax + 2"]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border border-border bg-background p-2.5 shadow-md text-xs">
                            <p className="font-semibold text-muted-foreground">
                              {formatDate(payload[0].payload.date)}
                            </p>
                            <p className="font-bold text-foreground mt-0.5">
                              Average: {payload[0].value} kg
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="averageWeight"
                    stroke="rgb(245, 158, 11)"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[280px] w-full items-center justify-center text-xs text-muted-foreground">
              No weight logs recorded in database.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
