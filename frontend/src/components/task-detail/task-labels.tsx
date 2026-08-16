"use client";

import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ApiTask } from "@/lib/api-tasks";

export function TaskLabels({
  task,
  onUpdate,
  locked,
}: {
  task: ApiTask;
  onUpdate: (updates: Partial<Omit<ApiTask, "id">>) => void;
  locked?: boolean;
}) {
  const tags = task.tags ? task.tags.split(",").filter(Boolean) : [];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  function addTag() {
    const trimmed = draft.trim();
    if (trimmed) onUpdate({ tags: [...tags, trimmed].join(",") });
    setDraft("");
    setOpen(false);
  }

  function removeTag(index: number) {
    onUpdate({ tags: tags.filter((_, i) => i !== index).join(",") });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag, index) => (
        <Badge key={`${tag}-${index}`} variant="secondary" className="group gap-1">
          <Tag />
          {tag}
          {!locked && (
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-0.5 opacity-0 group-hover:opacity-100"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      {!locked && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none"
            aria-label="Add label"
          >
            <Plus className="h-3.5 w-3.5" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Label name"
              className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:border-ring"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
