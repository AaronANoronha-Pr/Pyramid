"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MoreHorizontal, Trash2 } from "lucide-react";
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
import { deleteProject, type ApiProject } from "@/lib/api-projects";
import { cn } from "@/lib/utils";

export function ProjectDetailHeader({
  project,
  onUpdate,
}: {
  project: ApiProject;
  onUpdate: (updates: Partial<Omit<ApiProject, "id">>) => void;
}) {
  const router = useRouter();
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [nameDraft, setNameDraft] = useState(project.name);
  const [descriptionDraft, setDescriptionDraft] = useState(project.description);
  const [editingDate, setEditingDate] = useState(false);

  function commitName() {
    setEditingName(false);
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== project.name) {
      onUpdate({ name: trimmed });
    } else {
      setNameDraft(project.name);
    }
  }

  function commitDescription() {
    setEditingDescription(false);
    if (descriptionDraft !== project.description) {
      onUpdate({ description: descriptionDraft });
    }
  }

  async function handleDelete() {
    await deleteProject(project.id);
    router.push("/projects");
  }

  const isUnassigned = !project.leadName.trim();
  const initials = project.leadName.slice(0, 2).toUpperCase() || "+";

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitName();
              }
              if (e.key === "Escape") {
                setNameDraft(project.name);
                setEditingName(false);
              }
            }}
            className="-mx-1.5 rounded-md border border-input bg-transparent px-1.5 text-xl font-semibold text-foreground outline-none focus-visible:border-ring"
          />
        ) : (
          <h1
            onClick={() => setEditingName(true)}
            className="-mx-1.5 cursor-text rounded-md px-1.5 text-xl font-semibold text-foreground hover:bg-accent"
          >
            {project.name}
          </h1>
        )}

        {editingDescription ? (
          <textarea
            autoFocus
            rows={2}
            value={descriptionDraft}
            onChange={(e) => setDescriptionDraft(e.target.value)}
            onBlur={commitDescription}
            className="-mx-1.5 resize-none rounded-md border border-input bg-transparent px-1.5 text-sm text-muted-foreground outline-none focus-visible:border-ring"
          />
        ) : (
          <p
            onClick={() => setEditingDescription(true)}
            className="-mx-1.5 cursor-text rounded-md px-1.5 text-sm text-muted-foreground hover:bg-accent"
          >
            {project.description || "Add a description..."}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <PriorityBadge priority={project.priority} />
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

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-accent focus:outline-none">
              <Avatar className="h-5 w-5">
                {isUnassigned ? (
                  <AvatarFallback className="text-[10px]">+</AvatarFallback>
                ) : (
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm text-foreground">
                {project.leadName || "Unassigned"}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 rounded-xl p-1">
              {ASSIGNEE_OPTIONS.map((member) => (
                <DropdownMenuItem
                  key={member.name}
                  onClick={() =>
                    onUpdate({
                      leadName: member.name === "Unassigned" ? "" : member.name,
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
              className={cn(
                "flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-sm",
                project.dueDate ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {project.dueDate || "No date"}
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-fit rounded-[7px] border border-border bg-popover p-3 shadow-lg"
            >
              <CalendarPicker
                value={project.dueDate}
                onSelectDate={(formatted) => {
                  onUpdate({ dueDate: formatted === "No date" ? "" : formatted });
                  setEditingDate(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border hover:bg-accent"
          aria-label="More options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
