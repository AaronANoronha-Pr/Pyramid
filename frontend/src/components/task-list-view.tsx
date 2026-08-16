"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Tag } from "lucide-react";
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

export function TaskListView({
  tasks,
  fields,
  onAddTask,
  onDeleteTask,
  onMoveTask,
  onUpdateTask,
  hideEmptyGroups,
  projectNames,
}: {
  tasks: ApiTask[];
  fields: VisibleFields;
  onAddTask?: (title: string, column: TaskColumn) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, column: TaskColumn) => void;
  onUpdateTask?: (id: string, updates: Partial<Omit<ApiTask, "id">>) => void;
  hideEmptyGroups?: boolean;
  projectNames: Record<string, string>;
}) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  function handleDragStart(id: string) {
    setDraggedTaskId(id);
  }

  function handleDrop(targetColumn: TaskColumn) {
    if (draggedTaskId) {
      onMoveTask(draggedTaskId, targetColumn);
      setDraggedTaskId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6 overflow-y-auto px-6 pb-6">
      {COLUMN_DEFS.map((col) => {
        const columnTasks = tasks
          .filter((t) => t.column === col.id)
          .sort((a, b) => a.order - b.order);
        if (hideEmptyGroups && columnTasks.length === 0) return null;
        return (
          <ListGroup
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={columnTasks}
            fields={fields}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
            onMoveTask={onMoveTask}
            onUpdateTask={onUpdateTask}
            onDragStart={handleDragStart}
            onDrop={() => handleDrop(col.id)}
            projectNames={projectNames}
          />
        );
      })}
    </div>
  );
}

function ListGroup({
  id,
  title,
  tasks,
  fields,
  onAddTask,
  onDeleteTask,
  onMoveTask,
  onUpdateTask,
  onDragStart,
  onDrop,
  projectNames,
}: {
  id: TaskColumn;
  title: string;
  tasks: ApiTask[];
  fields: VisibleFields;
  onAddTask?: (title: string, column: TaskColumn) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, column: TaskColumn) => void;
  onUpdateTask?: (id: string, updates: Partial<Omit<ApiTask, "id">>) => void;
  onDragStart: (id: string) => void;
  onDrop: () => void;
  projectNames: Record<string, string>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  function handleCreate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;
    if (onAddTask) {
      onAddTask(newTitle.trim(), id);
    }
    setNewTitle("");
    setAdding(false);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="flex flex-col gap-2.5"
    >
      {/* Group Header with task counter circle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-foreground"
        >
          <span
            className={cn(
              "text-xs font-bold text-foreground transition-transform inline-block",
              collapsed && "-rotate-90",
            )}
          >
            ▾
          </span>
          <span>{title}</span>
        </button>
        {/* Count Circle */}
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground shadow-2xs">
          {tasks.length}
        </span>
      </div>

      {!collapsed && (
        <div className="overflow-hidden rounded-[14px] border border-card-border bg-card shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-card-border bg-muted text-[13px] font-semibold text-card-foreground">
                <th className="h-11 px-4 font-semibold">Task</th>
                {fields.status && (
                  <th className="h-11 px-4 font-semibold">Status</th>
                )}
                {fields.priority && (
                  <th className="h-11 px-4 font-semibold">Priority</th>
                )}
                {fields.members && (
                  <th className="h-11 px-4 font-semibold">Members</th>
                )}
                {fields.dueDate && (
                  <th className="h-11 px-4 font-semibold">Due Date</th>
                )}
                {fields.labels && (
                  <th className="h-11 px-4 font-semibold">Labels</th>
                )}
                {fields.reporter && (
                  <th className="h-11 px-4 font-semibold">Reporter</th>
                )}
                {fields.project && (
                  <th className="h-11 px-4 font-semibold">Project</th>
                )}
                <th className="h-11 w-24 pr-6 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <ListRow
                  key={task.id}
                  task={task}
                  fields={fields}
                  onDelete={onDeleteTask}
                  onMove={onMoveTask}
                  onUpdate={onUpdateTask}
                  onDragStart={() => onDragStart(task.id)}
                  projectNames={projectNames}
                />
              ))}
            </tbody>
          </table>

          {adding ? (
            <form
              onSubmit={handleCreate}
              className="flex items-center gap-2 border-t border-card-border p-2.5 bg-card"
            >
              <input
                type="text"
                placeholder="Task title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="flex-1 rounded-md border border-card-border bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-foreground"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setNewTitle("");
                }}
                className="rounded-md border border-card-border text-muted-foreground px-3 py-1.5 text-xs font-medium hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex h-11 w-full cursor-pointer items-center gap-1.5 border-t border-card-border px-4 text-[13px] font-medium text-card-foreground transition-colors hover:bg-accent"
            >
              <Plus className="h-3.5 w-3.5 text-card-foreground" strokeWidth={2} />
              <span>Add Task</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ListRow({
  task,
  fields,
  onDelete,
  onMove,
  onUpdate,
  onDragStart,
  projectNames,
}: {
  task: ApiTask;
  fields: VisibleFields;
  onDelete: (id: string) => void;
  onMove: (id: string, column: TaskColumn) => void;
  onUpdate?: (id: string, updates: Partial<Omit<ApiTask, "id">>) => void;
  onDragStart: () => void;
  projectNames: Record<string, string>;
}) {
  const isUnassigned = !task.assigneeName.trim() || task.assigneeName === "Unassigned";
  const initials = task.assigneeName.slice(0, 2).toUpperCase() || "CN";
  const otherColumns = COLUMN_DEFS.filter((c) => c.id !== task.column);
  const tags = task.tags ? task.tags.split(",").filter(Boolean) : [];
  const statusTitle = STATUS_DEFS.find((s) => s.id === task.status)?.title;
  const [editingDate, setEditingDate] = useState(false);
  const router = useRouter();

  return (
    <tr
      draggable
      onDragStart={onDragStart}
      onClick={() => router.push(`/tasks/${task.id}`)}
      className="cursor-grab border-b border-card-border transition-colors last:border-b-0 hover:bg-foreground/5 active:cursor-grabbing"
    >
      {/* Task Title */}
      <td className="h-12 px-4 text-[13px] font-medium text-card-foreground">
        {task.title}
      </td>

      {/* Status Selector */}
      {fields.status && (
        <td className="h-12 px-4" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-[13px] hover:bg-accent focus:outline-none">
              <span
                className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[task.status])}
              />
              <span className="text-card-foreground">{statusTitle}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-36 rounded-xl p-1">
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
        </td>
      )}

      {/* Priority Selector */}
      {fields.priority && (
        <td className="h-12 px-4" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <PriorityBadge priority={task.priority} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32 rounded-xl p-1">
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
        </td>
      )}

      {/* Member Assignee Selector */}
      {fields.members && (
        <td className="h-12 px-4" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1.5 focus:outline-none">
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
                    onUpdate?.(task.id, {
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
      )}

      {/* Custom Calendar Picker */}
      {fields.dueDate && (
        <td
          className="h-12 px-4 text-[13px] font-normal text-card-foreground"
          onClick={(e) => e.stopPropagation()}
        >
          <Popover open={editingDate} onOpenChange={setEditingDate}>
            <PopoverTrigger className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[13px] text-card-foreground hover:bg-accent focus:outline-none">
              <span>{task.dueDate || "12 Sep"}</span>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2.5 rounded-[16px] border border-border shadow-[0_4px_24px_rgba(0,0,0,0.08)] bg-popover">
              <CalendarPicker
                value={task.dueDate}
                onSelectDate={(formattedDate) => {
                  onUpdate?.(task.id, { dueDate: formattedDate });
                  setEditingDate(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </td>
      )}

      {/* Labels */}
      {fields.labels && (
        <td className="h-12 px-4">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, index) => (
                <Badge key={`${tag}-${index}`} variant="secondary">
                  <Tag />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </td>
      )}

      {/* Reporter */}
      {fields.reporter && (
        <td className="h-12 px-4 text-[13px] font-normal text-card-foreground">
          {task.reporter || "—"}
        </td>
      )}

      {/* Project */}
      {fields.project && (
        <td className="h-12 px-4 text-[13px] font-normal text-card-foreground">
          {task.projectId ? (projectNames[task.projectId] ?? "Unknown project") : "—"}
        </td>
      )}

      {/* Actions */}
      <td
        className="h-12 w-24 pr-6 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-card-foreground focus:outline-none"
              aria-label="Task actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer text-xs">
                  Move to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="rounded-xl">
                  {otherColumns.map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      onClick={() => onMove(task.id, col.id)}
                      className="cursor-pointer text-xs"
                    >
                      {col.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(task.id)}
                className="cursor-pointer text-xs"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
