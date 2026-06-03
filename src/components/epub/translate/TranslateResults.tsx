"use client";

import { useState } from "react";
import { CheckCircle2, Download, Eye, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TranslatedFile } from "@/core/hooks/epub/useTranslation";
import { buildEpub } from "@/core/lib/epub/buildEpub";
import { downloadFile } from "@/core/lib/epub/downloadFile";

interface TranslateResultsProps {
  results: TranslatedFile[];
  onPreview: (file: { name: string; text: string }) => void;
  onDownloadOne: (name: string, text: string) => void;
  onDownloadAll: () => void;
}

function EpubExportForm({
  onExport,
  onCancel,
}: {
  onExport: (title: string, author: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !author.trim()) return;
    setLoading(true);
    try {
      await onExport(title.trim(), author.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1C1F2E] rounded-xl p-4 border border-gray-700 flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Export EPUB</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-gray-400 mb-1 block">Tên truyện *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Thiên Sứ Nhà Bên"
            className="w-full bg-[#161925] border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#0E78F9]"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 mb-1 block">Tác giả *</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="VD: Nguyễn Văn A"
            className="w-full bg-[#161925] border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#0E78F9]"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-500 h-7 px-2 text-xs">
          Huỷ
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim() || !author.trim() || loading}
          className="bg-[#0E78F9] hover:bg-[#0E78F9]/90 disabled:opacity-40 h-7 px-3 text-xs"
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <><BookOpen className="h-3.5 w-3.5 mr-1" />Tạo EPUB</>
          }
        </Button>
      </div>
    </div>
  );
}

export function TranslateResults({ results, onPreview, onDownloadOne, onDownloadAll }: TranslateResultsProps) {
  const [showEpubForm, setShowEpubForm] = useState(false);

  const handleExportEpub = async (title: string, author: string) => {
    const blob = await buildEpub({
      title,
      author,
      language: "vi",
      chapters: results.map((r) => ({ title: r.name, text: r.text })),
    });
    const safeName = title.replace(/[/\\?%*:|"<>]/g, "_");
    downloadFile(`${safeName}.epub`, blob, "application/epub+zip");
    setShowEpubForm(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Kết quả — {results.length} file(s)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowEpubForm((v) => !v)}
            className="text-purple-400 hover:text-purple-300 h-7 px-3"
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />Export EPUB
          </Button>
          {results.length > 1 && (
            <Button variant="ghost" size="sm" onClick={onDownloadAll} className="text-gray-400 hover:text-white h-7 px-3">
              <Download className="h-3.5 w-3.5 mr-1.5" />Tải tất cả .txt
            </Button>
          )}
        </div>
      </div>

      {showEpubForm && (
        <EpubExportForm
          onExport={handleExportEpub}
          onCancel={() => setShowEpubForm(false)}
        />
      )}

      <div className="grid grid-cols-1 gap-2">
        {results.map((r) => (
          <div key={r.name} className="bg-[#161925] rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{r.name}</p>
              <p className="text-[10px] text-gray-600">{r.wordCount.toLocaleString()} words dịch</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Button
                variant="ghost" size="sm"
                onClick={() => onPreview({ name: r.name, text: r.text })}
                className="text-gray-400 hover:text-[#0E78F9] h-7 px-2"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />Preview
              </Button>
              <Button
                variant="ghost" size="sm"
                onClick={() => onDownloadOne(r.name, r.text)}
                className="text-gray-400 hover:text-white h-7 px-2"
              >
                <Download className="h-3.5 w-3.5 mr-1" />.txt
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
