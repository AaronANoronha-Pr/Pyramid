"use client";

import { useEffect, useState } from "react";
import { ApiActivity, listActivity } from "@/lib/api-activity";

export function useActivity(taskId: string, refreshKey: number) {
  const [activity, setActivity] = useState<ApiActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listActivity(taskId)
      .then(setActivity)
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, [taskId, refreshKey]);

  return { activity, loading };
}
