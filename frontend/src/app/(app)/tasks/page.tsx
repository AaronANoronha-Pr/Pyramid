"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KanbanColumn } from "@/components/kanban-column";
import { TaskListView } from "@/components/task-list-view";
import { FieldsMenu } from "@/components/fields-menu";
import { TaskFilterMenu } from "@/components/task-filter-menu";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { COLUMN_DEFS } from "@/lib/api-tasks";
import { listProjects } from "@/lib/api-projects";
import { DEFAULT_VISIBLE_FIELDS, type FieldKey, type ViewMode } from "@/lib/view-fields";
import {
  EMPTY_FILTERS,
  countActiveFilters,
  matchesFilters,
  type FilterCategory,
  type TaskFilters,
} from "@/lib/task-filters";
import { useTasks } from "@/hooks/use-tasks";

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.map((v) => v.trim()).filter(Boolean))).sort();
}

export default function TasksPage() {
  const { tasks, loading, addTask, removeTask, moveTask, editTask } = useTasks();
  const [view, setView] = useState<ViewMode>("board");
  const [fields, setFields] = useState(DEFAULT_VISIBLE_FIELDS);
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectNames, setProjectNames] = useState<Record<string, string>>({});
  const [isMac] = useState(
    () =>
      typeof navigator !== "undefined" &&
      /Mac|iPhone|iPad|iPod/.test(navigator.userAgent),
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  function openSearch() {
    setSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  useEffect(() => {
    listProjects()
      .then((projects) =>
        setProjectNames(
          Object.fromEntries(projects.map((p) => [p.id, p.name])),
        ),
      )
      .catch(() => setProjectNames({}));
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        openSearch();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function toggleField(key: FieldKey, value: boolean) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFilter(category: FilterCategory, value: string) {
    setFilters((prev) => {
      const current = prev[category] as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: next };
    });
  }

  const teamOptions = useMemo(
    () => uniqueValues(tasks.flatMap((t) => t.teams.split(","))),
    [tasks],
  );
  const labelOptions = useMemo(
    () => uniqueValues(tasks.flatMap((t) => t.tags.split(","))),
    [tasks],
  );
  const reporterOptions = useMemo(
    () => uniqueValues(tasks.map((t) => t.reporter)),
    [tasks],
  );
  const projectOptions = useMemo(
    () =>
      Object.entries(projectNames)
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [projectNames],
  );

  const query = searchQuery.trim().toLowerCase();
  const filteredTasks = tasks
    .filter((t) => (query ? t.title.toLowerCase().includes(query) : true))
    .filter((t) => matchesFilters(t, filters));

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex items-center gap-2 px-4 py-3">
        <SidebarTrigger />
      </div>

      <div className="flex items-center justify-between pl-6 pr-10 pb-4">
        <h1 className="text-xl font-semibold text-foreground">Tasks</h1>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="flex h-8 w-72 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-foreground">
              <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} />
              <input
                ref={searchInputRef}
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                }}
                onBlur={() => {
                  if (!searchQuery.trim()) setSearchOpen(false);
                }}
                placeholder="Search tasks..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger
                onClick={openSearch}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground hover:bg-accent"
                aria-label="Search"
              >
                <Search className="h-4 w-4" strokeWidth={2.5} />
              </TooltipTrigger>
              <TooltipContent>{isMac ? "⌘ + F" : "Ctrl + F"}</TooltipContent>
            </Tooltip>
          )}
          <FieldsMenu
            view={view}
            onViewChange={setView}
            fields={fields}
            onToggleField={toggleField}
          />
          <TaskFilterMenu
            filters={filters}
            onToggle={toggleFilter}
            onClear={() => setFilters(EMPTY_FILTERS)}
            teamOptions={teamOptions}
            labelOptions={labelOptions}
            reporterOptions={reporterOptions}
            projectOptions={projectOptions}
          />
          <CreateTaskDialog
            onCreate={(title, column, extra) => addTask(title, column, extra)}
          />
        </div>
      </div>

      {loading ? (
        <p className="px-6 text-sm text-muted-foreground">Loading tasks…</p>
      ) : view === "board" ? (
        <div className="flex flex-1 items-start gap-6 overflow-x-auto px-6 pb-6">
          {COLUMN_DEFS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={filteredTasks
                .filter((t) => t.column === col.id)
                .sort((a, b) => a.order - b.order)}
              onAddTask={addTask}
              onDeleteTask={removeTask}
              onMoveTask={moveTask}
              onUpdateTask={editTask}
              fields={fields}
              projectNames={projectNames}
            />
          ))}
        </div>
      ) : (
        <TaskListView
          tasks={filteredTasks}
          fields={fields}
          onAddTask={addTask}
          onDeleteTask={removeTask}
          onMoveTask={moveTask}
          onUpdateTask={editTask}
          hideEmptyGroups={Boolean(query) || countActiveFilters(filters) > 0}
          projectNames={projectNames}
        />
      )}
    </div>
  );
}

