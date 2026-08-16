"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiProject,
  deleteProject as apiDeleteProject,
  getProject,
  updateProject as apiUpdateProject,
} from "@/lib/api-projects";

export function useProject(id: string) {
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getProject(id)
      .then(setProject)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const update = useCallback(
    (updates: Partial<Omit<ApiProject, "id">>) => {
      setProject((prev) => (prev ? { ...prev, ...updates } : prev));
      return apiUpdateProject(id, updates).catch(() => {
        getProject(id).then(setProject);
      });
    },
    [id],
  );

  const remove = useCallback(() => apiDeleteProject(id), [id]);

  return { project, loading, notFound, update, remove };
}
