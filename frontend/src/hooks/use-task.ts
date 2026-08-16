"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiTask,
  deleteTask as apiDeleteTask,
  getTask,
  updateTask as apiUpdateTask,
} from "@/lib/api-tasks";

export function useTask(id: string) {
  const [task, setTask] = useState<ApiTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getTask(id)
      .then(setTask)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const update = useCallback(
    (updates: Partial<Omit<ApiTask, "id">>) => {
      setTask((prev) => (prev ? { ...prev, ...updates } : prev));
      return apiUpdateTask(id, updates).catch(() => {
        getTask(id).then(setTask);
      });
    },
    [id],
  );

  const remove = useCallback(() => apiDeleteTask(id), [id]);

  const refetch = useCallback(() => {
    return getTask(id).then(setTask);
  }, [id]);

  return { task, loading, notFound, update, remove, refetch };
}
