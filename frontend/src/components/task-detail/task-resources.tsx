"use client";

import { useRef, useState } from "react";
import { ExternalLink, Paperclip, Pencil, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createResource, deleteResource, updateResource } from "@/lib/api-resources";
import { attachmentUrl, uploadAttachment } from "@/lib/api-attachments";
import type { ApiTask, TaskResource } from "@/lib/api-tasks";

function isUploadedFile(url: string) {
  return url.startsWith("/uploads/");
}

function resolveResourceUrl(url: string) {
  return isUploadedFile(url) ? attachmentUrl(url) : url;
}

function useResourceUpload(
  taskId: string,
  onUploaded: (filename: string, url: string) => void,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const attachment = await uploadAttachment(taskId, file);
      onUploaded(attachment.filename, attachment.url);
    } finally {
      setUploading(false);
    }
  }

  return { inputRef, uploading, handleFileChange };
}

function ResourceChip({
  taskId,
  resource,
  onChange,
  onDelete,
  locked,
}: {
  taskId: string;
  resource: TaskResource;
  onChange: () => void;
  onDelete: () => void;
  locked?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(resource.label);
  const [url, setUrl] = useState(resource.url);
  const { inputRef, uploading, handleFileChange } = useResourceUpload(
    taskId,
    (filename, uploadedUrl) => {
      setLabel((prev) => prev || filename);
      setUrl(uploadedUrl);
    },
  );

  async function submit() {
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();
    if (!trimmedLabel || !trimmedUrl) return;
    if (trimmedLabel !== resource.label || trimmedUrl !== resource.url) {
      await updateResource(taskId, resource.id, {
        label: trimmedLabel,
        url: trimmedUrl,
      });
      onChange();
    }
    setEditing(false);
  }

  const fileResource = isUploadedFile(resource.url);

  return (
    <Badge variant="secondary" className="group gap-1">
      {fileResource ? <Paperclip /> : <ExternalLink />}
      <a
        href={resolveResourceUrl(resource.url)}
        target="_blank"
        rel="noreferrer"
        className="hover:underline"
      >
        {resource.label}
      </a>
      {!locked && (
        <>
          <Popover
            open={editing}
            onOpenChange={(next) => {
              setEditing(next);
              if (next) {
                setLabel(resource.label);
                setUrl(resource.url);
              }
            }}
          >
            <PopoverTrigger
              className="ml-0.5 opacity-0 group-hover:opacity-100"
              aria-label={`Edit ${resource.label}`}
            >
              <Pencil className="h-3 w-3" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-2">
              <div className="flex flex-col gap-1.5">
                <input
                  autoFocus
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Label"
                  className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:border-ring"
                />
                <div className="flex items-center gap-1.5">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        submit();
                      }
                    }}
                    onBlur={submit}
                    placeholder="https://..."
                    className="min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:border-ring"
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
                    className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    aria-label="Attach a file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <button
            type="button"
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100"
            aria-label={`Remove ${resource.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </>
      )}
    </Badge>
  );
}

export function TaskResources({
  task,
  onChange,
  locked,
}: {
  task: ApiTask;
  onChange: () => void;
  locked?: boolean;
}) {
  const resources = task.resources ?? [];
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const { inputRef, uploading, handleFileChange } = useResourceUpload(
    task.id,
    (filename, uploadedUrl) => {
      setLabel((prev) => prev || filename);
      setUrl(uploadedUrl);
    },
  );

  async function submit() {
    const trimmedLabel = label.trim();
    const trimmedUrl = url.trim();
    if (!trimmedLabel || !trimmedUrl) return;
    await createResource(task.id, { label: trimmedLabel, url: trimmedUrl });
    setLabel("");
    setUrl("");
    setOpen(false);
    onChange();
  }

  async function handleDelete(id: string) {
    await deleteResource(task.id, id);
    onChange();
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {resources.map((resource) => (
        <ResourceChip
          key={resource.id}
          taskId={task.id}
          resource={resource}
          onChange={onChange}
          onDelete={() => handleDelete(resource.id)}
          locked={locked}
        />
      ))}
      {!locked && (
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              setLabel("");
              setUrl("");
            }
          }}
        >
          <PopoverTrigger
            className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:bg-accent hover:text-foreground focus:outline-none"
            aria-label="Add document or link"
          >
            <Plus className="h-3.5 w-3.5" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-2">
            <div className="flex flex-col gap-1.5">
              <input
                autoFocus
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Label"
                className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:border-ring"
              />
              <div className="flex items-center gap-1.5">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  placeholder="https://... or attach a file"
                  className="min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:border-ring"
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
                  className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  aria-label="Attach a file"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
