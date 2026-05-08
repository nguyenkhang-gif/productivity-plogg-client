import { useRef } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  placeholder: string;
  isSending: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

export default function ChatInput({
  value,
  placeholder,
  isSending,
  onChange,
  onSend,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="px-3 py-3 border-t border-white/[0.06] flex gap-2 flex-shrink-0">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 bg-[#1e2436] border border-white/[0.06] rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500/50 transition-colors"
      />
      <button
        onClick={onSend}
        disabled={!value.trim() || isSending}
        className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
      >
        <Send size={15} />
      </button>
    </div>
  );
}
