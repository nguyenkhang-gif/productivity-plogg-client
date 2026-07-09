import { ReactNode, useState } from "react";
import { MoreVertical } from "lucide-react";

export default function ActionsCell({
  variant,
  children,
}: {
  variant: "inline" | "dropdown";
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (variant === "inline") {
    return <div className="flex items-center gap-1.5 flex-wrap">{children}</div>;
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Row actions"
      >
        <MoreVertical size={16} />
      </button>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="absolute right-0 mt-2 z-20 min-w-[160px] rounded-md shadow-lg bg-modal border border-border p-2 flex flex-col gap-1"
        >
          {children}
        </div>
      )}
    </div>
  );
}
