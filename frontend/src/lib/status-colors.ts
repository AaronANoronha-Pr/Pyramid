import type { TaskStatus } from "@/lib/api-tasks";

export const STATUS_DOT: Record<TaskStatus, string> = {
  backlog: "bg-[#F59E0B]",
  todo: "bg-muted-foreground",
  inprogress: "bg-[#3B82F6]",
  qatesting: "bg-[#8B5CF6]",
  uattesting: "bg-[#EC4899]",
  onhold: "bg-[#F97316]",
  done: "bg-[#22C55E]",
};
