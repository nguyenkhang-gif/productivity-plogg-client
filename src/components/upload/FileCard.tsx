import Image from "next/image";
import { FileText, Copy, Check, ImageIcon, Trash2 } from "lucide-react";
import { FileItem } from "@/core/services/api/upload";
import { useFileHelpers } from "@/core/hooks/useFileHelpers";

interface Props {
  item: FileItem;
  // default mode
  isCopied?: boolean;
  onCopy?: () => void;
  onDelete?: () => void;
  // selectable mode
  isSelected?: boolean;
  onSelect?: (item: FileItem) => void;
}

export default function FileCard({ item, isCopied, onCopy, onDelete, isSelected, onSelect }: Props) {
  const { isImage, formatBytes } = useFileHelpers();
  const img = isImage(item.name);
  const selectable = !!onSelect;

  return (
    <div
      onClick={selectable ? () => onSelect(item) : undefined}
      className={`group relative bg-[#161925] border rounded-xl overflow-hidden transition-colors ${
        selectable
          ? `cursor-pointer ${isSelected ? "border-blue-500 ring-2 ring-blue-500/30" : "border-white/[0.06] hover:border-blue-400/50"}`
          : "border-white/[0.06] hover:border-blue-500/30"
      }`}
    >
      <div className="aspect-square flex items-center justify-center bg-[#1a1f2e] relative">
        {img ? (
          <Image src={item.publicUrl} alt={item.name} fill className="object-cover" sizes="200px" />
        ) : (
          <FileText size={32} className="text-slate-600" />
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <Check size={13} className="text-white" />
            </div>
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-slate-300 text-xs font-medium truncate">{item.name}</p>
        <p className="text-slate-600 text-[10px] mt-0.5">{formatBytes(item.size)}</p>
      </div>

      {/* Default mode overlay */}
      {!selectable && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button onClick={onCopy} title="Copy URL" className="p-2 rounded-lg bg-white/10 hover:bg-blue-600 transition-colors">
            {isCopied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          </button>
          <a href={item.publicUrl} target="_blank" rel="noopener noreferrer" title="Mở file" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <ImageIcon size={15} />
          </a>
          <button onClick={onDelete} title="Xóa file" className="p-2 rounded-lg bg-white/10 hover:bg-red-600 transition-colors">
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
