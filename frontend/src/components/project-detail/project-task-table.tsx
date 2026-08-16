"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRIORITY_META } from "@/components/priority-badge";
import { STATUS_DEFS, type ApiTask } from "@/lib/api-tasks";
import { STATUS_DOT } from "@/lib/status-colors";

export function ProjectTaskTable({
  tasks,
  onDeleteTask,
}: {
  tasks: ApiTask[];
  onDeleteTask: (id: string) => void;
}) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-[8px] border border-border">
      <table className="w-full table-fixed text-left text-sm">
        <thead>
          <tr className="h-10 border-b border-border text-muted-foreground">
            <th className="w-[30%] px-3 font-medium">Task</th>
            <th className="w-[17%] px-3 font-medium">Status</th>
            <th className="w-[14%] px-3 font-medium">Priority</th>
            <th className="w-[13%] px-3 font-medium">Assignee</th>
            <th className="w-[13%] px-3 font-medium">Due Date</th>
            <th className="w-[13%] pr-8 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const meta = PRIORITY_META[task.priority];
            const PriorityIcon = meta.icon;
            const statusTitle = STATUS_DEFS.find((s) => s.id === task.status)?.title;
            const isUnassigned =
              !task.assigneeName.trim() || task.assigneeName === "Unassigned";
            const initials = task.assigneeName.slice(0, 2).toUpperCase() || "+";

            return (
              <tr
                key={task.id}
                className="h-9 cursor-pointer border-b border-border last:border-b-0 hover:bg-accent"
                onClick={() => router.push(`/tasks/${task.id}`)}
              >
                <td className="truncate px-3 font-medium text-primary">
                  {task.title}
                </td>
                <td className="px-3">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[task.status]}`} />
                    {statusTitle}
                  </span>
                </td>
                <td className="px-3">
                  <span className={`inline-flex items-center gap-1 ${meta.className}`}>
                    <PriorityIcon className="h-3 w-3" strokeWidth={2.5} />
                    {meta.label}
                  </span>
                </td>
                <td className="px-3">
                  {isUnassigned ? (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                      <Plus className="h-3 w-3 text-muted-foreground" />
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] text-muted-foreground">
                      {initials}
                    </span>
                  )}
                </td>
                <td className="px-3 text-foreground">{task.dueDate || "No date"}</td>
                <td className="pr-8 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="ml-auto flex text-muted-foreground hover:text-foreground focus:outline-none"
                      aria-label="Task actions"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => onDeleteTask(task.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
          {tasks.length === 0 && (
            <tr className="h-9">
              <td colSpan={6} className="px-3 text-muted-foreground">
                No tasks in this project yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
