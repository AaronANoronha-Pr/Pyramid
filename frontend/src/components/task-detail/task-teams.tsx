"use client";

import { useState } from "react";
import { Plus, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ApiTask } from "@/lib/api-tasks";

export function TaskTeams({
  task,
  onUpdate,
  locked,
}: {
  task: ApiTask;
  onUpdate: (updates: Partial<Omit<ApiTask, "id">>) => void;
  locked?: boolean;
}) {
  const teams = task.teams ? task.teams.split(",").filter(Boolean) : [];
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  function addTeam() {
    const trimmed = draft.trim();
    if (trimmed) onUpdate({ teams: [...teams, trimmed].join(",") });
    setDraft("");
    setOpen(false);
  }

  function removeTeam(index: number) {
    onUpdate({ teams: teams.filter((_, i) => i !== index).join(",") });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {teams.map((team, index) => (
        <Badge key={`${team}-${index}`} variant="secondary" className="group gap-1">
          <Users />
          {team}
          {!locked && (
            <button
              type="button"
              onClick={() => removeTeam(index)}
              className="ml-0.5 opacity-0 group-hover:opacity-100"
              aria-label={`Remove ${team}`}
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
            aria-label="Add team"
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
                  addTeam();
                }
              }}
              placeholder="Team name"
              className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:border-ring"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
