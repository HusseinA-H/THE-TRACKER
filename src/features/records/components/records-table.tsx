"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Search, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getMuscleGroupColor } from "@/features/exercises/utils/muscle-groups";
import { ExerciseSearch } from "@/features/exercises/components/exercise-search";
import { MuscleGroupFilter } from "@/features/exercises/components/muscle-group-filter";
import type { PersonalRecord } from "../types";
import type { MuscleGroup } from "@/types";

interface RecordsTableProps {
  initialRecords: PersonalRecord[];
}

export function RecordsTable({ initialRecords }: RecordsTableProps) {
  const [search, setSearch] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | "All">("All");

  const filtered = initialRecords.filter((rec) => {
    const name = rec.exercise?.name || "";
    const primary = rec.exercise?.primaryMuscleGroup || "";
    const secondary = rec.exercise?.secondaryMuscleGroup || "";

    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesMuscle =
      muscleGroup === "All" ||
      primary === muscleGroup ||
      secondary === muscleGroup;

    return matchesSearch && matchesMuscle;
  });

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500 fill-amber-100" />
            <span>Personal Records</span>
          </CardTitle>
          <CardDescription>
            Your lifetime best weight and estimated 1RM for each exercise
          </CardDescription>
        </div>
        <div className="flex w-full sm:w-auto">
          <ExerciseSearch value={search} onChange={setSearch} />
        </div>
      </CardHeader>

      <div className="px-6 pb-4 border-b border-border/40">
        <MuscleGroupFilter
          selectedGroup={muscleGroup}
          onSelect={setMuscleGroup}
        />
      </div>

      <CardContent className="p-0">
        {filtered.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Exercise</TableHead>
                <TableHead>Muscle Group</TableHead>
                <TableHead className="text-center">Max Weight</TableHead>
                <TableHead className="text-center">Estimated 1RM</TableHead>
                <TableHead className="text-right pr-6">Achieved Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="pl-6 py-3 font-semibold text-foreground">
                    {rec.exercise?.name || "Exercise"}
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium px-2 py-0.5 border ${
                        rec.exercise
                          ? getMuscleGroupColor(rec.exercise.primaryMuscleGroup)
                          : ""
                      }`}
                    >
                      {rec.exercise?.primaryMuscleGroup}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center py-3 font-bold font-mono text-foreground">
                    {rec.maxWeight.toFixed(1)} kg
                  </TableCell>
                  <TableCell className="text-center py-3 font-bold font-mono text-muted-foreground">
                    {rec.maxEstimated1rm.toFixed(1)} kg
                  </TableCell>
                  <TableCell className="text-right pr-6 py-3 font-medium text-xs text-muted-foreground">
                    {formatDate(rec.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
            <Star className="h-8 w-8 text-muted-foreground/40" />
            <p>No personal records match your filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
