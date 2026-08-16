"use client";

import { Check, Columns3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type ProjectVisibleFields = {
  priority: boolean;
  lead: boolean;
  dueDate: boolean;
};

export const DEFAULT_PROJECT_FIELDS: ProjectVisibleFields = {
  priority: true,
  lead: true,
  dueDate: true,
};

const PROJECT_FIELD_DEFS: { key: keyof ProjectVisibleFields; label: string }[] = [
  { key: "priority", label: "Priority" },
  { key: "lead", label: "Lead" },
  { key: "dueDate", label: "Due Date" },
];

export function ProjectFieldsMenu({
  fields,
  onToggleField,
}: {
  fields: ProjectVisibleFields;
  onToggleField: (key: keyof ProjectVisibleFields, value: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent focus:outline-none">
        <Columns3 className="h-3.5 w-3.5 text-foreground" strokeWidth={2.5} />
        Fields
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[300px] rounded-[20px] border border-border bg-popover p-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col gap-1"
      >
        {PROJECT_FIELD_DEFS.map((field) => {
          const isChecked = fields[field.key];
          return (
            <DropdownMenuCheckboxItem
              key={field.key}
              checked={isChecked}
              onCheckedChange={(checked) => onToggleField(field.key, checked === true)}
              className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-[13px] font-medium text-foreground transition-colors hover:bg-accent focus:bg-accent focus:text-foreground outline-none [&_[data-slot=dropdown-menu-checkbox-item-indicator]]:hidden"
            >
              <span>{field.label}</span>
              <span
                className={cn(
                  "flex h-4.5 w-4.5 aspect-square shrink-0 items-center justify-center rounded-[5px] transition-colors",
                  isChecked ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
              </span>
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
