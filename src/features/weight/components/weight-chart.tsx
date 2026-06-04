"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { formatDate } from "@/lib/utils";
import type { WeightLog } from "../types";

interface WeightChartProps {
  logs: WeightLog[];
}

type Period = "7d" | "30d" | "90d" | "all";

export function WeightChart({ logs }: WeightChartProps) {
  const [period, setPeriod] = useState<Period>("30d");

  if (logs.length === 0) {
    return null;
  }

  // Filter logs based on chosen period
  const filterLogsByPeriod = () => {
    const sorted = [...logs].sort((a, b) => a.logDate.localeCompare(b.logDate));
    if (period === "all") return sorted;

    const cutOffDate = new Date();
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    cutOffDate.setDate(cutOffDate.getDate() - days);
    const cutOffStr = cutOffDate.toISOString().split("T")[0];

    return sorted.filter((log) => log.logDate >= cutOffStr);
  };

  const chartData = filterLogsByPeriod();

  // Find min/max weight to set dynamic Y-Axis bounds
  const weights = chartData.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const yBuffer = 1; // 1kg buffer top and bottom
  const yDomain = [
    Math.max(0, Math.floor(minWeight - yBuffer)),
    Math.ceil(maxWeight + yBuffer),
  ];

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold">Weight Trend</CardTitle>
          <CardDescription>Visual progress of body weight changes</CardDescription>
        </div>
        <div className="flex gap-1.5 self-start sm:self-auto bg-muted p-1 rounded-lg border border-border/10">
          {(["7d", "30d", "90d", "all"] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod(p)}
              className="h-7 px-2.5 text-xs font-semibold uppercase"
            >
              {p}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="logDate"
                  tickFormatter={(str) => {
                    const date = new Date(str);
                    return date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  domain={yDomain}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as WeightLog;
                      return (
                        <div className="rounded-lg border border-border bg-background p-2.5 shadow-md">
                          <p className="text-xs font-semibold text-muted-foreground">
                            {formatDate(data.logDate)}
                          </p>
                          <p className="text-sm font-bold text-foreground mt-0.5">
                            {data.weight.toFixed(1)} kg
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="currentColor"
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 1 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  className="text-foreground"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[280px] w-full items-center justify-center text-sm text-muted-foreground">
            No entries for this period.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
