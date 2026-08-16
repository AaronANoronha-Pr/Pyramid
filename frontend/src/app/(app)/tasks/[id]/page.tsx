"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTask } from "@/hooks/use-task";
import { usePresence } from "@/hooks/use-presence";
import { useTaskLiveUpdates } from "@/hooks/use-task-live-updates";
import { TaskDetailHeader } from "@/components/task-detail/task-detail-header";
import { TaskProperties } from "@/components/task-detail/task-properties";
import { TaskLabels } from "@/components/task-detail/task-labels";
import { TaskDetailsSidebar } from "@/components/task-detail/task-details-sidebar";
import { TaskSubtasks } from "@/components/task-detail/task-subtasks";
import { TaskComments } from "@/components/task-detail/task-comments";
import { TaskResources } from "@/components/task-detail/task-resources";
import { TaskUpdatesPanel } from "@/components/task-detail/task-updates-panel";

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { task, loading, notFound, update, remove, refetch } = useTask(params.id);
  const otherViewers = usePresence(params.id);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);

  async function handleDelete() {
    await remove();
    router.push("/tasks");
  }

  function bumpActivity() {
    setActivityRefreshKey((k) => k + 1);
  }

  useTaskLiveUpdates(task?.id, () => {
    refetch();
    bumpActivity();
  });

  async function handleUpdate(updates: Parameters<typeof update>[0]) {
    await update(updates);
    bumpActivity();
  }

  async function handleMembersOrResourcesChange() {
    await refetch();
    bumpActivity();
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex items-center gap-2 px-4 py-3">
        <SidebarTrigger />
      </div>

      {loading ? (
        <p className="px-6 text-sm text-muted-foreground">Loading task…</p>
      ) : notFound || !task ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
          <h1 className="text-xl font-semibold text-foreground">Task not found</h1>
          <p className="text-sm text-muted-foreground">
            It may have been deleted, or you don&apos;t have access to it.
          </p>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6">
          <TaskDetailHeader
            task={task}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            otherViewers={otherViewers}
          />

          <div className="flex flex-1 items-start gap-5 text-xs">
            <div className="min-w-0 flex-1">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-[73px] shrink-0 font-medium text-muted-foreground">
                    Properties
                  </span>
                  <TaskProperties
                    task={task}
                    onUpdate={handleUpdate}
                    locked={task.locked}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-[73px] shrink-0 pt-0.5 font-medium text-muted-foreground">
                    Labels
                  </span>
                  <TaskLabels
                    task={task}
                    onUpdate={handleUpdate}
                    locked={task.locked}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-[73px] shrink-0 font-medium text-muted-foreground">
                    Resources
                  </span>
                  <TaskResources
                    task={task}
                    onChange={handleMembersOrResourcesChange}
                    locked={task.locked}
                  />
                </div>
              </div>

              <div className="mt-5">
                <TaskSubtasks
                  taskId={task.id}
                  parentTaskTitle={task.title}
                  onActivity={bumpActivity}
                  locked={task.locked}
                  refreshKey={activityRefreshKey}
                />
              </div>

              <div className="mt-4">
                <TaskComments
                  taskId={task.id}
                  onActivity={bumpActivity}
                  refreshKey={activityRefreshKey}
                />
              </div>
            </div>

            {sidebarOpen && (
              <div className="flex w-[323px] shrink-0 flex-col gap-4">
                <TaskDetailsSidebar
                  task={task}
                  onUpdate={handleUpdate}
                  onMembersChange={handleMembersOrResourcesChange}
                  locked={task.locked}
                />
                <TaskUpdatesPanel
                  taskId={task.id}
                  refreshKey={activityRefreshKey}
                  onActivity={bumpActivity}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
