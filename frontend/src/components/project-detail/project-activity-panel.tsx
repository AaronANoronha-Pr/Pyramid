"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ListChecks } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { listProjectActivity, type ApiProjectActivity } from "@/lib/api-projects";
import { relativeTime } from "@/lib/format";

export function ProjectActivityPanel({
  projectId,
  refreshKey,
}: {
  projectId: string;
  refreshKey?: number;
}) {
  const [activity, setActivity] = useState<ApiProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useCurrentUser();

  useEffect(() => {
    listProjectActivity(projectId)
      .then(setActivity)
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, [projectId, refreshKey]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading activity…</p>;
  }

  if (activity.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {activity.map((entry) => {
        const authorName =
          user && entry.author.id === user.id ? "You" : entry.author.name;
        return (
          <div key={entry.id} className="flex items-start gap-2">
            {entry.kind === "task" ? (
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ListChecks className="h-3.5 w-3.5" />
              </span>
            ) : entry.kind === "change" ? (
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
              <span className="text-sm">
                <span className="font-medium text-foreground">{authorName}</span>
                <span className="text-muted-foreground"> {entry.message}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {entry.task ? (
                  <Link
                    href={`/tasks/${entry.task.id}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {entry.task.title}
                  </Link>
                ) : (
                  entry.taskTitle
                )}
                {" · "}
                {relativeTime(entry.createdAt)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
