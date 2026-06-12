"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import { Send, X, Eye, Edit3, Sparkles, Link as LinkIcon, Loader2, ClipboardPaste, Plus, FolderOpen, Tag } from "lucide-react";
import { PostCategory } from "@/core/enums";
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

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [editorTab, setEditorTab] = useState<"rich" | "raw">("rich");
  const [pickerTarget, setPickerTarget] = useState<"thumbnail" | "content" | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [category, setCategory] = useState<PostCategory | null>(null);

  // Prefill khi ở edit mode
  useEffect(() => {
    if (editId && editPost?.id === editId) {
      setTitle(editPost.title ?? "");
      setContent(editPost.content);
      setImageUrls(editPost.imageUrls ?? []);
      setTags((editPost.tags ?? []).map((t) =>
        typeof t === "string" ? t : (t as { slug?: string; name?: string }).slug ?? (t as { name?: string }).name ?? ""
      ).filter(Boolean));
      setCategory((editPost.category as PostCategory) ?? null);
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

    const body = {
      title: title.trim() || deriveTitle(content),
      content,
      imageUrls,
      tags: tags.length > 0 ? tags : undefined,
      category: category ?? undefined,
    };

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
    <div className="min-h-screen bg-page py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="text-accent-text" size={24} />
            {editId ? "Chỉnh sửa bài viết" : "Viết Blog Markdown"}
          </h1>
          <div className="flex bg-surface p-1 rounded-lg border border-border">
            <button
              onClick={() => setMode("edit")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all text-sm ${mode === "edit" ? "bg-accent text-white" : "text-text-muted hover:bg-surface-raised hover:text-text-primary"}`}
            >
              <Edit3 size={16} /> Soạn thảo
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all text-sm ${mode === "preview" ? "bg-accent text-white" : "text-text-muted hover:bg-surface-raised hover:text-text-primary"}`}
            >
              <Eye size={16} /> Xem trước
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {mode === "edit" ? (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-xl">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Tiêu đề</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tiêu đề bài viết..."
                  className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-base text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Danh mục</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.values(PostCategory) as PostCategory[]).map((cat) => {
                    const labels: Record<PostCategory, string> = {
                      [PostCategory.Note]: "Ghi chú",
                      [PostCategory.Achievement]: "Thành tích",
                      [PostCategory.Question]: "Câu hỏi",
                      [PostCategory.Tutorial]: "Hướng dẫn",
                    };
                    const active = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(active ? null : cat)}
                        className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                          active
                            ? "bg-accent border-accent text-white"
                            : "border-border text-text-muted hover:border-accent/40 hover:text-text-primary"
                        }`}
                      >
                        {labels[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tag input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted flex items-center gap-1.5">
                  <Tag size={13} /> Tags
                </label>
                <div className="flex items-center gap-2 bg-surface-raised border border-border rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const t = tagInput.trim().replace(/,/g, "");
                        if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
                        setTagInput("");
                      }
                    }}
                    placeholder="Nhập tag rồi nhấn Enter..."
                    className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                  />
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-subtle text-accent-text">
                        #{tag}
                        <button type="button" onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Image URLs */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-text-muted">Ảnh thumbnail (URL)</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-surface-raised border border-border rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-accent">
                    <LinkIcon size={14} className="text-text-muted flex-shrink-0" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    disabled={!urlInput.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm rounded-xl transition-colors"
                  >
                    <Plus size={15} /> Thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickerTarget("thumbnail")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-surface hover:bg-surface-raised border border-border text-text-secondary text-sm rounded-xl transition-colors"
                  >
                    <FolderOpen size={15} /> Thư viện
                  </button>
                </div>

                {imageUrls.length > 0 && (
                  <div className={`grid gap-2 ${imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                    {imageUrls.map((url, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-36 object-cover" />
                        <button
                          onClick={() => handleRemoveUrl(url)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={13} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-text-muted">Nội dung (Markdown)</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPickerTarget("content")}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-surface hover:bg-surface-raised border border-border text-text-muted hover:text-text-secondary transition-colors"
                    >
                      <FolderOpen size={12} /> Chèn ảnh
                    </button>
                    <div className="flex bg-surface-raised border border-border p-0.5 rounded-lg text-xs">
                      <button
                        onClick={() => setEditorTab("rich")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${editorTab === "rich" ? "bg-surface text-text-primary" : "text-text-muted hover:text-text-secondary"}`}
                      >
                        <Edit3 size={12} /> Editor
                      </button>
                      <button
                        onClick={() => setEditorTab("raw")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${editorTab === "raw" ? "bg-surface text-text-primary" : "text-text-muted hover:text-text-secondary"}`}
                      >
                        <ClipboardPaste size={12} /> Dán MD
                      </button>
                    </div>
                  </div>
                </div>

                {editorTab === "rich" ? (
                  <div className="themed-editor">
                    <SimpleMDE value={content} onChange={setContent} options={editorOptions} />
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Dán nội dung Markdown vào đây..."
                    className="w-full min-h-[300px] bg-surface-raised border border-border rounded-xl px-4 py-3 text-sm text-text-primary font-mono placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent resize-y"
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-8 min-h-[600px] shadow-2xl">
              {title.trim() && (
                <h1 className="text-2xl font-bold text-text-primary mb-4">{title}</h1>
              )}
              {imageUrls.length > 0 && (
                <div className={`grid gap-1 mb-6 rounded-xl overflow-hidden ${imageUrls.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
                  {imageUrls.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt="" className="w-full h-52 object-cover" />
                  ))}
                </div>
              )}
              <article className={"prose prose-sm max-w-none [&_p]:text-text-secondary [&_p]:leading-relaxed [&_p]:my-1.5 [&_h1]:text-text-primary [&_h2]:text-text-primary [&_h3]:text-text-primary [&_h1]:font-bold [&_h2]:font-semibold [&_h3]:font-semibold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:mt-2 [&_h3]:mb-1 [&_strong]:text-text-primary [&_em]:text-text-secondary [&_em]:italic [&_a]:text-accent-text [&_a]:no-underline hover:[&_a]:underline [&_code]:text-accent-text [&_code]:bg-surface-raised [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-surface-raised [&_pre]:border [&_pre]:border-border [&_pre]:rounded-xl [&_pre]:p-4 [&_blockquote]:border-l-2 [&_blockquote]:border-accent/40 [&_blockquote]:pl-4 [&_blockquote]:text-text-muted [&_blockquote]:italic [&_ul]:text-text-secondary [&_ol]:text-text-secondary [&_li]:marker:text-text-muted [&_hr]:border-border"}>
                <ReactMarkdown>{content || "*Chưa có nội dung...*"}</ReactMarkdown>
              </article>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-border hover:border-border-muted text-text-muted hover:text-text-primary text-sm font-medium transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isPending || !content.trim()}
              className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-lg transition-all active:scale-95"
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
        .themed-editor .editor-toolbar {
          background: var(--color-surface);
          border-color: var(--color-border);
          border-radius: 8px 8px 0 0;
        }
        .themed-editor .editor-toolbar button { color: var(--color-text-muted) !important; }
        .themed-editor .editor-toolbar button.active,
        .themed-editor .editor-toolbar button:hover {
          background: var(--color-surface-raised) !important;
          color: var(--color-text-primary) !important;
        }
        .themed-editor .CodeMirror {
          background: var(--color-page) !important;
          color: var(--color-text-secondary) !important;
          border-color: var(--color-border);
          border-radius: 0 0 8px 8px;
        }
        .themed-editor .CodeMirror-cursor { border-left-color: var(--color-text-primary); }
        .themed-editor .editor-preview { background: var(--color-card); color: var(--color-text-secondary); }
      `}</style>
    </div>
  );
}
