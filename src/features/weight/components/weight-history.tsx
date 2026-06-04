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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, History, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { deleteWeightAction } from "../actions";
import { toast } from "sonner";
import type { WeightLog } from "../types";

interface WeightHistoryProps {
  logs: WeightLog[];
}

export function WeightHistory({ logs }: WeightHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, dateStr: string) => {
    setDeletingId(id);
    const toastId = toast.loading(`Deleting log for ${dateStr}...`);
    try {
      const result = await deleteWeightAction(id);
      if (result.success) {
        toast.success("Entry deleted", { id: toastId });
      } else {
        toast.error(result.error, { id: toastId });
      }
    } catch (e) {
      toast.error("Failed to delete entry", { id: toastId });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <span>Weight History</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {logs.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Date</TableHead>
                  <TableHead className="text-center">Weight</TableHead>
                  <TableHead className="w-[80px] pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="pl-6 py-3 font-medium">
                      {formatDate(log.logDate)}
                    </TableCell>
                    <TableCell className="text-center py-3 font-semibold font-mono">
                      {log.weight.toFixed(1)} kg
                    </TableCell>
                    <TableCell className="pr-6 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(log.id, log.logDate)}
                        disabled={deletingId === log.id}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        {deletingId === log.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete log</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No weight entries recorded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
