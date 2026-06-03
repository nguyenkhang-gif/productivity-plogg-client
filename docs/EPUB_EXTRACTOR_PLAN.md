# EPUB Text Extractor — Implementation Plan

**Status:** Planning  
**Date:** 2026-06-03  
**Scope:** Client-side only (no server), pure browser EPUB → text extraction

---

## 1. Overview

Build a Next.js page at `/epub-extract` that allows users to:
1. Upload one or more `.epub` files via drag-and-drop or file picker
2. Extract plain text from each chapter (client-side, no upload to server)
3. View/browse extracted chapters in-page
4. Export as individual `.txt` files or a single merged file

**Core constraint:** Everything runs in the browser. No API route, no server processing.

---

## 2. Technical Stack

| Layer | Choice | Reason |
|---|---|---|
| ZIP parsing | `jszip` | Lightweight, well-maintained, browser-native |
| XML parsing | Browser `DOMParser` | Built-in, no extra dep, handles XHTML well |
| HTML stripping | Custom regex (reuse from script) | Already proven, no extra dep |
| State | `useState` / `useReducer` | Local state only, no Redux needed |
| UI | shadcn/ui + Tailwind | Consistent with existing codebase |

**Install required:**
```bash
npm install jszip
npm install --save-dev @types/jszip  # if needed
```

---

## 3. EPUB Parsing Flow

```
User selects .epub file
        │
        ▼
FileReader.readAsArrayBuffer(file)
        │
        ▼
JSZip.loadAsync(buffer)
        │
        ▼
Read META-INF/container.xml
  └─ Extract rootfile/@full-path  →  path to .opf file
        │
        ▼
Read {opf-path} (e.g. OEBPS/content.opf)
  ├─ Parse <manifest>: id → href map
  └─ Parse <spine>: ordered list of idref
        │
        ▼
For each spine item (in order):
  ├─ Resolve href relative to OPF directory
  ├─ zip.file(resolvedPath).async("string")
  ├─ stripHtml(html)
  └─ if text.length > 100 → push to chapters[]
        │
        ▼
chapters: Array<{ index, title, text, wordCount }>
```

---

## 4. Module Breakdown

### 4.1 Parser utilities — `src/core/lib/epub/`

```
src/core/lib/epub/
├── parseContainer.ts     # META-INF/container.xml → OPF path
├── parseOpf.ts           # OPF manifest + spine → ordered href[]
├── extractChapters.ts    # Main orchestrator: JSZip → chapters[]
└── textUtils.ts          # decodeEntities(), stripHtml() — ported from script
```

**Why separate from components:** Testable in isolation, reusable if epub feature expands (e.g. feed to AI translation pipeline).

### 4.2 Custom hook — `src/core/hooks/epub/useEpubExtractor.ts`

```ts
interface Chapter {
  index: number;
  title: string;       // spine item label or "Chapter N" fallback
  text: string;
  wordCount: number;
}

interface ExtractorState {
  chapters: Chapter[];
  status: 'idle' | 'processing' | 'done' | 'error';
  error: string | null;
  fileName: string | null;
  progress: { current: number; total: number };
}

// Exposed API
const {
  state,
  processFile,   // (file: File) => Promise<void>
  reset,
  exportChapter, // (index: number) => void — triggers download
  exportAll,     // () => void — merged txt download
} = useEpubExtractor();
```

### 4.3 Page — `src/app/epub-extract/page.tsx`

Orchestrates UI only. No parsing logic here.

### 4.4 Components — `src/components/epub-extract/`

```
EpubDropzone.tsx        # File input + drag-and-drop zone
EpubProgressBar.tsx     # Processing progress (current/total chapters)
ChapterList.tsx          # Scrollable list of extracted chapters
ChapterPreview.tsx       # Selected chapter text viewer
ExportControls.tsx       # Export single / export all buttons
```

---

## 5. Key Implementation Details

### 5.1 Relative path resolution in OPF

OPF file can be at any path (e.g. `OEBPS/content.opf`). Chapter hrefs in `<manifest>` are relative to the OPF directory.

```ts
const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/'));
const resolvedHref = opfDir ? `${opfDir}/${href}` : href;
```

### 5.2 Chapter title extraction

Priority order:
1. `<title>` tag inside the chapter HTML
2. `<nav epub:type="toc">` entry matching the item (EPUB3)
3. `ncx` `navPoint` label (EPUB2)
4. Fallback: `"Chapter {N}"`

For Phase 1, just use fallback to keep scope small.

### 5.3 Large file handling

- Files > 50MB → show warning toast, still allow processing
- Processing is async per-chapter → progress bar reflects real state
- No worker thread needed for typical novel-sized EPUBs (<10MB)

### 5.4 Export

```ts
function downloadTxt(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
```

Export all: join chapters with `\n\n--- Chapter N ---\n\n` separator.

---

## 6. Implementation Phases

### Phase 1 — Core extraction (MVP)
- [ ] Install `jszip`
- [ ] `textUtils.ts` — port `decodeEntities`, `stripHtml` from script
- [ ] `parseContainer.ts` — extract OPF path from `container.xml`
- [ ] `parseOpf.ts` — extract spine order + href map
- [ ] `extractChapters.ts` — main orchestrator
- [ ] `useEpubExtractor.ts` — hook wiring state + processing
- [ ] `/epub-extract` page with basic file input
- [ ] `ChapterList` + `ChapterPreview` components

### Phase 2 — UX polish
- [ ] `EpubDropzone` — drag-and-drop support
- [ ] `EpubProgressBar` — per-chapter progress
- [ ] `ExportControls` — single chapter + export all
- [ ] Error handling UI (DRM warning, parse failure)
- [ ] Word count per chapter display

### Phase 3 — Enhancements (optional, post-MVP)
- [ ] Multiple EPUB files queued (same `offset` logic as original script)
- [ ] Chapter title extraction from NCX/NAV
- [ ] Persist chapters to sessionStorage (survive page refresh)
- [ ] Feed extracted chapters to existing AI pipeline (Gemini)

---

## 7. Route Registration

Add to `src/core/config/routes.ts`:

```ts
"/epub-extract": "private"
```

---

## 8. Risks & Edge Cases

| Risk | Likelihood | Mitigation |
|---|---|---|
| DRM-encrypted EPUB (common with purchased ebooks) | High | Catch JSZip error, show clear message: "This file may be DRM-protected" |
| OPF at non-standard path | Low | Always read from `container.xml`, never guess |
| `../` relative paths in OPF manifest | Medium | Use `new URL(href, base)` for path resolution |
| EPUB with no `<spine>` (malformed) | Low | Fall back to all manifest items with `media-type="application/xhtml+xml"` |
| Browser memory on very large EPUBs | Low | Show warning at >50MB; process chapters sequentially not all at once |
| Chapter HTML with inline `<style>` dumped as text | Medium | Strip `<style>` and `<script>` tags before `stripHtml` |

---

## 9. Out of Scope (này không làm)

- Server-side processing / API route
- Saving to filesystem
- EPUB editing/writing
- Image extraction
- Full EPUB reader (rendering with styles)
- DRM bypass of any kind
