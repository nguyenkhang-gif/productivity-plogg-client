import { Play, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RunControlsProps {
  isRunning: boolean;
  canRun: boolean;
  status: string;
  runLabel?: string;
  onRun: () => void;
  onAbort: () => void;
  onReset: () => void;
  statusSlot?: React.ReactNode;
}

export function RunControls({
  isRunning, canRun, status, runLabel, onRun, onAbort, onReset, statusSlot,
}: RunControlsProps) {
  const label = runLabel ?? (status === "paused" ? "Resume" : "Run");

  return (
    <div className="flex items-center gap-3">
      {isRunning ? (
        <Button onClick={onAbort} variant="destructive" size="sm">
          <Square className="h-3.5 w-3.5 mr-1.5" />Abort
        </Button>
      ) : (
        <Button
          onClick={onRun}
          disabled={!canRun}
          size="sm"
          className="bg-[#0E78F9] hover:bg-[#0E78F9]/90 disabled:opacity-40"
        >
          <Play className="h-3.5 w-3.5 mr-1.5" />{label}
        </Button>
      )}
      <Button
        onClick={onReset}
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
        disabled={isRunning}
      >
        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />Reset Progress
      </Button>
      {statusSlot}
    </div>
  );
}
