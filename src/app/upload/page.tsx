"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/core/redux/store";
import { setIcons, removeIcon, setProvider, initProvider, CloudProvider } from "@/core/redux/upload";
import { useUploadProvider } from "@/core/hooks/useUploadProvider";
import { useFileHelpers } from "@/core/hooks/useFileHelpers";
import { FileItem, PaginatedFiles } from "@/core/services/api/upload";
import { Bucket, PendingFile } from "@/components/upload/types";
import ProviderSelector, { PROVIDERS } from "@/components/upload/ProviderSelector";
import DropZone from "@/components/upload/DropZone";
import FileGrid from "@/components/upload/FileGrid";
import FilePagination from "@/components/upload/FilePagination";
import DeleteConfirmModal from "@/components/upload/DeleteConfirmModal";
import UploadConfirmModal from "@/components/upload/UploadConfirmModal";

const LIMIT = 20;
const EMPTY_DATA: PaginatedFiles = {
  items: [],
  pagination: { page: 1, limit: LIMIT, total: 0, totalPages: 1 },
};

function buildPreviews(fileList: FileList, isImage: (n: string) => boolean): PendingFile[] {
  return Array.from(fileList).map((file) => ({
    file,
    previewUrl: isImage(file.name) ? URL.createObjectURL(file) : null,
  }));
}

export default function UploadPage() {
  const { isImage, filterOversized } = useFileHelpers();
  const dispatch = useDispatch<AppDispatch>();
  const api = useUploadProvider();
  const provider = useSelector((s: RootState) => s.upload.provider);

  const [tab, setTab] = useState<Bucket>("files");
  const [data, setData] = useState<PaginatedFiles>(EMPTY_DATA);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null);

  useEffect(() => { dispatch(initProvider()); }, [dispatch]);

  const load = useCallback(async (bucket: Bucket, p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = bucket === "files"
        ? await api.listFiles(p, LIMIT)
        : await api.listIcons(p, LIMIT);
      setData(result);
      if (bucket === "icons") dispatch(setIcons(result));
    } catch {
      setError("Không thể tải danh sách file.");
    } finally {
      setIsLoading(false);
    }
  }, [api, dispatch]);

  useEffect(() => {
    setPage(1);
    load(tab, 1);
  }, [tab, load]);

  const changePage = (p: number) => { setPage(p); load(tab, p); };

  const handleFiles = (fileList: FileList) => {
    const oversized = filterOversized(Array.from(fileList));
    if (oversized.length) {
      setError(`${oversized.length} file vượt quá 5MB: ${oversized.map((f) => f.name).join(", ")}`);
      return;
    }
    setError(null);
    setPending(buildPreviews(fileList, isImage));
  };

  const clearPending = () => {
    pending.forEach((p) => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl); });
    setPending([]);
  };

  const removePending = (idx: number) => {
    if (pending[idx].previewUrl) URL.revokeObjectURL(pending[idx].previewUrl!);
    setPending((prev) => prev.filter((_, i) => i !== idx));
  };

  const confirmUpload = async () => {
    setIsUploading(true);
    setError(null);
    try {
      await Promise.all(
        pending.map(({ file }) => tab === "files" ? api.uploadFile(file) : api.uploadIcon(file))
      );
      if (provider === "cloudinary") await new Promise((r) => setTimeout(r, 2000));
      clearPending();
      setPage(1);
      await load(tab, 1);
    } catch {
      setError("Upload thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError(null);
    const key = deleteTarget.publicId ?? deleteTarget.name;
    try {
      if (tab === "files") {
        await api.deleteFile(key);
      } else {
        await api.deleteIcon(key);
        dispatch(removeIcon(deleteTarget.name));
      }
      setDeleteTarget(null);
      await load(tab, page);
    } catch {
      setError("Xóa file thất bại. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleSelectProvider = (p: CloudProvider) => {
    dispatch(setProvider(p));
    setPage(1);
    setData(EMPTY_DATA);
  };

  const currentProvider = PROVIDERS.find((p) => p.value === provider)!;
  const { items, pagination } = data;

  return (
    <div className="min-h-screen bg-[#1C1F2E] text-white px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold">File Manager</h1>
        <ProviderSelector provider={provider} onSelect={handleSelectProvider} />
      </div>

      <p className="text-slate-400 text-sm mb-6">
        Upload và quản lý file, icon của bạn &middot;{" "}
        <span className="text-blue-400">{currentProvider.label}</span>
      </p>

      {/* Tab */}
      <div className="flex gap-1 bg-[#161925] rounded-xl p-1 w-fit mb-6">
        {(["files", "icons"] as Bucket[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            {t === "files" ? "Files" : "Icons"}
          </button>
        ))}
      </div>

      <DropZone tab={tab} onFiles={handleFiles} />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <FileGrid
        items={items}
        isLoading={isLoading}
        copiedUrl={copiedUrl}
        onCopy={copyUrl}
        onDelete={setDeleteTarget}
      />

      {!isLoading && (
        <FilePagination
          items={items}
          pagination={pagination}
          page={page}
          onChangePage={changePage}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          isDeleting={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {pending.length > 0 && (
        <UploadConfirmModal
          pending={pending}
          tab={tab}
          providerLabel={currentProvider.label}
          isUploading={isUploading}
          onConfirm={confirmUpload}
          onCancel={clearPending}
          onRemove={removePending}
        />
      )}
    </div>
  );
}
