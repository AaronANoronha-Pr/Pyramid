"use client";

import { useState } from "react";
import { CalendarIcon, ChevronDown, Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { PriorityBadge, PRIORITY_OPTIONS } from "@/components/priority-badge";
import { ASSIGNEE_OPTIONS } from "@/lib/assignees";
import type { TaskPriority } from "@/lib/api-tasks";

const fieldTriggerClass =
  "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function CreateProjectDialog({
  onCreate,
  trigger,
}: {
  onCreate: (
    name: string,
    extra: {
      description: string;
      priority: TaskPriority;
      leadName: string;
      dueDate: string;
    },
  ) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [leadName, setLeadName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingDate, setEditingDate] = useState(false);

  function reset() {
    setName("");
    setDescription("");
    setPriority("medium");
    setLeadName("");
    setDueDate("");
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) reset();
  }

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed, {
      description: description.trim(),
      priority,
      leadName,
      dueDate,
    });
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<button type="button" />}>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-4 pt-3 pb-4">
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Project name"
            className="h-9 text-sm"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />

          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Priority</span>
              <DropdownMenu>
                <DropdownMenuTrigger className={fieldTriggerClass}>
                  <PriorityBadge priority={priority} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-32">
                  {PRIORITY_OPTIONS.map((p) => (
                    <DropdownMenuItem key={p} onClick={() => setPriority(p)}>
                      <PriorityBadge priority={p} showCaret={false} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Lead</span>
              <DropdownMenu>
                <DropdownMenuTrigger className={fieldTriggerClass}>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Avatar className="h-5 w-5 shrink-0">
                      <AvatarFallback className="text-[10px]">
                        {leadName ? leadName.slice(0, 2).toUpperCase() : "+"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">{leadName || "Unassigned"}</span>
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  {ASSIGNEE_OPTIONS.map((member) => (
                    <DropdownMenuItem
                      key={member.name}
                      onClick={() =>
                        setLeadName(member.name === "Unassigned" ? "" : member.name)
                      }
                      className="flex items-center gap-2"
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-muted text-[9px] font-semibold text-card-foreground">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span>{member.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Due date</span>
              <Popover open={editingDate} onOpenChange={setEditingDate}>
                <PopoverTrigger className={fieldTriggerClass}>
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {dueDate || "No date"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  className="w-auto rounded-[16px] border border-border bg-popover p-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
                >
                  <CalendarPicker
                    value={dueDate}
                    onSelectDate={(formatted) => {
                      setDueDate(formatted === "No date" ? "" : formatted);
                      setEditingDate(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={submit} disabled={!name.trim()}>
            <Plus className="h-4 w-4" />
            Create project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
