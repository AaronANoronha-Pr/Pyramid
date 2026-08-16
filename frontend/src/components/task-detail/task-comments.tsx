"use client";

import { useRef, useState } from "react";
import { MoreHorizontal, Paperclip, Send, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useComments } from "@/hooks/use-comments";
import { useCurrentUser } from "@/hooks/use-current-user";
import type { ApiComment } from "@/lib/api-comments";
import { attachmentUrl, uploadAttachment, type ApiAttachment } from "@/lib/api-attachments";
import { relativeTime } from "@/lib/format";

function initialsOf(name: string) {
  return name.slice(0, 2).toUpperCase() || "?";
}

function PendingAttachments({
  attachments,
  onRemove,
}: {
  attachments: ApiAttachment[];
  onRemove: (id: string) => void;
}) {
  if (attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 px-2.5 pb-2">
      {attachments.map((att) => (
        <span
          key={att.id}
          className="flex items-center gap-1 rounded-md border border-card-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
        >
          <Paperclip className="h-3 w-3" />
          <span className="max-w-[140px] truncate">{att.filename}</span>
          <button
            type="button"
            onClick={() => onRemove(att.id)}
            aria-label={`Remove ${att.filename}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

function PostedAttachments({ attachments }: { attachments: ApiAttachment[] }) {
  if (attachments.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {attachments.map((att) => (
        <a
          key={att.id}
          href={attachmentUrl(att.url)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-md border border-card-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Paperclip className="h-3 w-3" />
          <span className="max-w-[160px] truncate">{att.filename}</span>
        </a>
      ))}
    </div>
  );
}

function useAttachmentPicker(taskId: string) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<ApiAttachment[]>([]);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const attachment = await uploadAttachment(taskId, file);
      setPending((prev) => [...prev, attachment]);
    } finally {
      setUploading(false);
    }
  }

  function removePending(id: string) {
    setPending((prev) => prev.filter((a) => a.id !== id));
  }

  function reset() {
    setPending([]);
  }

  return { inputRef, pending, uploading, handleFileChange, removePending, reset };
}

export function TaskComments({
  taskId,
  onActivity,
  refreshKey,
}: {
  taskId: string;
  onActivity: () => void;
  refreshKey?: number;
}) {
  const { comments, addComment, editComment, removeComment } = useComments(
    taskId,
    refreshKey,
  );
  const { user } = useCurrentUser();
  const [newComment, setNewComment] = useState("");
  const {
    inputRef,
    pending,
    uploading,
    handleFileChange,
    removePending,
    reset,
  } = useAttachmentPicker(taskId);

  async function submitNewComment() {
    const trimmed = newComment.trim();
    if (!trimmed) return;
    await addComment(
      trimmed,
      undefined,
      pending.map((a) => a.id),
    );
    onActivity();
    setNewComment("");
    reset();
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-medium text-foreground">Comments</span>

      {comments.map((comment) => (
        <CommentThread
          key={comment.id}
          comment={comment}
          taskId={taskId}
          currentUserId={user?.id}
          currentUserName={user?.name ?? ""}
          onReply={async (body, attachmentIds) => {
            await addComment(body, comment.id, attachmentIds);
            onActivity();
          }}
          onEdit={editComment}
          onDelete={removeComment}
        />
      ))}

      <div className="rounded-[7px] border border-card-border bg-card">
        <div className="flex items-center gap-2 p-2.5">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitNewComment();
            }}
            placeholder="Add a comment..."
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label="Attach a file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={submitNewComment}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Send comment"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <PendingAttachments attachments={pending} onRemove={removePending} />
      </div>
    </div>
  );
}

function CommentThread({
  comment,
  taskId,
  currentUserId,
  currentUserName,
  onReply,
  onEdit,
  onDelete,
}: {
  comment: ApiComment;
  taskId: string;
  currentUserId?: string;
  currentUserName: string;
  onReply: (body: string, attachmentIds?: string[]) => void;
  onEdit: (id: string, body: string) => void;
  onDelete: (id: string) => void;
}) {
  const [replyDraft, setReplyDraft] = useState("");
  const {
    inputRef,
    pending,
    uploading,
    handleFileChange,
    removePending,
    reset,
  } = useAttachmentPicker(taskId);

  function submitReply() {
    const trimmed = replyDraft.trim();
    if (!trimmed) return;
    onReply(
      trimmed,
      pending.map((a) => a.id),
    );
    setReplyDraft("");
    reset();
  }

  return (
    <div className="overflow-hidden rounded-[7px] border border-card-border bg-card">
      <CommentRow
        comment={comment}
        currentUserId={currentUserId}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {comment.replies.map((reply) => (
        <div key={reply.id} className="border-t border-card-border">
          <CommentRow
            comment={reply}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}

      <div className="border-t border-card-border">
        <div className="flex items-center gap-2 p-2.5">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarFallback className="text-[10px]">
              {initialsOf(currentUserName)}
            </AvatarFallback>
          </Avatar>
          <input
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitReply();
            }}
            placeholder="Leave a reply..."
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label="Attach a file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={submitReply}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Send reply"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <PendingAttachments attachments={pending} onRemove={removePending} />
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  currentUserId,
  onEdit,
  onDelete,
}: {
  comment: ApiComment;
  currentUserId?: string;
  onEdit: (id: string, body: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const isOwn = comment.authorId === currentUserId;

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== comment.body) {
      onEdit(comment.id, trimmed);
    } else {
      setDraft(comment.body);
    }
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px]">
              {initialsOf(comment.author.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-card-foreground">
            {comment.author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {relativeTime(comment.createdAt)}
          </span>
        </div>

        {isOwn && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="text-muted-foreground hover:text-card-foreground"
              aria-label="Comment actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") {
              setDraft(comment.body);
              setEditing(false);
            }
          }}
          className="mt-1.5 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:border-ring"
        />
      ) : (
        <p className="mt-1.5 text-sm text-card-foreground">{comment.body}</p>
      )}

      <PostedAttachments attachments={comment.attachments} />
    </div>
  );
}
