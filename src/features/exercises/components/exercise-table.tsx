"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  ExternalLink,
  Lock,
} from "lucide-react";
import type { Exercise } from "../types";

export type SortField = "name" | "category" | "primaryMuscleGroup";
export type SortDirection = "asc" | "desc";

interface ExerciseTableProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
}

export function ExerciseTable({
  exercises,
  onSelect,
}: ExerciseTableProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedExercises = useMemo(() => {
    const data = [...exercises];
    return data.sort((a, b) => {
      let valA = a[sortField] || "";
      let valB = b[sortField] || "";

      // String comparison
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [exercises, sortField, sortDirection]);

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-40 hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-2 h-3.5 w-3.5 text-primary" />
    ) : (
      <ArrowDown className="ml-2 h-3.5 w-3.5 text-primary" />
    );
  };

  return (
    <div className="rounded-md border bg-card text-card-foreground shadow-xs overflow-hidden">
      <div className="overflow-x-auto max-h-[60vh] scrollbar-thin">
        <Table className="min-w-full border-collapse relative">
          <TableHeader className="bg-muted/80 sticky top-0 z-10 backdrop-blur-xs shadow-xs">
            <TableRow className="hover:bg-transparent border-b">
              {/* Exercise Name */}
              <TableHead
                className="cursor-pointer select-none font-semibold text-foreground/90 pl-6 py-3.5 w-[50%]"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Exercise Name
                  {renderSortIndicator("name")}
                </div>
              </TableHead>

              {/* Category */}
              <TableHead
                className="cursor-pointer select-none font-semibold text-foreground/90 py-3.5 w-[25%]"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  Category
                  {renderSortIndicator("category")}
                </div>
              </TableHead>

              {/* Primary Muscle */}
              <TableHead
                className="cursor-pointer select-none font-semibold text-foreground/90 pr-6 py-3.5 w-[25%]"
                onClick={() => handleSort("primaryMuscleGroup")}
              >
                <div className="flex items-center">
                  Primary Muscle
                  {renderSortIndicator("primaryMuscleGroup")}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExercises.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No exercises found.
                </TableCell>
              </TableRow>
            ) : (
              sortedExercises.map((exercise, index) => {
                return (
                  <TableRow
                    key={exercise.id}
                    className={`hover:bg-muted/45 transition-colors border-b ${
                      index % 2 === 0 ? "bg-card" : "bg-muted/5"
                    }`}
                  >
                    {/* Name */}
                    <TableCell className="font-medium pl-6 py-3.5">
                      <button
                        onClick={() => onSelect(exercise)}
                        className="text-left font-semibold text-primary hover:underline focus:outline-hidden focus:ring-2 focus:ring-ring rounded-xs"
                      >
                        {exercise.name}
                      </button>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-3.5">
                      <Badge variant="outline" className="bg-background text-foreground/80 px-2.5 py-0.5 font-medium">
                        {exercise.category || "General"}
                      </Badge>
                    </TableCell>

                    {/* Primary Muscle */}
                    <TableCell className="py-3.5 pr-6 font-semibold text-foreground/90">
                      {exercise.primaryMuscleGroup}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
