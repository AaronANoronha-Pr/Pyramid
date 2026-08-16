import { STATUS_DEFS, type ApiTask } from "@/lib/api-tasks";
import { STATUS_DOT } from "@/lib/status-colors";

export function ProjectStatusChart({ tasks }: { tasks: ApiTask[] }) {
  const total = tasks.length;
  const counts = STATUS_DEFS.map((status) => ({
    ...status,
    count: tasks.filter((t) => t.status === status.id).length,
  })).filter((s) => s.count > 0);

  if (total === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tasks yet — add one to see the status breakdown.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {counts.map((s) => (
          <div
            key={s.id}
            className={STATUS_DOT[s.id]}
            style={{ width: `${(s.count / total) * 100}%` }}
            title={`${s.title}: ${s.count}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {counts.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-sm">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s.id]}`} />
            <span className="text-foreground">{s.title}</span>
            <span className="text-muted-foreground">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
