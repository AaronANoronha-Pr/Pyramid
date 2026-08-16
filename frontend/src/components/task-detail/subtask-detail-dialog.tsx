"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronRight, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import type { ApiSubtask } from "@/lib/api-subtasks";
import { cn } from "@/lib/utils";

export function SubtaskDetailDialog({
  subtask,
  open,
  parentTaskTitle,
  onUpdate,
  onDelete,
  onOpenChange,
  locked,
}: {
  subtask: ApiSubtask | null;
  open: boolean;
  parentTaskTitle: string;
  onUpdate: (updates: Partial<Omit<ApiSubtask, "id" | "taskId" | "order">>) => void;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
  locked?: boolean;
}) {
  // Cache the last non-null subtask so the dialog content stays visible while it fades out,
  // instead of going blank the instant the caller clears the selection.
  const [displayed, setDisplayed] = useState(subtask);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [titleDraft, setTitleDraft] = useState(subtask?.title ?? "");
  const [descriptionDraft, setDescriptionDraft] = useState(subtask?.description ?? "");
  const [editingDate, setEditingDate] = useState(false);

  useEffect(() => {
    if (!subtask) return;
    setDisplayed(subtask);
    setTitleDraft(subtask.title);
    setDescriptionDraft(subtask.description);
    setEditingTitle(false);
    setEditingDescription(false);
  }, [subtask]);

  const shown = subtask ?? displayed;
  if (!shown) return null;

  function commitTitle() {
    setEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== shown!.title) {
      onUpdate({ title: trimmed });
    } else {
      setTitleDraft(shown!.title);
    }
  }

  function commitDescription() {
    setEditingDescription(false);
    if (descriptionDraft !== shown!.description) {
      onUpdate({ description: descriptionDraft });
    }
  }

  const isUnassigned =
    !shown.assigneeName.trim() || shown.assigneeName === "Unassigned";
  const initials = shown.assigneeName.slice(0, 2).toUpperCase() || "+";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate">{parentTaskTitle}</span>
            <ChevronRight className="h-3 w-3 shrink-0" />
            <span className="shrink-0">Subtask</span>
          </div>

          <DialogTitle>
            {editingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTitle();
                  }
                  if (e.key === "Escape") {
                    setTitleDraft(shown.title);
                    setEditingTitle(false);
                  }
                }}
                className="-mx-1.5 w-[calc(100%+0.75rem)] rounded-md border border-input bg-transparent px-1.5 text-base font-medium text-foreground outline-none focus-visible:border-ring"
              />
            ) : (
              <span
                onClick={() => !locked && setEditingTitle(true)}
                className={cn(
                  "-mx-1.5 block rounded-md px-1.5 text-base font-medium text-foreground",
                  locked ? "cursor-default" : "cursor-text hover:bg-accent",
                )}
              >
                {shown.title}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className={cn("flex flex-col gap-3 px-4", locked && "pb-4")}>
          {editingDescription ? (
            <textarea
              autoFocus
              rows={3}
              value={descriptionDraft}
              onChange={(e) => setDescriptionDraft(e.target.value)}
              onBlur={commitDescription}
              className="-mx-1.5 resize-none rounded-md border border-input bg-transparent px-1.5 text-sm text-muted-foreground outline-none focus-visible:border-ring"
            />
          ) : (
            <p
              onClick={() => !locked && setEditingDescription(true)}
              className={cn(
                "-mx-1.5 rounded-md px-1.5 text-sm text-muted-foreground",
                locked ? "cursor-default" : "cursor-text hover:bg-accent",
              )}
            >
              {shown.description || "Add a description..."}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger disabled={locked} className="focus:outline-none">
                <PriorityBadge priority={shown.priority} />
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
              <DropdownMenuTrigger
                disabled={locked}
                className="flex items-center gap-1.5 rounded-md px-1.5 py-1 not-disabled:hover:bg-accent focus:outline-none"
              >
                <Avatar className="h-5 w-5">
                  {isUnassigned ? (
                    <AvatarFallback className="text-[10px]">+</AvatarFallback>
                  ) : (
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm text-foreground">
                  {shown.assigneeName || "Unassigned"}
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
                className={cn(
                  "flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-sm",
                  shown.dueDate ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                {shown.dueDate || "No date"}
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-fit rounded-[7px] border border-border bg-popover p-3 shadow-lg"
              >
                <CalendarPicker
                  value={shown.dueDate}
                  onSelectDate={(formatted) => {
                    onUpdate({ dueDate: formatted === "No date" ? "" : formatted });
                    setEditingDate(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {!locked && (
          <DialogFooter>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete();
                onOpenChange(false);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete subtask
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
