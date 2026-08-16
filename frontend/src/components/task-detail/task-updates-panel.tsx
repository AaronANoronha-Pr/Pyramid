"use client";

import { useState } from "react";
import { Activity, ChevronDown, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useActivity } from "@/hooks/use-activity";
import { useCurrentUser } from "@/hooks/use-current-user";
import { postUpdate } from "@/lib/api-activity";
import { cn } from "@/lib/utils";

export function TaskUpdatesPanel({
  taskId,
  refreshKey,
  onActivity,
}: {
  taskId: string;
  refreshKey: number;
  onActivity: () => void;
}) {
  const { activity } = useActivity(taskId, refreshKey);
  const { user } = useCurrentUser();
  const [collapsed, setCollapsed] = useState(false);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  async function submit() {
    const trimmed = draft.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    try {
      await postUpdate(taskId, trimmed);
      setDraft("");
      onActivity();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-[7px] border border-border bg-card p-3">
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
        Activity
      </button>

      {!collapsed && (
        <div className="mt-2 flex flex-col gap-3">
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No updates yet.</p>
          ) : (
            activity.map((entry) => {
              const authorName =
                user && entry.author.id === user.id ? "You" : entry.author.name;
              return (
                <div key={entry.id} className="flex items-start gap-2">
                  {entry.kind === "change" ? (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Activity className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-[10px]">
                        {authorName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {authorName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {entry.message}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          <div className="flex items-center gap-2 rounded-[7px] border border-card-border bg-card px-2.5 py-1.5">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Post an update..."
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={submit}
              disabled={posting || !draft.trim()}
              className="text-muted-foreground hover:text-foreground disabled:opacity-50"
              aria-label="Post update"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
