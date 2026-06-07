"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { Send, X, Eye, Edit3, Sparkles, Link as LinkIcon, Loader2, ClipboardPaste, Plus, FolderOpen } from "lucide-react";
import FilePicker from "@/components/upload/FilePicker";
import { useCreatePost, useUpdatePost, useGetPostById } from "@/core/services/client/posts";
import { useToast } from "@/core/hooks/use-toast";
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export default function CreatePostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit"); // /create-post?edit=<id> = edit mode

  const { data: editPost } = useGetPostById(editId ?? "");

  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [editorTab, setEditorTab] = useState<"rich" | "raw">("rich");
  const [pickerTarget, setPickerTarget] = useState<"thumbnail" | "content" | null>(null);

  // Prefill khi ở edit mode
  useEffect(() => {
    if (editId && editPost?.id === editId) {
      setContent(editPost.content);
      setImageUrls(editPost.imageUrls ?? []);
    }
  }, [editId, editPost]);

  const { toast } = useToast();
  const { mutate: createPost, isPending: isCreating } = useCreatePost();
  const { mutate: updatePost, isPending: isUpdating } = useUpdatePost();
  const isPending = isCreating || isUpdating;

  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: "Bắt đầu viết nội dung bài viết bằng Markdown...",
    status: false,
    minHeight: "300px",
    autofocus: true,
  }), []);

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed || imageUrls.includes(trimmed)) return;
    setImageUrls((prev) => [...prev, trimmed]);
    setUrlInput("");
  };

  const handleRemoveUrl = (url: string) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const handlePickerSelect = (url: string) => {
    if (pickerTarget === "thumbnail") {
      if (!imageUrls.includes(url)) setImageUrls((prev) => [...prev, url]);
    } else if (pickerTarget === "content") {
      setContent((prev) => prev + `\n![image](${url})\n`);
      setEditorTab("raw");
    }
    setPickerTarget(null);
  };

  const deriveTitle = (md: string) => {
    const firstLine = md.split("\n").find((l) => l.trim());
    return firstLine?.replace(/^#+\s*/, "").trim() || "";
  };

  const handleSubmit = () => {
    if (!content.trim()) return;

    const body = { title: deriveTitle(content), content, imageUrls };

    if (editId) {
      updatePost(
        { id: editId, body },
        {
          onSuccess: () => {
            toast({ title: "Đã lưu thay đổi", description: "Bài viết đã được cập nhật." });
            router.replace("/posts");
          },
        }
      );
    } else {
      createPost(body, {
        onSuccess: () => {
          toast({ title: "Đăng bài thành công", description: "Bài viết của bạn đã được xuất bản." });
          router.replace("/posts");
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-page text-slate-200 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-blue-400" size={24} />
            {editId ? "Chỉnh sửa bài viết" : "Viết Blog Markdown"}
          </h1>
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${mode === "edit" ? "bg-blue-600 text-white" : "hover:bg-slate-700"}`}
            >
              <Edit3 size={16} /> Soạn thảo
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${mode === "preview" ? "bg-blue-600 text-white" : "hover:bg-slate-700"}`}
            >
              <Eye size={16} /> Xem trước
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {mode === "edit" ? (
            <div className="bg-card border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              {/* Image URLs */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-400">Ảnh thumbnail (URL)</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500">
                    <LinkIcon size={14} className="text-slate-500 flex-shrink-0" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    disabled={!urlInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-xl transition-colors"
                  >
                    <Plus size={15} /> Thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerTarget("thumbnail")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm rounded-xl transition-colors"
                  >
                    <FolderOpen size={15} /> Thư viện
                  </button>
                </div>

                {imageUrls.length > 0 && (
                  <div className={`grid gap-2 ${imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {imageUrls.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-700">
                        <img src={url} alt="" className="w-full h-36 object-cover" />
                        <button
                          onClick={() => handleRemoveUrl(url)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-400">Nội dung (Markdown)</label>
                  <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPickerTarget("content")}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <FolderOpen size={12} /> Chèn ảnh
                  </button>
                  <div className="flex bg-slate-900 border border-slate-700 p-0.5 rounded-lg text-xs">
                    <button
                      onClick={() => setEditorTab("rich")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${editorTab === "rich" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      <Edit3 size={12} /> Editor
                    </button>
                    <button
                      onClick={() => setEditorTab("raw")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${editorTab === "raw" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}
                    >
                      <ClipboardPaste size={12} /> Dán MD
                    </button>
                  </div>
                  </div>
                </div>

                {editorTab === "rich" ? (
                  <div className="dark-editor">
                    <SimpleMDE value={content} onChange={setContent} options={editorOptions} />
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Dán nội dung Markdown vào đây..."
                    className="w-full min-h-[300px] bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 font-mono placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-slate-800 rounded-2xl p-8 min-h-[600px] shadow-2xl">
              {imageUrls.length > 0 && (
                <div className={`grid gap-1 mb-6 rounded-xl overflow-hidden ${imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {imageUrls.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full h-52 object-cover" />
                  ))}
                </div>
              )}
              <article className="prose prose-sm max-w-none [&_p]:text-slate-300 [&_p]:leading-relaxed [&_p]:my-1.5 [&_h1]:text-slate-100 [&_h2]:text-slate-100 [&_h3]:text-slate-100 [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:mt-2 [&_h3]:mb-1 [&_strong]:text-slate-200 [&_em]:text-slate-300 [&_em]:italic [&_a]:text-blue-400 [&_a]:no-underline hover:[&_a]:underline [&_code]:text-sky-300 [&_code]:bg-slate-800/80 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-slate-900/80 [&_pre]:border [&_pre]:border-white/[0.06] [&_pre]:rounded-xl [&_pre]:p-4 [&_blockquote]:border-l-2 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:text-slate-400 [&_blockquote]:italic [&_ul]:text-slate-300 [&_ol]:text-slate-300 [&_li]:marker:text-slate-500 [&_hr]:border-white/[0.06]">
                <ReactMarkdown>{content || "*Chưa có nội dung...*"}</ReactMarkdown>
              </article>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-sm font-medium transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !content.trim()}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95"
            >
              {isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Đang lưu...</>
              ) : (
                <><Send size={16} /> {editId ? "Lưu thay đổi" : "Xuất bản"}</>
              )}
            </button>
          </div>
        </div>
      </div>

      <FilePicker
        open={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handlePickerSelect}
      />

      <style jsx global>{`
        .dark-editor .editor-toolbar { background: #1e293b; border-color: #334155; border-radius: 8px 8px 0 0; }
        .dark-editor .editor-toolbar button { color: #94a3b8 !important; }
        .dark-editor .editor-toolbar button.active,
        .dark-editor .editor-toolbar button:hover { background: #334155 !important; }
        .dark-editor .CodeMirror { background: #0f172a !important; color: #e2e8f0 !important; border-color: #334155; border-radius: 0 0 8px 8px; }
      `}</style>
    </div>
  );
}
