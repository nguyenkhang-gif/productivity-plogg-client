"use client";

import { useState } from "react";
import { BookMarked, ChevronDown, ChevronUp, Loader2, Download, Trash2, Eye } from "lucide-react";
import {
  useGetStoryContexts,
  useDeleteStoryContext,
} from "@/core/services/client/storyContexts";
import type { StoryContext } from "@/core/services/api/storyContexts";
import { downloadFile } from "@/core/lib/epub/downloadFile";
import { ContextPreviewDialog } from "../dialogs/ContextPreviewDialog";

export function ContextLibrary() {
  const { data, isLoading } = useGetStoryContexts(1, 20);
  const { mutate: deleteCtx } = useDeleteStoryContext();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [previewCtx, setPreviewCtx] = useState<StoryContext | null>(null);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteCtx(id, { onSettled: () => setDeletingId(null) });
  };

  const handleDownload = (ctx: StoryContext) => {
    downloadFile(
      `${ctx.title.replace(/\s+/g, "_")}_context.json`,
      JSON.stringify(ctx, null, 2),
      "application/json;charset=utf-8"
    );
  };

  const count = data?.pagination?.total ?? 0;

  return (
    <>
      {previewCtx && (
        <ContextPreviewDialog
          open={!!previewCtx}
          onClose={() => setPreviewCtx(null)}
          contextJson={JSON.stringify(previewCtx)}
          title={`${previewCtx.title} — ${previewCtx.author}`}
        />
      )}
      <div className="bg-[#161925] rounded-xl overflow-hidden">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-[#0E78F9]" />
            <span className="text-sm font-semibold text-gray-300">Context Library</span>
            {count > 0 && (
              <span className="text-xs bg-[#0E78F9]/20 text-[#0E78F9] rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </div>
          {collapsed
            ? <ChevronDown className="h-4 w-4 text-gray-500" />
            : <ChevronUp className="h-4 w-4 text-gray-500" />
          }
        </button>

        {!collapsed && (
          <div className="border-t border-gray-800">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-[#0E78F9]" />
              </div>
            ) : count === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">
                Chưa có context nào được lưu.
              </div>
            ) : (
              <div className="p-3 grid grid-cols-2 gap-2">
                {data!.data.map((ctx) => (
                  <div key={ctx.id} className="bg-[#1C1F2E] rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{ctx.title}</p>
                        <p className="text-xs text-gray-500">{ctx.author}</p>
                      </div>
                      <span className="text-[10px] bg-gray-700/60 text-gray-300 rounded px-1.5 py-0.5 shrink-0 truncate max-w-[90px]">
                        {ctx.genre}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-600">
                        {new Date(ctx.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPreviewCtx(ctx)}
                          className="p-1 text-gray-500 hover:text-[#0E78F9] rounded hover:bg-white/5 transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(ctx)}
                          className="p-1 text-gray-500 hover:text-gray-300 rounded hover:bg-white/5 transition-colors"
                          title="Download JSON"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ctx.id)}
                          disabled={deletingId === ctx.id}
                          className="p-1 text-gray-500 hover:text-red-400 rounded hover:bg-white/5 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          {deletingId === ctx.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Trash2 className="h-3.5 w-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
