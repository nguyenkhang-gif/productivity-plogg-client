import { Search } from "lucide-react";
import { FilterConfig } from "./types";

const selectCls =
  "text-sm bg-white/5 border border-border rounded-lg px-3 py-1.5 text-text-primary focus:outline-none focus:border-accent";

export default function AppFilterBar({ filters }: { filters: FilterConfig[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        if (filter.type === "text") {
          return (
            <div key={filter.key} className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                placeholder={filter.placeholder}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-white/5 border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </div>
          );
        }

        return (
          <select
            key={filter.key}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className={selectCls}
          >
            {(filter.options ?? []).map((o) => (
              <option key={o.value} value={o.value} className="bg-background">
                {o.label}
              </option>
            ))}
          </select>
        );
      })}
    </div>
  );
}
