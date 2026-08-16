"use client";

import { Filter, SignalHigh, User, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRIORITY_OPTIONS, PRIORITY_META } from "@/components/priority-badge";
import { ASSIGNEE_OPTIONS } from "@/lib/assignees";
import {
  countActiveProjectFilters,
  type ProjectFilterCategory,
  type ProjectFilters,
} from "@/lib/project-filters";
import { cn } from "@/lib/utils";

export function ProjectFilterMenu({
  filters,
  onToggle,
  onClear,
}: {
  filters: ProjectFilters;
  onToggle: (category: ProjectFilterCategory, value: string) => void;
  onClear: () => void;
}) {
  const activeCount = countActiveProjectFilters(filters);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-[6px] border text-foreground hover:bg-accent",
          activeCount > 0 ? "border-foreground/30 bg-accent" : "border-border",
        )}
        aria-label="Filter"
      >
        <Filter className="h-3.5 w-3.5" />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
            {activeCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SignalHigh className="h-4 w-4" />
            Priority
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {PRIORITY_OPTIONS.map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={filters.priority.includes(p)}
                onCheckedChange={() => onToggle("priority", p)}
                className={cn("cursor-pointer text-xs", PRIORITY_META[p].className)}
              >
                {PRIORITY_META[p].label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <User className="h-4 w-4" />
            Lead
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ASSIGNEE_OPTIONS.map((member) => (
              <DropdownMenuCheckboxItem
                key={member.name}
                checked={filters.lead.includes(member.name)}
                onCheckedChange={() => onToggle("lead", member.name)}
                className="cursor-pointer text-xs"
              >
                {member.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {activeCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onClear}
              className="cursor-pointer text-xs text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
