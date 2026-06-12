import { X, Minus } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  onMinimize: () => void;
  onClose: () => void;
}

export default function ChatHeader({ title, onMinimize, onClose }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-modal flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-text-primary text-sm font-semibold">{title}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onMinimize}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
        >
          <Minus size={14} />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
