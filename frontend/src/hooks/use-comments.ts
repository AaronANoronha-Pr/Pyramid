"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ApiComment,
  createComment as apiCreateComment,
  deleteComment as apiDeleteComment,
  updateComment as apiUpdateComment,
  listComments,
} from "@/lib/api-comments";

export function useComments(taskId: string, refreshKey?: number) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    return listComments(taskId).then(setComments);
  }, [taskId]);

  useEffect(() => {
    listComments(taskId)
      .then(setComments)
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [taskId, refreshKey]);

  const addComment = useCallback(
    async (body: string, parentId?: string, attachmentIds?: string[]) => {
      await apiCreateComment(taskId, { body, parentId, attachmentIds });
      await refresh();
    },
    [taskId, refresh],
  );

  const editComment = useCallback(
    async (id: string, body: string) => {
      await apiUpdateComment(taskId, id, body);
      await refresh();
    },
    [taskId, refresh],
  );

  const removeComment = useCallback(
    async (id: string) => {
      await apiDeleteComment(taskId, id);
      await refresh();
    },
    [taskId, refresh],
  );

  return { comments, loading, addComment, editComment, removeComment };
}
