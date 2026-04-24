"use client";

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Send, X, Type, Eye, Edit3, Sparkles, Camera } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import "easymde/dist/easymde.min.css";

// Import Editor theo dạng Dynamic để chạy tốt trên Next.js Client Side
const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

export default function CreateBlogMarkdown() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Cấu hình cho Editor
  const editorOptions = useMemo(() => ({
    spellChecker: false,
    placeholder: "Bắt đầu viết nội dung bài viết bằng Markdown...",
    status: false,
    minHeight: "300px",
    autofocus: true,
  }), []);



  const handleSubmit = () => {
    // Xử lý logic lưu bài viết ở đây (gửi API, lưu vào DB, v.v.)
    console.log("Tiêu đề:", title);
    console.log("Nội dung Markdown:", content);
    console.log("Ảnh bìa:", previewImage);
  }

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-slate-200 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header điều hướng */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-blue-400" size={24} /> Viết Blog Markdown
            </h1>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setMode('edit')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${mode === 'edit' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
            >
              <Edit3 size={16} /> Soạn thảo
            </button>
            <button 
              onClick={() => setMode('preview')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all ${mode === 'preview' ? 'bg-blue-600 text-white' : 'hover:bg-slate-700'}`}
            >
              <Eye size={16} /> Xem trước
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {mode === 'edit' ? (
            <div className="bg-[#161b2b] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              {/* Ảnh bìa */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Ảnh bìa</label>
                {!previewImage ? (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                    <Camera className="text-slate-500 mb-2" />
                    <span className="text-sm text-slate-400">Tải ảnh lên bài viết</span>
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                ) : (
                  <div className="relative group">
                    <img src={previewImage} className="w-full h-48 object-cover rounded-xl border border-slate-700" alt="Preview" />
                    <button onClick={() => setPreviewImage(null)} className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full hover:scale-110 transition-transform shadow-lg">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Tiêu đề */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Tiêu đề</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tiêu đề bài viết..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-white font-bold text-lg"
                />
              </div>

              {/* Markdown Editor */}
              <div className="space-y-2 dark-editor">
                <label className="text-sm font-medium text-slate-400">Nội dung (Markdown)</label>
                <SimpleMDE 
                  value={content} 
                  onChange={(value) => setContent(value)} 
                  options={editorOptions}
                />
              </div>
            </div>
          ) : (
            /* Chế độ xem trước */
            <div className="bg-white text-slate-900 rounded-2xl p-8 min-h-[600px] shadow-2xl prose prose-slate max-w-none">
              {previewImage && <img src={previewImage} className="w-full h-64 object-cover rounded-xl mb-6" />}
              <h1 className="text-4xl font-extrabold mb-4">{title || "Tiêu đề chưa đặt"}</h1>
              <hr className="my-6" />
              <ReactMarkdown>
                {content || "*Chưa có nội dung để hiển thị...*"}
              </ReactMarkdown>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex justify-end gap-4 mt-4" onClick={handleSubmit}>
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95">
              <Send size={18} /> Xuất bản bài viết
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Tùy chỉnh CSS cho Editor khớp với Dark Mode */
        .dark-editor .editor-toolbar {
          background: #1e293b;
          border-color: #334155;
          border-radius: 8px 8px 0 0;
        }
        .dark-editor .editor-toolbar button { color: #94a3b8 !important; }
        .dark-editor .editor-toolbar button.active,
        .dark-editor .editor-toolbar button:hover { background: #334155 !important; }
        .dark-editor .CodeMirror {
          background: #0f172a !important;
          color: #e2e8f0 !important;
          border-color: #334155;
          border-radius: 0 0 8px 8px;
        }
      `}</style>
    </div>
  );
}