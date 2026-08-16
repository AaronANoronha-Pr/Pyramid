"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import {
  ProjectFieldsMenu,
  DEFAULT_PROJECT_FIELDS,
  type ProjectVisibleFields,
} from "@/components/project-fields-menu";
import { ProjectFilterMenu } from "@/components/project-filter-menu";
import { useProjects } from "@/hooks/use-projects";
import { PRIORITY_META } from "@/components/priority-badge";
import {
  EMPTY_PROJECT_FILTERS,
  matchesProjectFilters,
  type ProjectFilterCategory,
  type ProjectFilters,
} from "@/lib/project-filters";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, loading, addProject, removeProject } = useProjects();
  const [fields, setFields] = useState<ProjectVisibleFields>(DEFAULT_PROJECT_FIELDS);
  const [filters, setFilters] = useState<ProjectFilters>(EMPTY_PROJECT_FILTERS);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function toggleField(key: keyof ProjectVisibleFields, value: boolean) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function toggleFilter(category: ProjectFilterCategory, value: string) {
    setFilters((prev) => {
      const current = prev[category] as string[];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: next };
    });
  }

  function openSearch() {
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  const query = searchQuery.trim().toLowerCase();
  const filteredProjects = projects
    .filter((p) => (query ? p.name.toLowerCase().includes(query) : true))
    .filter((p) => matchesProjectFilters(p, filters));

  const visibleColumnCount =
    1 + Number(fields.priority) + Number(fields.lead) + Number(fields.dueDate) + 1;

  return (
    <div className="flex h-screen flex-col bg-background text-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <SidebarTrigger />
      </div>

      <div className="pl-4 pr-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-medium text-foreground">Projects</h1>
          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="flex h-8 w-64 items-center gap-1.5 rounded-[6px] border border-border bg-background px-2.5 text-foreground">
                <Search className="h-3.5 w-3.5 shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") closeSearch();
                  }}
                  onBlur={() => {
                    if (!searchQuery.trim()) setSearchOpen(false);
                  }}
                  placeholder="Search projects..."
                  className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                />
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger
                  onClick={openSearch}
                  className="flex h-8 w-8 items-center justify-center rounded-[6px] border border-border text-foreground hover:bg-accent"
                  aria-label="Search"
                >
                  <Search className="h-3.5 w-3.5" />
                </TooltipTrigger>
                <TooltipContent>Search projects</TooltipContent>
              </Tooltip>
            )}
            <ProjectFieldsMenu fields={fields} onToggleField={toggleField} />
            <ProjectFilterMenu
              filters={filters}
              onToggle={toggleFilter}
              onClear={() => setFilters(EMPTY_PROJECT_FILTERS)}
            />
            <CreateProjectDialog
              onCreate={(name, extra) => addProject(name, extra)}
              trigger={
                <span className="flex h-8 cursor-pointer items-center gap-1.5 rounded-[6px] bg-foreground px-3 font-medium text-background">
                  <Plus className="h-3.5 w-3.5" />
                  Add Project
                </span>
              }
            />
          </div>
        </div>

        {loading ? (
          <p className="mt-4 text-muted-foreground">Loading projects…</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-[8px] border border-border">
            <table className="w-full table-fixed text-left">
              <thead>
                <tr className="h-10 border-b border-border text-muted-foreground">
                  <th className="w-[42%] px-3 font-medium">Projects</th>
                  {fields.priority && (
                    <th className="w-[13%] px-3 font-medium">Priority</th>
                  )}
                  {fields.lead && (
                    <th className="w-[13%] px-3 font-medium">Lead</th>
                  )}
                  {fields.dueDate && (
                    <th className="w-[20%] px-3 font-medium">Due Date</th>
                  )}
                  <th className="w-24 pr-8 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const meta = PRIORITY_META[project.priority];
                  const PriorityIcon = meta.icon;
                  const isUnassigned = !project.leadName.trim();
                  const initials =
                    project.leadName.slice(0, 2).toUpperCase() || "+";

                  return (
                    <tr
                      key={project.id}
                      className="h-9 cursor-pointer border-b border-border last:border-b-0 hover:bg-accent"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <td className="truncate px-3 font-medium text-primary">
                        {project.name}
                      </td>
                      {fields.priority && (
                        <td className="px-3">
                          <span
                            className={`inline-flex items-center gap-1 ${meta.className}`}
                          >
                            <PriorityIcon className="h-3 w-3" strokeWidth={2.5} />
                            {meta.label}
                          </span>
                        </td>
                      )}
                      {fields.lead && (
                        <td className="px-3">
                          {isUnassigned ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                              <Plus className="h-3 w-3 text-muted-foreground" />
                            </span>
                          ) : (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] text-muted-foreground">
                              {initials}
                            </span>
                          )}
                        </td>
                      )}
                      {fields.dueDate && (
                        <td className="px-3 text-foreground">
                          {project.dueDate || "No date"}
                        </td>
                      )}
                      <td
                        className="w-24 pr-8 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="ml-auto flex text-muted-foreground hover:text-foreground focus:outline-none"
                            aria-label="Project actions"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => removeProject(project.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filteredProjects.length === 0 && (
                  <tr className="h-9">
                    <td colSpan={visibleColumnCount} className="px-3 text-muted-foreground">
                      {projects.length === 0 ? "No projects yet." : "No projects match your search or filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
