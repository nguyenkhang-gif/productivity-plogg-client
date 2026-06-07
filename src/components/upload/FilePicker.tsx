"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/core/redux/store";
import { setIcons, setProvider, initProvider, CloudProvider } from "@/core/redux/upload";
import { useUploadProvider } from "@/core/hooks/useUploadProvider";
import { FileItem, PaginatedFiles } from "@/core/services/api/upload";
import { Bucket } from "./types";
import FileGrid from "./FileGrid";
import FilePagination from "./FilePagination";
import ProviderSelector from "./ProviderSelector";

const LIMIT = 12;
const EMPTY: PaginatedFiles = {
  items: [],
  pagination: { page: 1, limit: LIMIT, total: 0, totalPages: 1 },
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function FilePicker({ open, onClose, onSelect }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const api = useUploadProvider();
  const provider = useSelector((s: RootState) => s.upload.provider);

  const [tab, setTab] = useState<Bucket>("files");
  const [data, setData] = useState<PaginatedFiles>(EMPTY);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<FileItem | null>(null);

  useEffect(() => { dispatch(initProvider()); }, [dispatch]);

  const load = useCallback(async (bucket: Bucket, p: number) => {
    setIsLoading(true);
    try {
      const result = bucket === "files"
        ? await api.listFiles(p, LIMIT)
        : await api.listIcons(p, LIMIT);
      setData(result);
      if (bucket === "icons") dispatch(setIcons(result));
    } finally {
      setIsLoading(false);
    }
  }, [api, dispatch]);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setPage(1);
    load(tab, 1);
  }, [open, tab, load]);

  const changePage = (p: number) => { setPage(p); load(tab, p); };

  const handleSelectProvider = (p: CloudProvider) => {
    dispatch(setProvider(p));
    setData(EMPTY);
    setPage(1);
    setSelected(null);
  };

  const handleConfirm = () => {
    if (!selected) return;
    onSelect(selected.publicUrl);
    onClose();
  };

  const { items, pagination } = data;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-modal border border-white/[0.08] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <p className="text-white font-semibold">Chọn ảnh từ thư viện</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {selected ? (
                <span className="text-blue-400 truncate max-w-xs inline-block">{selected.name}</span>
              ) : (
                "Click vào ảnh để chọn"
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ProviderSelector provider={provider} onSelect={handleSelectProvider} />
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab */}
        <div className="flex gap-1 bg-[#161925] rounded-xl p-1 w-fit mx-5 mt-4 flex-shrink-0">
          {(["files", "icons"] as Bucket[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(null); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              {t === "files" ? "Files" : "Icons"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <FileGrid
            items={items}
            isLoading={isLoading}
            selectedUrl={selected?.publicUrl ?? null}
            onSelect={setSelected}
            columns="3"
          />
          {!isLoading && (
            <FilePagination
              items={items}
              pagination={pagination}
              page={page}
              onChangePage={changePage}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-white/[0.06] flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Check size={14} />
            Chèn URL
          </button>
        </div>
      </div>
    </div>
  );
}
