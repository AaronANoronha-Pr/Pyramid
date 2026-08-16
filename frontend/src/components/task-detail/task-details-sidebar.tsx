"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, ChevronDown, FolderKanban, Plus } from "lucide-react";
import { listProjects, type ApiProject } from "@/lib/api-projects";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PriorityBadge, PRIORITY_OPTIONS } from "@/components/priority-badge";
import { ASSIGNEE_OPTIONS } from "@/lib/assignees";
import { STATUS_DEFS, type ApiTask } from "@/lib/api-tasks";
import { STATUS_DOT } from "@/lib/status-colors";
import { cn } from "@/lib/utils";
import { TaskLabels } from "./task-labels";
import { TaskTeams } from "./task-teams";
import { TaskMembers } from "./task-members";
import {
  AddCustomFieldButton,
  CustomFieldRows,
  ManageCustomFieldsButton,
} from "./task-custom-fields";


export function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-8 items-center gap-2">
      <span className="w-[78px] shrink-0 text-xs font-medium text-muted-foreground">
        {label}
      </span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
    </div>
  );
}

function ReporterField({
  task,
  onUpdate,
  locked,
}: {
  task: ApiTask;
  onUpdate: (updates: Partial<Omit<ApiTask, "id">>) => void;
  locked?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.reporter);

  function commit() {
    setEditing(false);
    if (draft.trim() !== task.reporter) onUpdate({ reporter: draft.trim() });
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setDraft(task.reporter);
            setEditing(false);
          }
        }}
        placeholder="Reporter"
        className="w-32 rounded-md border border-input bg-transparent px-1.5 py-0.5 text-right text-xs text-foreground outline-none focus-visible:border-ring"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => !locked && setEditing(true)}
      disabled={locked}
      className="rounded-md px-1.5 py-0.5 text-xs font-medium text-foreground not-disabled:hover:bg-accent"
    >
      {task.reporter || "Add reporter"}
    </button>
  );
}

function DateBadge({
  value,
  placeholder,
  onSelectDate,
  minDate,
  maxDate,
  locked,
}: {
  value: string;
  placeholder: string;
  onSelectDate: (formattedDate: string) => void;
  minDate?: string;
  maxDate?: string;
  locked?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={locked}
        className={cn(
          "flex items-center gap-1 rounded-full bg-muted px-2 py-[3px] text-muted-foreground focus:outline-none",
          value && "text-foreground",
        )}
      >
        <CalendarDays className="h-3 w-3" />
        {value || placeholder}
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-fit rounded-[7px] border border-border bg-popover p-3 shadow-lg"
      >
        <CalendarPicker
          value={value}
          minDate={minDate}
          maxDate={maxDate}
          onSelectDate={(formattedDate) => {
            onSelectDate(formattedDate === "No date" ? "" : formattedDate);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

function DatesField({
  task,
  onUpdate,
  locked,
}: {
  task: ApiTask;
  onUpdate: (updates: Partial<Omit<ApiTask, "id">>) => void;
  locked?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <DateBadge
        value={task.startDate}
        placeholder="Start"
        onSelectDate={(startDate) => onUpdate({ startDate })}
        maxDate={task.dueDate}
        locked={locked}
      />
      <ArrowRight className="h-3 w-3 text-muted-foreground" />
      <DateBadge
        value={task.dueDate}
        placeholder="End"
        onSelectDate={(dueDate) => onUpdate({ dueDate })}
        minDate={task.startDate}
        locked={locked}
      />
    </div>
  );
}

export function TaskDetailsSidebar({
  task,
  onUpdate,
  onMembersChange,
  locked,
}: {
  task: ApiTask;
  onUpdate: (updates: Partial<Omit<ApiTask, "id">>) => void;
  onMembersChange: () => void;
  locked?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const isUnassigned =
    !task.assigneeName.trim() || task.assigneeName === "Unassigned";
  const initials = task.assigneeName.slice(0, 2).toUpperCase() || "+";
  const statusTitle = STATUS_DEFS.find((s) => s.id === task.status)?.title;
  const currentProject = projects.find((p) => p.id === task.projectId);

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  return (
    <div className="rounded-[7px] border border-border bg-card p-3">
      <div className="flex items-center justify-between">
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
          Details
        </button>
        <div className="flex items-center gap-3">
          <AddCustomFieldButton
            task={task}
            onChange={onMembersChange}
            locked={locked}
          />
          <ManageCustomFieldsButton
            task={task}
            onChange={onMembersChange}
            locked={locked}
          />
        </div>
      </div>

      {!collapsed && (
        <div className="mt-1 flex flex-col">
          <DetailRow label="Status">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={locked}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs not-disabled:hover:bg-accent focus:outline-none"
              >
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full shrink-0",
                    STATUS_DOT[task.status],
                  )}
                />
                <span className="font-medium text-foreground">{statusTitle}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                {STATUS_DEFS.map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    onClick={() => onUpdate({ status: s.id })}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className={cn("h-2 w-2 rounded-full", STATUS_DOT[s.id])}
                    />
                    {s.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </DetailRow>

          <DetailRow label="Priority">
            <DropdownMenu>
              <DropdownMenuTrigger disabled={locked} className="focus:outline-none">
                <PriorityBadge priority={task.priority} />
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
          </DetailRow>

          <DetailRow label="Members">
            <TaskMembers task={task} onChange={onMembersChange} locked={locked} />
          </DetailRow>

          <DetailRow label="Dates">
            <DatesField task={task} onUpdate={onUpdate} locked={locked} />
          </DetailRow>

          <DetailRow label="Assignee">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={locked}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-1 not-disabled:hover:bg-accent focus:outline-none"
              >
                <Avatar className="h-5 w-5">
                  {isUnassigned ? (
                    <AvatarFallback className="text-[10px]">
                      <Plus className="h-3 w-3" strokeWidth={2.5} />
                    </AvatarFallback>
                  ) : (
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  )}
                </Avatar>
                <span className="truncate text-xs font-medium text-foreground">
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
          </DetailRow>

          <DetailRow label="Labels">
            <TaskLabels task={task} onUpdate={onUpdate} locked={locked} />
          </DetailRow>

          <DetailRow label="Teams">
            <TaskTeams task={task} onUpdate={onUpdate} locked={locked} />
          </DetailRow>

          <DetailRow label="Reporter">
            <ReporterField task={task} onUpdate={onUpdate} locked={locked} />
          </DetailRow>

          <DetailRow label="Project">
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={locked}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-1 not-disabled:hover:bg-accent focus:outline-none"
              >
                <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate font-medium text-foreground">
                  {currentProject?.name ?? "No project"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={() => onUpdate({ projectId: "" })}>
                  No project
                </DropdownMenuItem>
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => onUpdate({ projectId: project.id })}
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </DetailRow>

          <CustomFieldRows task={task} onChange={onMembersChange} locked={locked} />
        </div>
      )}
    </div>
  );
}
