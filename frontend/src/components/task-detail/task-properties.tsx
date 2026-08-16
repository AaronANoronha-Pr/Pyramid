"use client";

import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { ASSIGNEE_OPTIONS } from "@/lib/assignees";
import type { ApiTask } from "@/lib/api-tasks";

export function TaskProperties({
  task,
  onUpdate,
  locked,
}: {
  task: ApiTask;
  onUpdate: (updates: Partial<Omit<ApiTask, "id">>) => void;
  locked?: boolean;
}) {
  const [editingDate, setEditingDate] = useState(false);
  const isUnassigned =
    !task.assigneeName.trim() || task.assigneeName === "Unassigned";
  const initials = task.assigneeName.slice(0, 2).toUpperCase() || "CN";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={locked}
          className="flex items-center gap-1 rounded-full bg-muted px-2 py-[3px] disabled:cursor-default not-disabled:cursor-pointer not-disabled:hover:bg-accent focus:outline-none"
        >
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-background text-[9px] text-muted-foreground">
            {isUnassigned ? <Plus className="h-2.5 w-2.5" strokeWidth={2.5} /> : initials}
          </span>
          <span className="font-medium text-foreground">
            {task.assigneeName || "Unassigned"}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40 rounded-xl p-1">
          {ASSIGNEE_OPTIONS.map((member) => (
            <DropdownMenuItem
              key={member.name}
              onClick={() =>
                onUpdate({
                  assigneeName: member.name === "Unassigned" ? "" : member.name,
                })
              }
              className="flex cursor-pointer items-center gap-2 text-xs"
            >
              <Avatar className="h-5 w-5">
                <AvatarFallback className="bg-muted text-[9px] font-semibold text-card-foreground">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <span>{member.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={editingDate} onOpenChange={setEditingDate}>
        <PopoverTrigger
          disabled={locked}
          className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-[3px] text-destructive disabled:cursor-default not-disabled:cursor-pointer focus:outline-none"
        >
          <CalendarDays className="h-3 w-3" />
          {task.dueDate || "No date"}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-fit rounded-[7px] border border-border bg-popover p-3 shadow-lg"
        >
          <CalendarPicker
            value={task.dueDate}
            onSelectDate={(formattedDate) => {
              onUpdate({ dueDate: formattedDate });
              setEditingDate(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
