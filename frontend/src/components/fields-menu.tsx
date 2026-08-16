"use client";

import { Check, Columns3, Grid2x2, Rows3 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  FIELD_DEFS,
  type FieldKey,
  type VisibleFields,
  type ViewMode,
} from "@/lib/view-fields";

export function FieldsMenu({
  view,
  onViewChange,
  fields,
  onToggleField,
}: {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  fields: VisibleFields;
  onToggleField: (key: FieldKey, value: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent focus:outline-none">
        <Columns3 className="h-3.5 w-3.5 text-foreground" strokeWidth={2.5} />
        Fields
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[300px] h-[300px] aspect-square rounded-[20px] border border-border bg-popover p-4 shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col justify-between"
      >
        {/* Segmented Switcher */}
        <div className="flex h-10 shrink-0 overflow-hidden rounded-[12px] border border-border bg-muted">
          <button
            type="button"
            onClick={() => onViewChange("list")}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-2 text-[13px] font-medium transition-all border-r border-border",
              view === "board"
                ? "bg-background text-foreground font-semibold shadow-2xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Rows3 className="h-4 w-4" strokeWidth={2.5} />
            List
          </button>
          <button
            type="button"
            onClick={() => onViewChange("board")}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-2 text-[13px] font-medium transition-all",
              view === "list"
                ? "bg-background text-foreground font-semibold shadow-2xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Grid2x2 className="h-4 w-4" strokeWidth={2.5} />
            Board
          </button>
        </div>

        {/* Field List Items */}
        <div className="flex flex-1 flex-col justify-between pt-3">
          {FIELD_DEFS.map((field) => {
            const isChecked = fields[field.key];
            return (
              <DropdownMenuCheckboxItem
                key={field.key}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  onToggleField(field.key, checked === true)
                }
                className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1 text-[13px] font-medium text-foreground transition-colors hover:bg-accent focus:bg-accent focus:text-foreground outline-none [&_[data-slot=dropdown-menu-checkbox-item-indicator]]:hidden"
              >
                <span>{field.label}</span>
                <span
                  className={cn(
                    "flex h-4.5 w-4.5 aspect-square shrink-0 items-center justify-center rounded-[5px] transition-colors",
                    isChecked
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
              </DropdownMenuCheckboxItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}




