"use client";

import { useEffect, useState } from "react";
import { formatRelative, formatDate } from "@/lib/utils";

interface RelativeTimeProps {
  date: string | Date | null | undefined;
  fallback?: string;
}

export function RelativeTime({ date, fallback = "Never" }: RelativeTimeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!date) {
    return <span>{fallback}</span>;
  }

  return (
    <span title={formatDate(date)}>
      {mounted ? formatRelative(date) : formatDate(date)}
    </span>
  );
}
