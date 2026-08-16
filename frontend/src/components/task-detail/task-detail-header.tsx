"use client";

import { useState } from "react";
import { Check, Lock, Eye, Share2, MoreHorizontal, PanelRight, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ApiTask } from "@/lib/api-tasks";
import { cn } from "@/lib/utils";

export function TaskDetailHeader({
  task,
  onUpdate,
  onDelete,
  sidebarOpen,
  onToggleSidebar,
  otherViewers,
}: {
  task: ApiTask;
  onUpdate: (updates: {
    title?: string;
    description?: string;
    locked?: boolean;
  }) => void;
  onDelete: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  otherViewers: number;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [descriptionDraft, setDescriptionDraft] = useState(task.description);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function commitTitle() {
    setEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate({ title: trimmed });
    } else {
      setTitleDraft(task.title);
    }
  }

  function commitDescription() {
    setEditingDescription(false);
    if (descriptionDraft !== task.description) {
      onUpdate({ description: descriptionDraft });
    }
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
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
                setTitleDraft(task.title);
                setEditingTitle(false);
              }
            }}
            className="-mx-1.5 rounded-md border border-input bg-transparent px-1.5 text-xl leading-6 font-medium text-foreground outline-none focus-visible:border-ring"
          />
        ) : (
          <h1
            onClick={() => !task.locked && setEditingTitle(true)}
            className={cn(
              "-mx-1.5 rounded-md px-1.5 text-xl leading-6 font-medium text-foreground",
              task.locked
                ? "cursor-default"
                : "cursor-text hover:bg-accent",
            )}
          >
            {task.title}
          </h1>
        )}

        {editingDescription ? (
          <textarea
            autoFocus
            rows={2}
            value={descriptionDraft}
            onChange={(e) => setDescriptionDraft(e.target.value)}
            onBlur={commitDescription}
            className="-mx-1.5 mt-1 max-w-[530px] resize-none rounded-md border border-input bg-transparent px-1.5 text-xs leading-[18px] text-muted-foreground outline-none focus-visible:border-ring"
          />
        ) : (
          <p
            onClick={() => !task.locked && setEditingDescription(true)}
            className={cn(
              "-mx-1.5 mt-1 max-w-[530px] rounded-md px-1.5 text-xs leading-[18px] text-muted-foreground",
              task.locked
                ? "cursor-default"
                : "cursor-text hover:bg-accent",
            )}
          >
            {task.description || "Add a description..."}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 text-foreground">
        <button
          type="button"
          onClick={() => onUpdate({ locked: !task.locked })}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-[4px] border transition-colors",
            task.locked
              ? "border-primary/20 bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:bg-muted",
          )}
          aria-pressed={task.locked}
          aria-label={task.locked ? "Unlock task" : "Lock task"}
        >
          <Lock className="h-3.5 w-3.5" />
        </button>
        <span
          className={cn(
            "flex h-7 items-center gap-1 rounded-[4px] border px-2",
            otherViewers > 0
              ? "border-blue-500/20 bg-blue-500/10 text-blue-500"
              : "border-border text-muted-foreground",
          )}
          aria-hidden="true"
        >
          <Eye className="h-3.5 w-3.5" />
          {otherViewers > 0 && (
            <span className="text-xs font-medium">{otherViewers}</span>
          )}
        </span>
        <button
          type="button"
          onClick={handleShare}
          className={cn(
            "flex h-7 items-center justify-center gap-1 rounded-[4px] border px-2 transition-colors",
            copied
              ? "border-primary/20 bg-primary/10 text-primary"
              : "w-7 border-border bg-background text-foreground hover:bg-muted",
          )}
          aria-label="Copy link"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Copied</span>
            </>
          ) : (
            <Share2 className="h-3.5 w-3.5" />
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-7 w-7 items-center justify-center rounded-[4px] border border-border bg-background text-foreground hover:bg-muted"
            aria-label="More options"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          type="button"
          onClick={onToggleSidebar}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-[4px] border border-border text-foreground",
            sidebarOpen ? "bg-muted" : "bg-background hover:bg-muted",
          )}
          aria-label={sidebarOpen ? "Hide details panel" : "Show details panel"}
        >
          <PanelRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
