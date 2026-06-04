import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  subtext?: string;
  subtextClass?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtext,
  subtextClass,
}: StatCardProps) {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardContent className="p-5 flex flex-col justify-between h-full min-h-[110px]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold font-mono text-foreground leading-none">
            {value}
          </h3>
          {subtext && (
            <p className={`text-[10px] mt-1.5 font-medium ${subtextClass || "text-muted-foreground"}`}>
              {subtext}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
