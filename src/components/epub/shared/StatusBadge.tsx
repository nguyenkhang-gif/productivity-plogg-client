import { CheckCircle2, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  countdown: number;
  round: number;
}

export function StatusBadge({ status, countdown, round }: StatusBadgeProps) {
  if (status === "idle") return null;
  if (status === "running") {
    return (
      <span className="text-xs text-text-muted flex items-center gap-1">
        {countdown > 0
          ? <><Clock className="h-3 w-3" />Next batch in {countdown}s</>
          : `Round ${round} processing...`
        }
      </span>
    );
  }
  if (status === "paused") return <span className="text-xs text-yellow-400">Paused</span>;
  if (status === "done") return <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Done</span>;
  if (status === "error") return <span className="text-xs text-red-400">Error</span>;
  return null;
}
