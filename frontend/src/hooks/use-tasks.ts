"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiTask,
  TaskColumn,
  createTask as apiCreateTask,
  deleteTask as apiDeleteTask,
  updateTask as apiUpdateTask,
  listTasks,
} from "@/lib/api-tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listTasks()
      .then(setTasks)
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  const addTask = useCallback(
    async (
      title: string,
      column: TaskColumn,
      extra?: Partial<
        Pick<
          ApiTask,
          | "description"
          | "assigneeName"
          | "dueDate"
          | "tags"
          | "priority"
          | "projectId"
        >
      >,
    ) => {
      const created = await apiCreateTask({
        title,
        column,
        ...extra,
        projectId: extra?.projectId ?? undefined,
      });
      setTasks((prev) => [...prev, created]);
    },
    [],
  );

  const removeTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await apiDeleteTask(id).catch(() => {
      // best-effort: refetch on failure to resync
      listTasks().then(setTasks);
    });
  }, []);

  const moveTask = useCallback((id: string, column: TaskColumn) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, column } : t)),
    );
    apiUpdateTask(id, { column }).catch(() => {
      listTasks().then(setTasks);
    });
  }, []);

  const editTask = useCallback((id: string, updates: Partial<Omit<ApiTask, "id">>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
    apiUpdateTask(id, updates).catch(() => {
      listTasks().then(setTasks);
    });
  }, []);

  return { tasks, loading, addTask, removeTask, moveTask, editTask };
}

