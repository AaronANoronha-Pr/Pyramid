"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiProject,
  createProject as apiCreateProject,
  deleteProject as apiDeleteProject,
  updateProject as apiUpdateProject,
  listProjects,
} from "@/lib/api-projects";

export function useProjects() {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    return listProjects().then(setProjects);
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [refresh]);

  const addProject = useCallback(
    async (
      name: string,
      extra?: Partial<
        Pick<ApiProject, "description" | "priority" | "leadName" | "dueDate">
      >,
    ) => {
      const created = await apiCreateProject({ name, ...extra });
      setProjects((prev) => [...prev, created]);
    },
    [],
  );

  const editProject = useCallback(
    async (id: string, updates: Partial<Omit<ApiProject, "id">>) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
      await apiUpdateProject(id, updates).catch(() => {
        listProjects().then(setProjects);
      });
    },
    [],
  );

  const removeProject = useCallback(async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    await apiDeleteProject(id).catch(() => {
      listProjects().then(setProjects);
    });
  }, []);

  return { projects, loading, addProject, editProject, removeProject };
}
