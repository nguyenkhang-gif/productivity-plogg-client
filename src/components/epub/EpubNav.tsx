import { BookOpen, Database, Languages } from "lucide-react";

type AppMode = "epub" | "context" | "translate";

interface ModeTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}

function ModeTab({ active, onClick, icon, label, disabled }: ModeTabProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        disabled
          ? "text-gray-600 cursor-not-allowed"
          : active
          ? "bg-[#0E78F9]/15 text-[#0E78F9]"
          : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
      }`}
    >
      {icon}
      {label}
      {disabled && <span className="text-[10px] text-gray-600 ml-1">soon</span>}
    </button>
  );
}

interface EpubNavProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export function EpubNav({ mode, onModeChange }: EpubNavProps) {
  return (
    <div className="border-b border-gray-800 px-6 py-3 flex items-center gap-6">
      <div className="flex items-center gap-2 text-gray-300">
        <BookOpen className="h-5 w-5 text-[#0E78F9]" />
        <span className="font-semibold">Epub Tools</span>
      </div>
      <div className="flex gap-1">
        <ModeTab
          active={mode === "epub"}
          onClick={() => onModeChange("epub")}
          icon={<BookOpen className="h-3.5 w-3.5" />}
          label="EPUB Extractor"
        />
        <ModeTab
          active={mode === "context"}
          onClick={() => onModeChange("context")}
          icon={<Database className="h-3.5 w-3.5" />}
          label="Lấy Context"
        />
        <ModeTab
          active={mode === "translate"}
          onClick={() => onModeChange("translate")}
          icon={<Languages className="h-3.5 w-3.5" />}
          label="Dịch"
        />
      </div>
    </div>
  );
}
