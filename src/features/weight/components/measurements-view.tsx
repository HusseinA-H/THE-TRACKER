"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, TrendingDown, TrendingUp, Ruler, Calendar, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { logMeasurementAction, deleteMeasurementAction } from "../actions";
import type { BodyMeasurement } from "@/types";
import { formatDate } from "@/lib/utils";

interface MeasurementsViewProps {
  initialHistory: BodyMeasurement[];
}

export function MeasurementsView({ initialHistory }: MeasurementsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [history, setHistory] = useState<BodyMeasurement[]>(initialHistory);

  // Form State
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [shoulders, setShoulders] = useState("");
  const [arms, setArms] = useState("");
  const [forearms, setForearms] = useState("");
  const [thighs, setThighs] = useState("");
  const [calves, setCalves] = useState("");

  // Chart Metric Selector
  const [chartMetric, setChartMetric] = useState<"weight" | "waist" | "arms" | "chest">("weight");

  // Calculate stats (comparison over time)
  const getChangeStats = (metric: keyof Omit<BodyMeasurement, "id" | "userId" | "createdAt" | "logDate">) => {
    const validLogs = history
      .filter((h) => h[metric] !== null)
      .sort((a, b) => a.logDate.localeCompare(b.logDate));

    if (validLogs.length < 2) return { diff: 0, trend: "neutral" };
    const first = Number(validLogs[0][metric]);
    const last = Number(validLogs[validLogs.length - 1][metric]);
    const diff = last - first;
    return {
      diff: Number(diff.toFixed(2)),
      trend: diff < 0 ? "down" : diff > 0 ? "up" : "neutral",
    };
  };

  const weightStats = getChangeStats("weight");
  const waistStats = getChangeStats("waist");
  const armStats = getChangeStats("arms");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      logDate,
      weight: weight ? parseFloat(weight) : null,
      waist: waist ? parseFloat(waist) : null,
      chest: chest ? parseFloat(chest) : null,
      shoulders: shoulders ? parseFloat(shoulders) : null,
      arms: arms ? parseFloat(arms) : null,
      forearms: forearms ? parseFloat(forearms) : null,
      thighs: thighs ? parseFloat(thighs) : null,
      calves: calves ? parseFloat(calves) : null,
    };

    if (!payload.weight && !payload.waist && !payload.chest && !payload.arms) {
      toast.error("Please enter at least one measurement value.");
      return;
    }

    const toastId = toast.loading("Logging measurements...");
    try {
      const result = await logMeasurementAction(payload);
      if (result.success) {
        toast.success("Measurements recorded", { id: toastId });
        
        // Update local state history
        setHistory((prev) => {
          const filtered = prev.filter((item) => item.logDate !== logDate);
          return [result.data, ...filtered].sort((a, b) => b.logDate.localeCompare(a.logDate));
        });

        // Reset fields
        setWeight("");
        setWaist("");
        setChest("");
        setShoulders("");
        setArms("");
        setForearms("");
        setThighs("");
        setCalves("");
      } else {
        toast.error(result.error || "Failed to log measurements", { id: toastId });
      }
    } catch (err: any) {
      toast.error("An error occurred during submission", { id: toastId });
    }
  };

  const handleDelete = async (id: string, date: string) => {
    if (!confirm(`Delete measurement log for ${formatDate(date)}?`)) return;

    const toastId = toast.loading("Deleting record...");
    try {
      const result = await deleteMeasurementAction(id);
      if (result.success) {
        toast.success("Record deleted", { id: toastId });
        setHistory((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(result.error || "Failed to delete record", { id: toastId });
      }
    } catch (err) {
      toast.error("An error occurred", { id: toastId });
    }
  };

  // Format Recharts data (sort ascending for plotting)
  const chartData = [...history]
    .sort((a, b) => a.logDate.localeCompare(b.logDate))
    .map((item) => ({
      date: formatDate(item.logDate),
      weight: item.weight || undefined,
      waist: item.waist || undefined,
      arms: item.arms || undefined,
      chest: item.chest || undefined,
    }));

  return (
    <div className="space-y-6">
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Weight Trend */}
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight Trend (All Time)</p>
              <p className="text-2xl font-bold mt-1">
                {history[0]?.weight ? `${history[0].weight} kg` : "—"}
              </p>
            </div>
            <div className={`p-2 rounded-xl border ${
              weightStats.trend === "down"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : weightStats.trend === "up"
                ? "bg-red-500/10 border-red-500/20 text-red-600"
                : "bg-muted border-border text-muted-foreground"
            }`}>
              {weightStats.trend === "down" ? (
                <div className="flex items-center text-xs font-bold gap-1">
                  <TrendingDown className="h-4 w-4" /> {weightStats.diff} kg
                </div>
              ) : weightStats.trend === "up" ? (
                <div className="flex items-center text-xs font-bold gap-1">
                  <TrendingUp className="h-4 w-4" /> +{weightStats.diff} kg
                </div>
              ) : (
                <span className="text-xs font-bold">Stable</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Waist Trend */}
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Waist Circumference</p>
              <p className="text-2xl font-bold mt-1">
                {history[0]?.waist ? `${history[0].waist} cm` : "—"}
              </p>
            </div>
            <div className={`p-2 rounded-xl border ${
              waistStats.trend === "down"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : waistStats.trend === "up"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-600"
                : "bg-muted border-border text-muted-foreground"
            }`}>
              {waistStats.trend === "down" ? (
                <div className="flex items-center text-xs font-bold gap-1">
                  <TrendingDown className="h-4 w-4" /> {waistStats.diff} cm
                </div>
              ) : waistStats.trend === "up" ? (
                <div className="flex items-center text-xs font-bold gap-1">
                  <TrendingUp className="h-4 w-4" /> +{waistStats.diff} cm
                </div>
              ) : (
                <span className="text-xs font-bold">Stable</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Arm Trend */}
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Arm Circumference</p>
              <p className="text-2xl font-bold mt-1">
                {history[0]?.arms ? `${history[0].arms} cm` : "—"}
              </p>
            </div>
            <div className={`p-2 rounded-xl border ${
              armStats.trend === "up"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : armStats.trend === "down"
                ? "bg-amber-500/10 border-amber-500/20 text-amber-600"
                : "bg-muted border-border text-muted-foreground"
            }`}>
              {armStats.trend === "up" ? (
                <div className="flex items-center text-xs font-bold gap-1">
                  <TrendingUp className="h-4 w-4" /> +{armStats.diff} cm
                </div>
              ) : armStats.trend === "down" ? (
                <div className="flex items-center text-xs font-bold gap-1">
                  <TrendingDown className="h-4 w-4" /> {armStats.diff} cm
                </div>
              ) : (
                <span className="text-xs font-bold">Stable</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Form: Entry Input (1/3 width) */}
        <Card className="border border-border bg-card shadow-sm h-fit">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-semibold flex items-center gap-1.5">
              <Ruler className="h-4.5 w-4.5 text-primary" /> Log Body Metrics
            </CardTitle>
            <CardDescription>Enter values in kg (weight) or cm (circumferences).</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="log-date" className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Date
                </Label>
                <Input
                  id="log-date"
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="h-10 font-mono text-sm bg-background border-border"
                  required
                />
              </div>

              {/* Grid values */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="m-weight" className="text-xs font-bold text-muted-foreground uppercase">Weight (kg)</Label>
                  <Input id="m-weight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.0" className="h-9 font-mono bg-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-waist" className="text-xs font-bold text-muted-foreground uppercase">Waist (cm)</Label>
                  <Input id="m-waist" type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="0.0" className="h-9 font-mono bg-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-chest" className="text-xs font-bold text-muted-foreground uppercase">Chest (cm)</Label>
                  <Input id="m-chest" type="number" step="0.1" value={chest} onChange={(e) => setChest(e.target.value)} placeholder="0.0" className="h-9 font-mono bg-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-shoulders" className="text-xs font-bold text-muted-foreground uppercase">Shoulders (cm)</Label>
                  <Input id="m-shoulders" type="number" step="0.1" value={shoulders} onChange={(e) => setShoulders(e.target.value)} placeholder="0.0" className="h-9 font-mono bg-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-arms" className="text-xs font-bold text-muted-foreground uppercase">Arms (cm)</Label>
                  <Input id="m-arms" type="number" step="0.1" value={arms} onChange={(e) => setArms(e.target.value)} placeholder="0.0" className="h-9 font-mono bg-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-forearms" className="text-xs font-bold text-muted-foreground uppercase">Forearms (cm)</Label>
                  <Input id="m-forearms" type="number" step="0.1" value={forearms} onChange={(e) => setForearms(e.target.value)} placeholder="0.0" className="h-9 font-mono bg-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-thighs" className="text-xs font-bold text-muted-foreground uppercase">Thighs (cm)</Label>
                  <Input id="m-thighs" type="number" step="0.1" value={thighs} onChange={(e) => setThighs(e.target.value)} placeholder="0.0" className="h-9 font-mono bg-background border-border" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="m-calves" className="text-xs font-bold text-muted-foreground uppercase">Calves (cm)</Label>
                  <Input id="m-calves" type="number" step="0.1" value={calves} onChange={(e) => setCalves(e.target.value)} placeholder="0.0" className="h-9 font-mono bg-background border-border" />
                </div>
              </div>

              <Button type="submit" className="w-full h-10 mt-2 font-semibold">
                <Plus className="h-4 w-4 mr-1.5" /> Record Log
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Charts and History (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          {/* Chart Card */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Metrics Chart</CardTitle>
                <CardDescription>Visualize trends and recomposition changes.</CardDescription>
              </div>
              {/* Metric Select Pills */}
              <div className="flex bg-muted p-0.5 rounded-lg border border-border/50 gap-0.5">
                {(["weight", "waist", "arms", "chest"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setChartMetric(m)}
                    className={`px-2.5 py-1 text-[10px] font-bold capitalize rounded-md transition-all ${
                      chartMetric === m
                        ? "bg-background text-foreground shadow-xs font-extrabold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {chartData.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f020" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={["auto", "auto"]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={chartMetric}
                        stroke="hsl(var(--primary))"
                        strokeWidth={2.5}
                        activeDot={{ r: 6 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 w-full flex items-center justify-center text-muted-foreground border border-dashed rounded-2xl">
                  <span className="text-xs">No chart logs available yet.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History Card */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-base font-semibold">Measurement Logs History</CardTitle>
              <CardDescription>Review past measurements and delete logs.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-3 py-2.5">Weight</th>
                      <th className="px-3 py-2.5">Waist</th>
                      <th className="px-3 py-2.5">Arms</th>
                      <th className="px-3 py-2.5">Chest</th>
                      <th className="px-3 py-2.5">Thighs</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length > 0 ? (
                      history.map((log) => (
                        <tr key={log.id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-semibold text-foreground">{formatDate(log.logDate)}</td>
                          <td className="px-3 py-3 font-mono">{log.weight ? `${log.weight} kg` : "—"}</td>
                          <td className="px-3 py-3 font-mono">{log.waist ? `${log.waist} cm` : "—"}</td>
                          <td className="px-3 py-3 font-mono">{log.arms ? `${log.arms} cm` : "—"}</td>
                          <td className="px-3 py-3 font-mono">{log.chest ? `${log.chest} cm` : "—"}</td>
                          <td className="px-3 py-3 font-mono">{log.thighs ? `${log.thighs} cm` : "—"}</td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(log.id, log.logDate)}
                              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-muted-foreground text-xs font-medium">
                          No logged measurements found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
