"use client";

import React from "react";
import { ArrowLeft, Github, Terminal, BookOpen, Wifi, Code2, Bot, FileCode, ImageIcon, Server, Package, Monitor, Cloud } from "lucide-react";
import Link from "next/link";

const demoImages: string[] = [
  "https://res.cloudinary.com/dsr4rajwm/image/upload/v1779000053/a6b87ddd-a565-423a-a887-6b7515d0b88f.png",
  // thêm ảnh demo ở đây
];

const techStack = [
  { layer: "Scraping", lib: "Puppeteer", role: "Headless Chrome — page navigation, lazy-load scroll, image download", icon: <Bot size={16} className="text-orange-400" /> },
  { layer: "HTML parsing", lib: "Cheerio", role: "Parse static HTML → extract chapter URLs", icon: <FileCode size={16} className="text-yellow-400" /> },
  { layer: "Image processing", lib: "Sharp", role: "Re-encode JPEG/PNG, optional resize, file size reduction", icon: <ImageIcon size={16} className="text-green-400" /> },
  { layer: "Web server", lib: "Express.js", role: "REST API + Server-Sent Events for real-time log streaming", icon: <Server size={16} className="text-blue-400" /> },
  { layer: "File packaging", lib: "Node.js + zip", role: "Package images into EPUB 2.0 and CBZ archives", icon: <Package size={16} className="text-purple-400" /> },
  { layer: "Frontend", lib: "Vanilla JS / HTML / CSS", role: "No framework, no build step", icon: <Monitor size={16} className="text-cyan-400" /> },
  { layer: "Remote access", lib: "Cloudflare Tunnel", role: "Expose local server to the internet without port-forwarding", icon: <Cloud size={16} className="text-orange-300" /> },
];

const pipelineSteps = [
  { step: "Fetch", desc: "Puppeteer opens a headless browser, scrolls the chapter list page to trigger lazy-loaded content, and saves the full HTML locally." },
  { step: "Parse", desc: "Cheerio extracts individual chapter URLs from the saved HTML and writes them into config.json." },
  { step: "Scrape", desc: "Puppeteer downloads images across chapters in parallel (configurable concurrency), with automatic retry up to 3 times per chapter on failure." },
  { step: "Compress", desc: "Sharp re-encodes images at a configurable JPEG quality and optional max width, reducing file size by 40–60%." },
  { step: "Package", desc: "Builds EPUB 2.0 (with OPF/NCX/XHTML structure) or CBZ archives. Supports splitting output into multiple volumes via a sections config." },
];

const webUIFeatures = [
  "Run any pipeline step individually or chain them in sequence",
  "Real-time log streamed from the child process via Server-Sent Events — no polling",
  "Progress bar and tab title update live (⏳ 42% — Manga Converter)",
  "Browser notification when a job completes or errors",
  "Config editor — change all settings without touching config.json",
  "Chapter URL manager — view, edit, or paste bulk chapter URLs in the UI",
  "Output stats badge — shows chapter and image counts for each output folder",
  "One-click cleanup for intermediate output folders",
];

const keyPoints = [
  { title: "SSE with replay buffer", desc: "New clients connecting mid-job receive all previous log lines before switching to live stream, making browser refresh seamless." },
  { title: "Shared mutable state", desc: "server/lib/job.js exports a single state object; ES module identity ensures all route files mutate the same reference with no extra plumbing." },
  { title: "EPUB spec from scratch", desc: "OPF manifest, NCX table of contents, and XHTML page wrappers are generated without any EPUB library." },
  { title: "Concurrency + cleanup", desc: "Puppeteer runs N tabs in parallel; orphan Chrome processes are force-killed after each scrape run." },
  { title: "Zero build step", desc: "Entirely plain Node.js ESM. npm install && npm run ui is all that is needed to run the full stack." },
];

const accessMethods = [
  { method: "Local", how: "http://localhost:3001" },
  { method: "Phone / tablet", how: "Scan QR code printed on startup (same WiFi)" },
  { method: "Remote", how: "npm run tunnel — Cloudflare Tunnel generates a public HTTPS URL" },
];

const projectStructure = `server/
  index.js          Express app, QR code, server start
  lib/
    config.js       Shared config read/write
    job.js          Job state, SSE bus, child process runner
  routes/           REST API endpoints
  public/           Frontend (HTML/CSS/JS)
services/
  fetchHtml.js      Puppeteer: save chapter list page
  getChapters.js    Cheerio: parse chapters → config
  scrape.js         Puppeteer: download images
  compressImg.js    Sharp: compress images
  toEpub.js         Build EPUB 2.0
  toCbz.js          Build CBZ`;

export default function MangaDownloaderPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 space-y-10">

      {/* Back */}
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-blue-500 dark:text-blue-400 hover:underline">
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Manga Downloader & Reader</h1>
          <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
            In Process
          </span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-lg mb-4">
          A self-hosted manga downloader, converter, and browser-based reader built entirely on Node.js — no cloud, no database, no framework.
        </p>
        <a
          href="https://github.com/nguyenkhang-gif/wattpad-to-epub-converter"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          <Github size={14} /> GitHub
        </a>
      </div>

      {/* Demo Images */}
      {demoImages.filter(Boolean).length > 0 && (
        <div>
          <SectionTitle>Demo</SectionTitle>
          <div className="space-y-4 mt-3">
            {demoImages.filter(Boolean).map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Demo ${i + 1}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problem */}
      <Card>
        <SectionTitle icon={<Terminal size={16} />}>Problem</SectionTitle>
        <p className="text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          Online manga sites load images lazily, don&apos;t support offline reading, and provide no way to organize chapters into volumes.
          This project automates the full pipeline — from scraping raw images to packaging and reading them — entirely on a personal machine.
        </p>
      </Card>

      {/* Tech Stack */}
      <Card>
        <SectionTitle icon={<Code2 size={16} />}>Tech Stack</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 pr-4 text-slate-500 dark:text-slate-400 font-medium">Layer</th>
                <th className="text-left py-2 pr-4 text-slate-500 dark:text-slate-400 font-medium">Library</th>
                <th className="text-left py-2 text-slate-500 dark:text-slate-400 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {techStack.map((t, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.layer}</td>
                  <td className="py-2.5 pr-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {t.icon}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{t.lib}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">{t.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pipeline */}
      <Card>
        <SectionTitle>Pipeline</SectionTitle>
        <div className="mt-3 mb-5 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2.5 font-mono text-sm text-slate-600 dark:text-slate-300">
          URL → Fetch HTML → Parse Chapters → Scrape Images → Compress → EPUB / CBZ
        </div>
        <ol className="space-y-4">
          {pipelineSteps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{s.step} — </span>
                <span className="text-slate-600 dark:text-slate-300 text-sm">{s.desc}</span>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      {/* Web UI */}
      <Card>
        <SectionTitle icon={<Terminal size={16} />}>Web UI</SectionTitle>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Single-page control panel served at <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">http://localhost:3001</code>
        </p>
        <ul className="space-y-2">
          {webUIFeatures.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="text-blue-500 mt-1.5 shrink-0">▸</span>
              {f}
            </li>
          ))}
        </ul>
      </Card>

      {/* Readers */}
      <Card>
        <SectionTitle icon={<BookOpen size={16} />}>Readers</SectionTitle>
        <div className="mt-4 space-y-6">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Image Reader <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">/reader.html</code>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Reads both CBZ and EPUB (image-based) files directly in the browser.</p>
            <ul className="space-y-1.5">
              {[
                "Fit width / Fit height / Webtoon scroll modes",
                "Click left/right half of image to navigate; arrow keys; touch swipe on mobile",
                "Chapter sidebar with jump-to-page",
                "Reading history persisted server-side — survives browser refresh and tab close",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-blue-500 mt-1.5 shrink-0">▸</span>{f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Text EPUB Reader <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">/ebook-reader.html</code>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">For text-based EPUBs (light novels, etc.).</p>
            <ul className="space-y-1.5">
              {[
                "Table of contents navigation",
                "Adjustable font size; Dark / Sepia / Light themes",
                "Last-read position saved per file via localStorage",
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-blue-500 mt-1.5 shrink-0">▸</span>{f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Access */}
      <Card>
        <SectionTitle icon={<Wifi size={16} />}>Access</SectionTitle>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 pr-6 text-slate-500 dark:text-slate-400 font-medium">Method</th>
                <th className="text-left py-2 text-slate-500 dark:text-slate-400 font-medium">How</th>
              </tr>
            </thead>
            <tbody>
              {accessMethods.map((a, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="py-2.5 pr-6 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{a.method}</td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300 font-mono text-xs">{a.how}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Key Technical Points */}
      <Card>
        <SectionTitle>Key Technical Points</SectionTitle>
        <div className="mt-4 space-y-4">
          {keyPoints.map((k, i) => (
            <div key={i}>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{k.title} — </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{k.desc}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Project Structure */}
      <Card>
        <SectionTitle>Project Structure</SectionTitle>
        <pre className="mt-4 bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-300 overflow-x-auto leading-relaxed">
          {projectStructure}
        </pre>
      </Card>

    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      {children}
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-blue-500 dark:text-blue-400">{icon}</span>}
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{children}</h2>
    </div>
  );
}
