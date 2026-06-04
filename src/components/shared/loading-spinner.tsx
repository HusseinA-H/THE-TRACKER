import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
  label?: string;
}

export function LoadingSpinner({
  className = "",
  size = 24,
  label = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center text-muted-foreground ${className}`}>
      <Loader2
        className="animate-spin text-foreground/70"
        style={{ width: size, height: size }}
      />
      {label && <p className="text-xs font-semibold mt-2.5">{label}</p>}
    </div>
  );
}
