"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useCurrentUser } from "@/hooks/use-current-user";

// Live viewer count for a task, pushed over the shared socket connection
// instead of polling — join/leave events replace the old heartbeat.
export function usePresence(taskId: string) {
  const { user } = useCurrentUser();
  const [others, setOthers] = useState(0);

  useEffect(() => {
    if (!taskId || !user) return;
    const socket = getSocket();
    const myUserId = user.id;

    function handlePresence(payload: { taskId: string; userIds: string[] }) {
      if (payload.taskId !== taskId) return;
      setOthers(payload.userIds.filter((id) => id !== myUserId).length);
    }

    socket.on("presence", handlePresence);
    socket.emit("join-task", taskId);

    return () => {
      socket.emit("leave-task");
      socket.off("presence", handlePresence);
      setOthers(0);
    };
  }, [taskId, user]);

  return others;
}
