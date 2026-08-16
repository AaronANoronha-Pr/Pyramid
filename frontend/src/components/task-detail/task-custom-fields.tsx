"use client";

import { useState } from "react";
import { Plus, Settings2, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  createCustomField,
  deleteCustomField,
  updateCustomField,
} from "@/lib/api-custom-fields";
import type { ApiTask } from "@/lib/api-tasks";
import { DetailRow } from "./task-details-sidebar";

function CustomFieldValue({
  taskId,
  fieldId,
  value,
  onChange,
  locked,
}: {
  taskId: string;
  fieldId: string;
  value: string;
  onChange: () => void;
  locked?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  async function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value) {
      await updateCustomField(taskId, fieldId, { value: trimmed });
      onChange();
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          }
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="w-32 rounded-md border border-input bg-transparent px-1.5 py-0.5 text-right text-xs text-foreground outline-none focus-visible:border-ring"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => !locked && setEditing(true)}
      disabled={locked}
      className="rounded-md px-1.5 py-0.5 text-xs font-medium text-foreground not-disabled:hover:bg-accent"
    >
      {value || "Add value"}
    </button>
  );
}

export function CustomFieldRows({
  task,
  onChange,
  locked,
}: {
  task: ApiTask;
  onChange: () => void;
  locked?: boolean;
}) {
  const fields = task.customFields ?? [];
  return (
    <>
      {fields.map((field) => (
        <DetailRow key={field.id} label={field.name}>
          <CustomFieldValue
            taskId={task.id}
            fieldId={field.id}
            value={field.value}
            onChange={onChange}
            locked={locked}
          />
        </DetailRow>
      ))}
    </>
  );
}

export function AddCustomFieldButton({
  task,
  onChange,
  locked,
}: {
  task: ApiTask;
  onChange: () => void;
  locked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  async function submit() {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    await createCustomField(task.id, { name: trimmedName, value: value.trim() });
    setName("");
    setValue("");
    setOpen(false);
    onChange();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={locked}
        className="flex items-center justify-center text-foreground not-disabled:hover:text-muted-foreground focus:outline-none"
        aria-label="Add custom field"
      >
        <Plus className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <div className="flex flex-col gap-1.5">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Field name"
            className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:border-ring"
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Value"
            className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm text-foreground outline-none focus-visible:border-ring"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ManageFieldRow({
  taskId,
  field,
  onChange,
  onDelete,
}: {
  taskId: string;
  field: { id: string; name: string };
  onChange: () => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(field.name);

  async function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== field.name) {
      await updateCustomField(taskId, field.id, { name: trimmed });
      onChange();
    } else {
      setDraft(field.name);
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-accent">
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
            if (e.key === "Escape") {
              setDraft(field.name);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-input bg-transparent px-1 py-0.5 text-sm text-foreground outline-none focus-visible:border-ring"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="min-w-0 flex-1 truncate text-left text-foreground"
        >
          {field.name}
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 text-muted-foreground hover:text-destructive"
        aria-label={`Remove ${field.name}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ManageCustomFieldsButton({
  task,
  onChange,
  locked,
}: {
  task: ApiTask;
  onChange: () => void;
  locked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const fields = task.customFields ?? [];

  async function handleDelete(id: string) {
    await deleteCustomField(task.id, id);
    onChange();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={locked}
        className="flex items-center justify-center text-foreground not-disabled:hover:text-muted-foreground focus:outline-none"
        aria-label="Manage custom fields"
      >
        <Settings2 className="h-3.5 w-3.5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        {fields.length === 0 ? (
          <p className="px-1 py-1 text-xs text-muted-foreground">
            No custom fields yet.
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            <p className="px-1.5 pb-1 text-[11px] text-muted-foreground">
              Click a name to rename it.
            </p>
            {fields.map((field) => (
              <ManageFieldRow
                key={field.id}
                taskId={task.id}
                field={field}
                onChange={onChange}
                onDelete={() => handleDelete(field.id)}
              />
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
