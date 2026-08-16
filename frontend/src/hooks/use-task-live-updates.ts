"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";

// Fires `onChanged` whenever another client mutates this task (or one of its
// child records — subtasks, comments, resources, custom fields, members, or
// a manually-posted update) — joins the same room `usePresence` joins.
export function useTaskLiveUpdates(taskId: string | undefined, onChanged: () => void) {
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;

  useEffect(() => {
    if (!taskId) return;
    const socket = getSocket();

    function handleChanged(payload: { taskId: string }) {
      if (payload.taskId !== taskId) return;
      onChangedRef.current();
    }

    socket.on("task-changed", handleChanged);
    return () => {
      socket.off("task-changed", handleChanged);
    };
  }, [taskId]);
}
