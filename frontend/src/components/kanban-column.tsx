"use client";

import { useState } from "react";
import { GripVertical, MoreHorizontal, Plus } from "lucide-react";
import { TaskCard } from "@/components/task-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { sortTasksBy, type SortKey } from "@/lib/task-sort";
import type { ApiTask, TaskColumn } from "@/lib/api-tasks";
import type { VisibleFields } from "@/lib/view-fields";

export function KanbanColumn({
  id,
  title,
  tasks,
  onAddTask,
  onDeleteTask,
  onMoveTask,
  onUpdateTask,
  fields,
  projectNames,
}: {
  id: TaskColumn;
  title: string;
  tasks: ApiTask[];
  onAddTask: (title: string, column: TaskColumn) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, column: TaskColumn) => void;
  onUpdateTask?: (id: string, updates: Partial<Omit<ApiTask, "id">>) => void;
  fields: VisibleFields;
  projectNames: Record<string, string>;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  function submit() {
    const trimmed = draft.trim();
    if (trimmed) onAddTask(trimmed, id);
    setDraft("");
    setAdding(false);
  }

  function handleSort(key: SortKey) {
    sortTasksBy(tasks, key).forEach((task, index) => {
      if (task.order !== index) onUpdateTask?.(task.id, { order: index });
    });
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData("text/plain");
        if (taskId) onMoveTask(taskId, id);
      }}
      className={cn(
        "flex min-w-[289px] flex-1 flex-col gap-3 rounded-xl bg-muted p-3 transition-colors",
        isDragOver && "bg-accent ring-2 ring-ring",
      )}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <GripVertical className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span>{title}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md p-1 hover:bg-accent hover:text-accent-foreground"
            aria-label={`Add task to ${title}`}
          >
            <Plus className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="rounded-md p-1 hover:bg-accent hover:text-accent-foreground focus:outline-none"
              aria-label={`${title} options`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
                  Sort by
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleSort("priority")}
                  className="cursor-pointer text-xs"
                >
                  Priority
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort("dueDate")}
                  className="cursor-pointer text-xs"
                >
                  Due Date
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDeleteTask}
            onMove={onMoveTask}
            onUpdate={onUpdateTask}
            fields={fields}
            projectNames={projectNames}
          />
        ))}

        {adding ? (
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
            placeholder="Task title…"
            className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm text-card-foreground outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        )}
      </div>
    </div>
  );
}
