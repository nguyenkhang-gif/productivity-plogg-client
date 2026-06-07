"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveContextFormProps {
  contextJson: string;
  isSaving: boolean;
  onSave: (data: { title: string; author: string }) => Promise<void>;
  onCancel: () => void;
}

export function SaveContextForm({ contextJson, isSaving, onSave, onCancel }: SaveContextFormProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!title) {
      try {
        const parsed = JSON.parse(contextJson);
        if (parsed.title) setTitle(parsed.title);
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !author.trim()) return;
    setError(null);
    try {
      await onSave({ title: title.trim(), author: author.trim() });
    } catch (err) {
      setError((err as Error).message ?? "Lưu thất bại.");
    }
  };

  return (
    <div className="mb-3 bg-surface rounded-lg p-3 flex flex-col gap-2 border border-gray-700">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-400 mb-1 block">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tên truyện"
            className="w-full bg-surface-raised border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 mb-1 block">Author *</label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Tác giả"
            className="w-full bg-surface-raised border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-gray-500 h-7 px-2 text-xs"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim() || !author.trim() || isSaving}
          className="bg-accent hover:bg-accent/90 disabled:opacity-40 h-7 px-3 text-xs"
        >
          {isSaving
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <><Save className="h-3.5 w-3.5 mr-1" />Save to Library</>
          }
        </Button>
      </div>
    </div>
  );
}
