import { ChevronLeft, ChevronRight } from "lucide-react";
import { PaginatedFiles } from "@/core/services/api/upload";
import { useFileHelpers } from "@/core/hooks/useFileHelpers";

interface Props {
  items: PaginatedFiles["items"];
  pagination: PaginatedFiles["pagination"];
  page: number;
  onChangePage: (p: number) => void;
}

export default function FilePagination({ items, pagination, page, onChangePage }: Props) {
  const { formatBytes } = useFileHelpers();

  if (pagination.totalPages <= 1 && items.length === 0) return null;

  if (pagination.totalPages <= 1) {
    return (
      <p className="text-slate-600 text-xs mt-4 text-right">
        {pagination.total} file · {formatBytes(items.reduce((s, f) => s + f.size, 0))} tổng
      </p>
    );
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-slate-500 text-xs">
        {pagination.total} file · trang {pagination.page}/{pagination.totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChangePage(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-blue-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChangePage(p)}
            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
              p === page ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChangePage(page + 1)}
          disabled={page >= pagination.totalPages}
          className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-blue-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
