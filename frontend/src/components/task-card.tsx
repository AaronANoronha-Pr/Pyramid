"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, FolderKanban, MoreHorizontal, Plus, Tag, Trash2, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { PriorityBadge, PRIORITY_OPTIONS } from "@/components/priority-badge";
import { ASSIGNEE_OPTIONS } from "@/lib/assignees";
import { COLUMN_DEFS, STATUS_DEFS, type ApiTask, type TaskColumn } from "@/lib/api-tasks";
import { STATUS_DOT } from "@/lib/status-colors";
import type { VisibleFields } from "@/lib/view-fields";
import { cn } from "@/lib/utils";

export function TaskCard({
  task,
  onDelete,
  onMove,
  onUpdate,
  fields,
  projectNames,
}: {
  task: ApiTask;
  onDelete: (id: string) => void;
  onMove: (id: string, column: TaskColumn) => void;
  onUpdate?: (id: string, updates: Partial<Omit<ApiTask, "id">>) => void;
  fields: VisibleFields;
  projectNames: Record<string, string>;
}) {
  const isUnassigned =
    !task.assigneeName.trim() || task.assigneeName === "Unassigned";
  const initials = task.assigneeName.slice(0, 2).toUpperCase() || "CN";
  const tags = task.tags ? task.tags.split(",").filter(Boolean) : [];
  const otherColumns = COLUMN_DEFS.filter((c) => c.id !== task.column);
  const statusTitle = STATUS_DEFS.find((s) => s.id === task.status)?.title;
  const [editingDate, setEditingDate] = useState(false);
  const router = useRouter();

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={() => router.push(`/tasks/${task.id}`)}
      className="flex cursor-grab select-none flex-col gap-2 rounded-lg border border-card-border bg-card p-3 active:cursor-grabbing"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium text-card-foreground">
          {task.title}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 text-muted-foreground hover:text-card-foreground"
            aria-label="Task actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {otherColumns.map((col) => (
                  <DropdownMenuItem
                    key={col.id}
                    onClick={() => onMove(task.id, col.id)}
                  >
                    {col.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {fields.priority && (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="focus:outline-none"
            >
              <PriorityBadge priority={task.priority} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-32 rounded-xl p-1"
              onClick={(e) => e.stopPropagation()}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => onUpdate?.(task.id, { priority: p })}
                  className="cursor-pointer text-xs"
                >
                  <PriorityBadge priority={p} showCaret={false} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {fields.status && (
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs hover:bg-accent focus:outline-none"
            >
              <span
                className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[task.status])}
              />
              <span className="font-medium text-card-foreground">{statusTitle}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-36 rounded-xl p-1"
              onClick={(e) => e.stopPropagation()}
            >
              {STATUS_DEFS.map((s) => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => onUpdate?.(task.id, { status: s.id })}
                  className="flex cursor-pointer items-center gap-1.5 text-xs"
                >
                  <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[s.id])} />
                  {s.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {(fields.members || fields.dueDate) && (
        <div className="flex items-center justify-between gap-2">
          {fields.members ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="flex cursor-pointer items-center gap-1 focus:outline-none"
              >
                <Avatar className="h-5 w-5">
                  {isUnassigned ? (
                    <AvatarFallback className="text-[10px]">
                      <Plus className="h-3 w-3" strokeWidth={2.5} />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="text-[10px]">
                      {initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm text-card-foreground">
                  {task.assigneeName || "Unassigned"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-40 rounded-xl p-1"
                onClick={(e) => e.stopPropagation()}
              >
                {ASSIGNEE_OPTIONS.map((member) => (
                  <DropdownMenuItem
                    key={member.name}
                    onClick={() =>
                      onUpdate?.(task.id, {
                        assigneeName:
                          member.name === "Unassigned" ? "" : member.name,
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
          ) : (
            <span />
          )}

          {fields.dueDate && (
            <Popover open={editingDate} onOpenChange={setEditingDate}>
              <PopoverTrigger
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer focus:outline-none"
              >
                <Badge variant="destructive">
                  <CalendarIcon />
                  {task.dueDate || "No date"}
                </Badge>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-auto rounded-[16px] border border-border bg-popover p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
                onClick={(e) => e.stopPropagation()}
              >
                <CalendarPicker
                  value={task.dueDate}
                  onSelectDate={(formattedDate) => {
                    onUpdate?.(task.id, { dueDate: formattedDate });
                    setEditingDate(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}

      {fields.labels && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant="secondary">
              <Tag />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {fields.reporter && (
        <div className="flex items-center gap-1.5 text-sm text-card-foreground">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          {task.reporter || "No reporter"}
        </div>
      )}

      {fields.project && (
        <div className="flex items-center gap-1.5 text-sm text-card-foreground">
          <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
          {task.projectId ? (projectNames[task.projectId] ?? "Unknown project") : "No project"}
        </div>
      )}
    </div>
  );
}
