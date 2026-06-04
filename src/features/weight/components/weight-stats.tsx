"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus, Scale, TrendingDown, Award } from "lucide-react";
import type { WeightStats as WeightStatsType } from "../types";

interface WeightStatsProps {
  stats: WeightStatsType;
}

export function WeightStats({ stats }: WeightStatsProps) {
  const { currentWeight, change30Days, changeAllTime, minWeight, maxWeight } = stats;

  const formatDiff = (diff: number | null) => {
    if (diff === null) return "—";
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toFixed(1)} kg`;
  };

  const getDiffIcon = (diff: number | null) => {
    if (diff === null || diff === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (diff < 0) return <ArrowDown className="h-4 w-4 text-emerald-600" />;
    return <ArrowUp className="h-4 w-4 text-amber-600" />;
  };

  const getDiffClass = (diff: number | null) => {
    if (diff === null || diff === 0) return "text-muted-foreground";
    if (diff < 0) return "text-emerald-700 bg-emerald-50 border-emerald-100";
    return "text-amber-700 bg-amber-50 border-amber-100";
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {/* Current Weight */}
      <Card className="border border-border bg-card">
        <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Current Weight
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {currentWeight ? `${currentWeight.toFixed(1)}` : "—"}
            </span>
            {currentWeight && <span className="text-xs text-muted-foreground font-medium ml-1">kg</span>}
          </div>
        </CardContent>
      </Card>

      {/* 30 Day Change */}
      <Card className="border border-border bg-card">
        <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            30-Day Change
          </span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {change30Days !== null ? `${Math.abs(change30Days).toFixed(1)}` : "—"}
            </span>
            {change30Days !== null && (
              <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full flex items-center gap-0.5 ${getDiffClass(change30Days)}`}>
                {getDiffIcon(change30Days)}
                {change30Days > 0 ? "Gain" : "Loss"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Time Change */}
      <Card className="border border-border bg-card">
        <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            All-Time Change
          </span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold font-mono text-foreground">
              {changeAllTime !== null ? `${Math.abs(changeAllTime).toFixed(1)}` : "—"}
            </span>
            {changeAllTime !== null && (
              <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full flex items-center gap-0.5 ${getDiffClass(changeAllTime)}`}>
                {getDiffIcon(changeAllTime)}
                {changeAllTime > 0 ? "Gain" : "Loss"}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Min / Max Weight */}
      <Card className="border border-border bg-card">
        <CardContent className="p-4 flex flex-col justify-between h-full min-h-[100px]">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Range (Min / Max)
          </span>
          <div className="flex flex-col gap-0.5 mt-2 text-xs font-semibold text-muted-foreground font-mono">
            <div className="flex justify-between">
              <span>MIN:</span>
              <span className="text-foreground">{minWeight ? `${minWeight.toFixed(1)} kg` : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>MAX:</span>
              <span className="text-foreground">{maxWeight ? `${maxWeight.toFixed(1)} kg` : "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
