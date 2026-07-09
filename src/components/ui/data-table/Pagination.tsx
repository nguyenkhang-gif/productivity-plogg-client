import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { PaginationInfo } from "./types";

export default function Pagination({
  pagination,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50, 100],
}: {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  limitOptions?: number[];
}) {
  const { page, limit, total, totalPages } = pagination;

  return (
    <div className="rounded-xl border border-border bg-white/[0.02] px-4 py-3 flex items-center justify-between gap-4">
      {/* Left: rows per page */}
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span>Rows per page</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="bg-white/5 border border-border rounded-lg px-2 py-1 text-text-primary text-sm focus:outline-none focus:border-accent"
        >
          {limitOptions.map((n) => (
            <option key={n} value={n} className="bg-background">{n}</option>
          ))}
        </select>
        <span className="text-text-muted/60">
          {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}
        </span>
      </div>

      {/* Right: page buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          title="First page"
          className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted disabled:opacity-30 transition-colors"
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          title="Previous page"
          className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page number pills */}
        <div className="flex items-center gap-1 mx-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "…")[]>((acc, p, idx, arr) => {
              if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="px-1 text-text-muted text-sm">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`min-w-[30px] h-[30px] rounded-lg text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-accent text-white"
                      : "hover:bg-white/10 text-text-muted"
                  }`}
                >
                  {p}
                </button>
              )
            )}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          title="Next page"
          className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          title="Last page"
          className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted disabled:opacity-30 transition-colors"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}
