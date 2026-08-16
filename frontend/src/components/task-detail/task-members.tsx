"use client";

import { Plus, Users, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ASSIGNEE_OPTIONS } from "@/lib/assignees";
import { addMember, removeMember } from "@/lib/api-task-members";
import type { ApiTask } from "@/lib/api-tasks";
import { cn } from "@/lib/utils";

export function TaskMembers({
  task,
  onChange,
  locked,
}: {
  task: ApiTask;
  onChange: () => void;
  locked?: boolean;
}) {
  const members = task.members ?? [];
  const availableOptions = ASSIGNEE_OPTIONS.filter(
    (opt) =>
      opt.name !== "Unassigned" &&
      !members.some((m) => m.memberName === opt.name),
  );

  async function handleAdd(name: string, initials: string) {
    await addMember(task.id, { memberName: name, memberInits: initials });
    onChange();
  }

  async function handleRemove(id: string) {
    await removeMember(task.id, id);
    onChange();
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {members.map((member) =>
        locked ? (
          <Avatar key={member.id} className="h-6 w-6">
            <AvatarFallback className="bg-muted text-[10px] font-semibold text-card-foreground">
              {member.memberInits}
            </AvatarFallback>
          </Avatar>
        ) : (
          <button
            key={member.id}
            type="button"
            onClick={() => handleRemove(member.id)}
            className="group/avatar relative"
            aria-label={`Remove ${member.memberName}`}
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-muted text-[10px] font-semibold text-card-foreground group-hover/avatar:opacity-0">
                {member.memberInits}
              </AvatarFallback>
            </Avatar>
            <X className="absolute inset-0 m-auto hidden h-3.5 w-3.5 text-foreground group-hover/avatar:block" />
          </button>
        ),
      )}

      {!locked && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "focus:outline-none",
              members.length === 0
                ? "flex items-center gap-1.5 p-0 text-xs font-medium text-foreground hover:underline"
                : "flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            aria-label="Add member"
          >
            {members.length === 0 ? (
              <>
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Add members
              </>
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40 rounded-xl p-1">
            {availableOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-xs text-muted-foreground">
                Everyone added
              </div>
            ) : (
              availableOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.name}
                  onClick={() => handleAdd(opt.name, opt.initials)}
                  className="flex cursor-pointer items-center gap-2 text-xs"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-muted text-[9px] font-semibold text-card-foreground">
                      {opt.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span>{opt.name}</span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
