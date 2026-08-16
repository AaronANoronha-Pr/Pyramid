"use client";

import {
  Calendar,
  Circle,
  Filter,
  FolderKanban,
  SignalHigh,
  Tag,
  User,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STATUS_DEFS } from "@/lib/api-tasks";
import { PRIORITY_OPTIONS, PRIORITY_META } from "@/components/priority-badge";
import { ASSIGNEE_OPTIONS } from "@/lib/assignees";
import {
  DUE_DATE_PRESETS,
  NO_PROJECT,
  countActiveFilters,
  type FilterCategory,
  type TaskFilters,
} from "@/lib/task-filters";
import { cn } from "@/lib/utils";

function EmptyOption() {
  return (
    <div className="px-2.5 py-2 text-xs text-muted-foreground">
      No options yet
    </div>
  );
}

export function TaskFilterMenu({
  filters,
  onToggle,
  onClear,
  teamOptions,
  labelOptions,
  reporterOptions,
  projectOptions,
}: {
  filters: TaskFilters;
  onToggle: (category: FilterCategory, value: string) => void;
  onClear: () => void;
  teamOptions: string[];
  labelOptions: string[];
  reporterOptions: string[];
  projectOptions: { id: string; name: string }[];
}) {
  const activeCount = countActiveFilters(filters);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "relative flex h-8 w-8 items-center justify-center rounded-md border text-foreground hover:bg-accent",
          activeCount > 0
            ? "border-foreground/30 bg-accent"
            : "border-border",
        )}
        aria-label="Filter"
      >
        <Filter className="h-4 w-4" strokeWidth={2.5} />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
            {activeCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Circle className="h-4 w-4" />
            Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {STATUS_DEFS.map((s) => (
              <DropdownMenuCheckboxItem
                key={s.id}
                checked={filters.status.includes(s.id)}
                onCheckedChange={() => onToggle("status", s.id)}
                className="cursor-pointer text-xs"
              >
                {s.title}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SignalHigh className="h-4 w-4" />
            Priority
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {PRIORITY_OPTIONS.map((p) => (
              <DropdownMenuCheckboxItem
                key={p}
                checked={filters.priority.includes(p)}
                onCheckedChange={() => onToggle("priority", p)}
                className={cn("cursor-pointer text-xs", PRIORITY_META[p].className)}
              >
                {PRIORITY_META[p].label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Users className="h-4 w-4" />
            Members
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {ASSIGNEE_OPTIONS.map((member) => (
              <DropdownMenuCheckboxItem
                key={member.name}
                checked={filters.members.includes(member.name)}
                onCheckedChange={() => onToggle("members", member.name)}
                className="cursor-pointer text-xs"
              >
                {member.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Calendar className="h-4 w-4" />
            Due Date
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {DUE_DATE_PRESETS.map((preset) => (
              <DropdownMenuCheckboxItem
                key={preset.id}
                checked={filters.dueDate.includes(preset.id)}
                onCheckedChange={() => onToggle("dueDate", preset.id)}
                className="cursor-pointer text-xs"
              >
                {preset.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UsersRound className="h-4 w-4" />
            Teams
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {teamOptions.length === 0 ? (
              <EmptyOption />
            ) : (
              teamOptions.map((team) => (
                <DropdownMenuCheckboxItem
                  key={team}
                  checked={filters.teams.includes(team)}
                  onCheckedChange={() => onToggle("teams", team)}
                  className="cursor-pointer text-xs"
                >
                  {team}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Tag className="h-4 w-4" />
            Labels
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {labelOptions.length === 0 ? (
              <EmptyOption />
            ) : (
              labelOptions.map((label) => (
                <DropdownMenuCheckboxItem
                  key={label}
                  checked={filters.labels.includes(label)}
                  onCheckedChange={() => onToggle("labels", label)}
                  className="cursor-pointer text-xs"
                >
                  {label}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <User className="h-4 w-4" />
            Reporter
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {reporterOptions.length === 0 ? (
              <EmptyOption />
            ) : (
              reporterOptions.map((reporter) => (
                <DropdownMenuCheckboxItem
                  key={reporter}
                  checked={filters.reporter.includes(reporter)}
                  onCheckedChange={() => onToggle("reporter", reporter)}
                  className="cursor-pointer text-xs"
                >
                  {reporter}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FolderKanban className="h-4 w-4" />
            Project
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={filters.project.includes(NO_PROJECT)}
              onCheckedChange={() => onToggle("project", NO_PROJECT)}
              className="cursor-pointer text-xs"
            >
              No Project
            </DropdownMenuCheckboxItem>
            {projectOptions.map((project) => (
              <DropdownMenuCheckboxItem
                key={project.id}
                checked={filters.project.includes(project.id)}
                onCheckedChange={() => onToggle("project", project.id)}
                className="cursor-pointer text-xs"
              >
                {project.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {activeCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onClear}
              className="cursor-pointer text-xs text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
