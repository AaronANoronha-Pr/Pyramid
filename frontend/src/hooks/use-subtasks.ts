"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiSubtask,
  createSubtask as apiCreateSubtask,
  deleteSubtask as apiDeleteSubtask,
  updateSubtask as apiUpdateSubtask,
  listSubtasks,
} from "@/lib/api-subtasks";
import type { TaskPriority } from "@/lib/api-tasks";

export function useSubtasks(taskId: string, refreshKey?: number) {
  const [subtasks, setSubtasks] = useState<ApiSubtask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSubtasks(taskId)
      .then(setSubtasks)
      .catch(() => setSubtasks([]))
      .finally(() => setLoading(false));
  }, [taskId, refreshKey]);

  const addSubtask = useCallback(
    async (
      title: string,
      extra?: Partial<{
        description: string;
        priority: TaskPriority;
        assigneeName: string;
        dueDate: string;
      }>,
    ) => {
      const created = await apiCreateSubtask(taskId, { title, ...extra });
      setSubtasks((prev) => [...prev, created]);
    },
    [taskId],
  );

  const removeSubtask = useCallback(
    async (id: string) => {
      setSubtasks((prev) => prev.filter((s) => s.id !== id));
      await apiDeleteSubtask(taskId, id).catch(() => {
        listSubtasks(taskId).then(setSubtasks);
      });
    },
    [taskId],
  );

  const editSubtask = useCallback(
    (id: string, updates: Partial<Omit<ApiSubtask, "id" | "taskId" | "order">>) => {
      setSubtasks((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      );
      apiUpdateSubtask(taskId, id, updates).catch(() => {
        listSubtasks(taskId).then(setSubtasks);
      });
    },
    [taskId],
  );

  return { subtasks, loading, addSubtask, removeSubtask, editSubtask };
}
