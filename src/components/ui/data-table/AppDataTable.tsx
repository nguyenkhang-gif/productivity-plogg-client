import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { styles } from "@/core/config/styles";
import {
  ColumnConfig,
  RowActionConfig,
  PaginationInfo,
  getNestedValue,
} from "./types";
import Pagination from "./Pagination";
import ActionsCell from "./ActionsCell";

const actionVariantCls: Record<NonNullable<RowActionConfig<unknown>["variant"]>, string> = {
  default: "bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-primary",
  success: "bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400",
  danger: "bg-white/5 hover:bg-red-600/20 text-text-muted hover:text-red-400",
};

function renderCell<T>(row: T, column: ColumnConfig<T>): ReactNode {
  if (column.render) return column.render(row);

  const value = getNestedValue(row, column.key);

  if (column.format === "badge") {
    if (value == null || value === "") return null;
    const cls = column.badgeMap?.[String(value)] ?? "";
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
        {String(value)}
      </span>
    );
  }

  if (column.format === "date") {
    if (!value) return "—";
    return column.dateFormat ? column.dateFormat(value) : new Date(value as string).toLocaleDateString();
  }

  return value == null || value === "" ? "—" : String(value);
}

export default function AppDataTable<T>({
  columns,
  items,
  loading,
  rowKey,
  pagination,
  onPageChange,
  onLimitChange,
  limitOptions,
  rowActions,
  renderActions,
  actionsVariant = "inline",
  emptyMessage = "No data found.",
  dense = false,
}: {
  columns: ColumnConfig<T>[];
  items: T[];
  loading: boolean;
  rowKey: (row: T) => string;
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  rowActions?: RowActionConfig<T>[];
  renderActions?: (row: T) => ReactNode;
  /** "dropdown" collapses the actions cell behind a "⋮" trigger. */
  actionsVariant?: "inline" | "dropdown";
  emptyMessage?: string;
  /** Compact rows (less vertical padding). */
  dense?: boolean;
}) {
  const showActionsColumn = Boolean(renderActions || (rowActions && rowActions.length > 0));
  const cellPad = dense ? "px-4 py-1.5" : "px-4 py-3";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center">
            <Loader2 size={18} className="animate-spin text-accent-text" />
            <span className={`${styles.muted} text-sm`}>Loading...</span>
          </div>
        ) : items.length === 0 ? (
          <p className={`${styles.muted} text-sm py-16 text-center`}>{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted text-left bg-white/[0.02]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`${cellPad} font-medium ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""}`}
                    >
                      {col.header}
                    </th>
                  ))}
                  {showActionsColumn && <th className={`${cellPad} font-medium`}>Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((row) => (
                  <tr key={rowKey(row)} className="hover:bg-white/[0.025] transition-colors">
                    {columns.map((col) => {
                      const extraCls = typeof col.className === "function" ? col.className(row) : col.className;
                      return (
                        <td
                          key={col.key}
                          onClick={col.onCellClick ? () => col.onCellClick!(row) : undefined}
                          className={`${cellPad} ${col.nowrap ? "whitespace-nowrap" : ""} ${
                            col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : ""
                          } ${col.onCellClick ? "cursor-pointer hover:text-accent-text transition-colors" : ""} ${extraCls ?? ""}`}
                        >
                          {renderCell(row, col)}
                        </td>
                      );
                    })}
                    {showActionsColumn && (
                      <td className={cellPad}>
                        <ActionsCell variant={actionsVariant}>
                          {renderActions
                            ? renderActions(row)
                            : rowActions
                                ?.filter((a) => a.show?.(row) ?? true)
                                .map((action) => (
                                  <button
                                    key={action.key}
                                    onClick={() => action.onClick(row)}
                                    disabled={action.disabled?.(row)}
                                    title={action.tooltip ?? action.label}
                                    className={`p-1.5 rounded-lg disabled:opacity-40 transition-colors ${
                                      actionVariantCls[action.variant ?? "default"]
                                    }`}
                                  >
                                    <action.icon size={14} />
                                  </button>
                                ))}
                        </ActionsCell>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && onPageChange && onLimitChange && (
        <Pagination
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          limitOptions={limitOptions}
        />
      )}
    </div>
  );
}
