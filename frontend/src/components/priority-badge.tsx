"use client";

import { ChevronDown, Minus, SignalHigh, SignalLow, SignalMedium, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/lib/api-tasks";

export const PRIORITY_OPTIONS: TaskPriority[] = [
  "none",
  "urgent",
  "high",
  "medium",
  "low",
];

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; icon: typeof SignalHigh; className: string }
> = {
  none: { label: "No Priority", icon: Minus, className: "text-muted-foreground" },
  urgent: { label: "Urgent", icon: TriangleAlert, className: "text-[#DC2626]" },
  high: { label: "High", icon: SignalHigh, className: "text-[#EF4444]" },
  medium: {
    label: "Medium",
    icon: SignalMedium,
    className: "text-[#F97316]",
  },
  low: { label: "Low", icon: SignalLow, className: "text-[#9CA3AF]" },
};

export function PriorityBadge({
  priority,
  showCaret = true,
}: {
  priority: TaskPriority;
  showCaret?: boolean;
}) {
  const meta = PRIORITY_META[priority];
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        "inline-flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors hover:bg-accent",
        meta.className,
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {meta.label}
      {showCaret && (
        <ChevronDown className="h-3 w-3 text-muted-foreground opacity-60" />
      )}
    </span>
  );
}
