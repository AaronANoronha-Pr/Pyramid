"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useProject } from "@/hooks/use-project";
import { useTasks } from "@/hooks/use-tasks";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { ProjectDetailHeader } from "@/components/project-detail/project-detail-header";
import { ProjectStatusChart } from "@/components/project-detail/project-status-chart";
import { ProjectTaskTable } from "@/components/project-detail/project-task-table";
import { ProjectActivityPanel } from "@/components/project-detail/project-activity-panel";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { project, loading, notFound, update } = useProject(params.id);
  const { tasks, loading: tasksLoading, addTask, removeTask } = useTasks();
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);

  const projectTasks = tasks.filter((t) => t.projectId === params.id);

  async function handleAddTask(
    title: string,
    column: Parameters<typeof addTask>[1],
    extra?: Parameters<typeof addTask>[2],
  ) {
    await addTask(title, column, extra);
    setActivityRefreshKey((key) => key + 1);
  }

  async function handleDeleteTask(id: string) {
    await removeTask(id);
    setActivityRefreshKey((key) => key + 1);
  }

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-background text-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <SidebarTrigger />
      </div>

      {loading ? (
        <p className="px-6 text-sm text-muted-foreground">Loading project…</p>
      ) : notFound || !project ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
          <h1 className="text-xl font-semibold text-foreground">Project not found</h1>
          <p className="text-sm text-muted-foreground">
            It may have been deleted.
          </p>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pb-10">
          <ProjectDetailHeader project={project} onUpdate={update} />

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-foreground">Status breakdown</h2>
            <ProjectStatusChart tasks={projectTasks} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Tasks</h2>
              <CreateTaskDialog
                onCreate={(title, column, extra) => handleAddTask(title, column, extra)}
                defaultProjectId={project.id}
                trigger={
                  <span className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] bg-foreground px-3 text-sm font-medium text-background">
                    <Plus className="h-3.5 w-3.5" />
                    Add Task
                  </span>
                }
              />
            </div>
            {tasksLoading ? (
              <p className="text-sm text-muted-foreground">Loading tasks…</p>
            ) : (
              <ProjectTaskTable tasks={projectTasks} onDeleteTask={handleDeleteTask} />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-foreground">Activity</h2>
            <ProjectActivityPanel projectId={project.id} refreshKey={activityRefreshKey} />
          </div>
        </div>
      )}
    </div>
  );
}
