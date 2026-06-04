"use client";

import { muscleGroups, type MuscleGroup } from "@/config/site";
import { Badge } from "@/components/ui/badge";

interface MuscleGroupFilterProps {
  selectedGroup: MuscleGroup | "All";
  onSelect: (group: MuscleGroup | "All") => void;
}

export function MuscleGroupFilter({
  selectedGroup,
  onSelect,
}: MuscleGroupFilterProps) {
  const options = ["All", ...muscleGroups] as const;

  return (
    <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
      {options.map((group) => {
        const isSelected = selectedGroup === group;
        return (
          <Badge
            key={group}
            variant={isSelected ? "default" : "outline"}
            className="cursor-pointer select-none whitespace-nowrap px-3 py-1 text-xs transition-all duration-150 border-border"
            onClick={() => onSelect(group)}
          >
            {group}
          </Badge>
        );
      })}
    </div>
  );
}
