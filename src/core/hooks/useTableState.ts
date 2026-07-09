import { useState } from "react";
import { useDebounce } from "@/core/hooks/useDebounce";

export function useTableState({
  initialLimit = 20,
  searchDebounceMs = 400,
}: {
  initialLimit?: number;
  searchDebounceMs?: number;
} = {}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [searchInput, setSearchInput] = useState("");

  const search = useDebounce(searchInput, searchDebounceMs);

  const resetPage = () => setPage(1);

  const setSearch = (value: string) => {
    setSearchInput(value);
    resetPage();
  };

  const changeLimit = (value: number) => {
    setLimit(value);
    resetPage();
  };

  return {
    page,
    setPage,
    limit,
    setLimit: changeLimit,
    searchInput,
    search,
    setSearch,
    resetPage,
  };
}
