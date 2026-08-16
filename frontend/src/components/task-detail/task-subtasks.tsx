"use client";

import { useState } from "react";
import { ChevronDown, MoreHorizontal, Plus, Trash2 } from "lucide-react";
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
import { PriorityBadge, PRIORITY_OPTIONS } from "@/components/priority-badge";
import { ASSIGNEE_OPTIONS } from "@/lib/assignees";
import { useSubtasks } from "@/hooks/use-subtasks";
import type { ApiSubtask } from "@/lib/api-subtasks";
import { SubtaskDetailDialog } from "@/components/task-detail/subtask-detail-dialog";
import { cn } from "@/lib/utils";

export function TaskSubtasks({
  taskId,
  parentTaskTitle,
  onActivity,
  locked,
  refreshKey,
}: {
  taskId: string;
  parentTaskTitle: string;
  onActivity: () => void;
  locked?: boolean;
  refreshKey?: number;
}) {
  const { subtasks, addSubtask, removeSubtask, editSubtask } =
    useSubtasks(taskId, refreshKey);
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<string | null>(null);
  const selectedSubtask =
    subtasks.find((s) => s.id === selectedSubtaskId) ?? null;

  async function submit() {
    const trimmed = draft.trim();
    // Clear the draft before the await: Enter and blur both call submit(),
    // and a blur firing while the first call is still in flight would
    // otherwise re-read the same non-empty draft and add a duplicate.
    setDraft("");
    setAdding(false);
    if (trimmed) {
      await addSubtask(trimmed);
      onActivity();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-1.5 text-xs font-medium text-foreground"
      >
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform",
            collapsed && "-rotate-90",
          )}
        />
        Subtasks
      </button>

      {!collapsed && (
        <div className="overflow-hidden rounded-[7px] border border-card-border bg-card shadow-2xs">
          {subtasks.length > 0 && (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-card-border bg-muted text-[13px] font-semibold text-card-foreground">
                  <th className="h-10 px-4 font-semibold">Task</th>
                  <th className="h-10 px-4 font-semibold">Priority</th>
                  <th className="h-10 px-4 font-semibold">Members</th>
                  <th className="h-10 px-4 font-semibold">Due Date</th>
                  <th className="h-10 w-16 pr-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subtasks.map((subtask) => (
                  <SubtaskRow
                    key={subtask.id}
                    subtask={subtask}
                    onOpen={() => setSelectedSubtaskId(subtask.id)}
                    onUpdate={(updates) => editSubtask(subtask.id, updates)}
                    onDelete={() => removeSubtask(subtask.id)}
                    locked={locked}
                  />
                ))}
              </tbody>
            </table>
          )}

          {locked ? null : adding ? (
            <div className="flex items-center gap-2 border-t border-card-border p-2.5">
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={submit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                  if (e.key === "Escape") {
                    setDraft("");
                    setAdding(false);
                  }
                }}
                placeholder="Subtask title…"
                className="flex-1 rounded-md border border-card-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-foreground"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className={cn(
                "flex h-10 w-full items-center gap-1.5 px-4 text-[13px] font-medium text-card-foreground transition-colors hover:bg-accent",
                subtasks.length > 0 && "border-t border-card-border",
              )}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add Subtasks
            </button>
          )}
        </div>
      )}

      <SubtaskDetailDialog
        subtask={selectedSubtask}
        open={selectedSubtaskId !== null}
        parentTaskTitle={parentTaskTitle}
        onUpdate={(updates) => {
          if (selectedSubtaskId) editSubtask(selectedSubtaskId, updates);
        }}
        onDelete={() => {
          if (selectedSubtaskId) removeSubtask(selectedSubtaskId);
        }}
        onOpenChange={(open) => {
          if (!open) setSelectedSubtaskId(null);
        }}
        locked={locked}
      />
    </div>
  );
}

function SubtaskRow({
  subtask,
  onOpen,
  onUpdate,
  onDelete,
  locked,
}: {
  subtask: ApiSubtask;
  onOpen: () => void;
  onUpdate: (updates: Partial<Pick<ApiSubtask, "priority" | "assigneeName" | "dueDate">>) => void;
  onDelete: () => void;
  locked?: boolean;
}) {
  const isUnassigned =
    !subtask.assigneeName.trim() || subtask.assigneeName === "Unassigned";
  const initials = subtask.assigneeName.slice(0, 2).toUpperCase() || "CN";
  const [editingDate, setEditingDate] = useState(false);

  return (
    <tr className="border-b border-card-border last:border-b-0 hover:bg-foreground/5">
      <td
        onClick={onOpen}
        className="h-9 cursor-pointer px-4 text-[13px] font-medium text-card-foreground hover:underline"
      >
        {subtask.title}
      </td>

      <td className="h-9 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger disabled={locked} className="focus:outline-none">
            <PriorityBadge priority={subtask.priority} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-32 rounded-xl p-1">
            {PRIORITY_OPTIONS.map((p) => (
              <DropdownMenuItem
                key={p}
                onClick={() => onUpdate({ priority: p })}
                className="cursor-pointer text-xs"
              >
                <PriorityBadge priority={p} showCaret={false} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>

      <td className="h-9 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={locked}
            className="flex items-center gap-1.5 not-disabled:cursor-pointer focus:outline-none"
          >
            <Avatar className="h-6 w-6">
              {isUnassigned ? (
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <Plus className="h-3 w-3" strokeWidth={2.5} />
                </AvatarFallback>
              ) : (
                <AvatarFallback className="bg-muted text-[10px] font-semibold text-card-foreground">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
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
      </td>

      <td className="h-9 px-4 text-[13px] font-normal text-card-foreground">
        <Popover open={editingDate} onOpenChange={setEditingDate}>
          <PopoverTrigger
            disabled={locked}
            className="flex items-center rounded-md px-1.5 py-1 text-[13px] text-card-foreground not-disabled:cursor-pointer not-disabled:hover:bg-accent focus:outline-none"
          >
            <span>{subtask.dueDate || "No date"}</span>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-fit rounded-[7px] border border-border bg-popover p-3 shadow-lg"
          >
            <CalendarPicker
              value={subtask.dueDate}
              onSelectDate={(formattedDate) => {
                onUpdate({
                  dueDate: formattedDate === "No date" ? "" : formattedDate,
                });
                setEditingDate(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </td>

      <td className="h-9 w-16 pr-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={locked}
            className="rounded-md p-1 text-muted-foreground transition-colors not-disabled:cursor-pointer not-disabled:hover:bg-accent not-disabled:hover:text-card-foreground focus:outline-none"
            aria-label="Subtask actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 rounded-xl">
            <DropdownMenuItem
              variant="destructive"
              onClick={onDelete}
              className="cursor-pointer text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
