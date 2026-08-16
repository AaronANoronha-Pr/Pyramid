"use client";

import { useEffect, useState } from "react";
import { CalendarIcon, ChevronDown, Plus, Tag } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { COLUMN_DEFS, type TaskColumn, type TaskPriority } from "@/lib/api-tasks";
import { listProjects, type ApiProject } from "@/lib/api-projects";

const fieldTriggerClass =
  "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CreateTaskDialog({
  onCreate,
  defaultColumn = "todo",
  defaultProjectId,
  trigger,
}: {
  onCreate: (
    title: string,
    column: TaskColumn,
    extra: {
      description: string;
      priority: TaskPriority;
      assigneeName: string;
      dueDate: string;
      tags: string;
      projectId: string;
    },
  ) => void;
  defaultColumn?: TaskColumn;
  defaultProjectId?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [column, setColumn] = useState<TaskColumn>(defaultColumn);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeName, setAssigneeName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [editingDate, setEditingDate] = useState(false);
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [projects, setProjects] = useState<ApiProject[]>([]);

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .catch(() => setProjects([]));
  }, []);

  function reset() {
    setTitle("");
    setDescription("");
    setColumn(defaultColumn);
    setPriority("medium");
    setAssigneeName("");
    setDueDate("");
    setTags("");
    setProjectId(defaultProjectId ?? "");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function submit() {
    const trimmed = title.trim();
    if (!trimmed) return;
    onCreate(trimmed, column, {
      description: description.trim(),
      priority,
      assigneeName,
      dueDate,
      tags: tags.trim(),
      projectId,
    });
    handleOpenChange(false);
  }

  const projectName = projects.find((p) => p.id === projectId)?.name;

  const columnTitle = COLUMN_DEFS.find((c) => c.id === column)?.title ?? "To Do";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger render={<button type="button" />}>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger render={<Button className="rounded-md" />}>
          <Plus className="h-4 w-4" />
          Add Task
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-4 pt-3 pb-4">
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Task title"
            className="h-9 text-sm"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Status</span>
              <DropdownMenu>
                <DropdownMenuTrigger className={fieldTriggerClass}>
                  <span>{columnTitle}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  {COLUMN_DEFS.map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      onClick={() => setColumn(col.id)}
                    >
                      {col.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Priority</span>
              <DropdownMenu>
                <DropdownMenuTrigger className={fieldTriggerClass}>
                  <PriorityBadge priority={priority} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-32">
                  {PRIORITY_OPTIONS.map((p) => (
                    <DropdownMenuItem key={p} onClick={() => setPriority(p)}>
                      <PriorityBadge priority={p} showCaret={false} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Assignee</span>
              <DropdownMenu>
                <DropdownMenuTrigger className={fieldTriggerClass}>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Avatar className="h-5 w-5 shrink-0">
                      <AvatarFallback className="text-[10px]">
                        {assigneeName ? assigneeName.slice(0, 2).toUpperCase() : "+"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{assigneeName || "Unassigned"}</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  {ASSIGNEE_OPTIONS.map((member) => (
                    <DropdownMenuItem
                      key={member.name}
                      onClick={() =>
                        setAssigneeName(member.name === "Unassigned" ? "" : member.name)
                      }
                      className="flex items-center gap-2"
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
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Due date</span>
              <Popover open={editingDate} onOpenChange={setEditingDate}>
                <PopoverTrigger className={fieldTriggerClass}>
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {dueDate || "No date"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-auto rounded-[16px] border border-border bg-popover p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
                >
                  <CalendarPicker
                    value={dueDate}
                    onSelectDate={(formatted) => {
                      setDueDate(formatted === "No date" ? "" : formatted);
                      setEditingDate(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Project</span>
              <DropdownMenu>
                <DropdownMenuTrigger className={fieldTriggerClass}>
                  <span className="truncate">{projectName || "No project"}</span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={() => setProjectId("")}>
                    No project
                  </DropdownMenuItem>
                  {projects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => setProjectId(project.id)}
                    >
                      {project.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Tags</span>
            <div className="flex h-8 items-center gap-1.5 rounded-lg border border-input px-2.5">
              <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Comma separated"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={submit} disabled={!title.trim()}>
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
