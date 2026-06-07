import { Loader2 } from "lucide-react";

interface StreamingPanelProps {
  text: string;
  label?: string;
}

export function StreamingPanel({ text, label = "Streaming Response" }: StreamingPanelProps) {
  return (
    <div className="bg-surface-raised rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      </div>
      <div className="max-h-72 overflow-y-auto bg-surface rounded-lg p-3">
        <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">{text}</pre>
      </div>
    </div>
  );
}
