export type ViewMode = "board" | "list";

export type FieldKey =
  | "priority"
  | "members"
  | "dueDate"
  | "labels"
  | "status"
  | "reporter"
  | "project";

export const FIELD_DEFS: {
  key: FieldKey;
  label: string;
}[] = [
  { key: "priority", label: "Priority" },
  { key: "members", label: "Members" },
  { key: "dueDate", label: "Due Date" },
  { key: "labels", label: "Labels" },
  { key: "status", label: "Status" },
  { key: "reporter", label: "Reporter" },
  { key: "project", label: "Project" },
];

export type VisibleFields = Record<FieldKey, boolean>;

export const DEFAULT_VISIBLE_FIELDS: VisibleFields = {
  priority: true,
  members: true,
  dueDate: true,
  labels: true,
  status: false,
  reporter: false,
  project: false,
};
