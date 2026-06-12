"use client";

import React from "react";
import { FolderCode, Users, Briefcase, Code2, ExternalLink, Github, ArrowRight } from "lucide-react";
import Link from "next/link";

type ProjectLink = {
  label: string;
  url: string;
  icon?: "external" | "github";
};

type Project = {
  name: string;
  status: "In Process" | "Completed";
  description: string;
  teamSize: number;
  role: string;
  techStack: string[];
  links: ProjectLink[];
  highlights: string[];
  detailPath: string;
};

const projects: Project[] = [
  {
    name: "Productivity Blog",
    detailPath: "/projects/productivity-blog",
    status: "In Process",
    description:
      "A full-stack productivity and social platform featuring real-time chat, post feeds, file uploads, EPUB generation, and AI integrations — built to showcase and iterate on new features.",
    teamSize: 1,
    role: "Full-Stack Developer",
    techStack: ["Next.js 15", "TypeScript", "Node.js", "Socket.IO", "MongoDB", "Redux Toolkit", "TanStack Query", "Cloudinary", "AWS EC2", "Clean Architecture", "CI/CD"],
    links: [
      { label: "Website", url: "http://knnpb.duckdns.org/posts", icon: "external" },
    ],
    highlights: [
      "Architected a full-stack app with Next.js App Router, React Query + Redux Toolkit for layered state management.",
      "Implemented real-time chat with Socket.IO — singleton connection with auto-reconnect up to 5 times.",
      "Built a dual-provider file upload system supporting both backend storage and Cloudinary CDN.",
      "Integrated Google Gemini AI and ElevenLabs TTS for AI-powered features via Next.js API routes.",
      "Deployed frontend on AWS EC2 with PM2, backend on Render — CI/CD via manual SCP deploy workflow.",
      "Implemented JWT-based auth with SSO-style ?jwt= param flow and route-level access control guard.",
    ],
  },
  {
    name: "Robot Fleet Dashboard",
    detailPath: "/projects/robot-fleet",
    status: "In Process",
    description:
      "Full-stack real-time robot telemetry dashboard with WebSocket streaming, MongoDB tiered storage, Redis pub/sub cluster fan-out, and a Next.js 15 Zustand-powered UI. Architecture audit score: FE 54/90 · BE 75/100.",
    teamSize: 1,
    role: "Full-Stack Developer",
    techStack: ["Next.js 15", "TypeScript", "Node.js", "uWebSockets.js", "MongoDB", "Redis", "Zustand", "Clean Architecture"],
    links: [],
    highlights: [
      "Implemented uWebSockets.js WebSocket server with BroadcastBuffer that coalesces telemetry and flushes every 5s.",
      "Designed a 4-tier MongoDB Time Series storage (Raw → Minutely → Hourly → Daily) with cron-based rollup jobs.",
      "Built Redis pub/sub cluster fan-out for multi-worker WebSocket broadcasting — IPC fallback when Redis is absent.",
      "Applied Clean Architecture (Domain → Application → Adapters → Infrastructure) with zero-dependency domain layer.",
      "Identified and documented 14 issues (4× P1 blockers, 7× P2, 3× P3) via full-stack architecture audit.",
    ],
  },
  {
    name: "Manga Downloader & EPUB/CBZ Converter",
    detailPath: "/projects/manga-downloader",
    status: "In Process",
    description:
      "Full-stack tool for downloading manga chapters and packaging them into EPUB or CBZ files, with a Web UI, real-time progress tracking, and an in-browser CBZ reader.",
    teamSize: 1,
    role: "Solo Developer",
    techStack: ["Node.js", "Puppeteer", "Express", "Sharp", "epub-gen"],
    links: [
      { label: "GitHub", url: "https://github.com/nguyenkhang-gif/wattpad-to-epub-converter", icon: "github" },
    ],
    highlights: [
      "Built a full pipeline — headless browser scraping with Puppeteer, image compression via Sharp, and packaging into both EPUB and CBZ formats.",
      "Developed an Express-based Web UI with real-time progress bars and color-coded live logs streamed from the running process.",
      "Automated scroll-based lazy-load handling and chapter URL parsing directly from the manga index page, enabling one-click full-series downloads.",
      "Implemented a browser-based CBZ reader with fit-width/fit-height/webtoon modes, keyboard and touch-swipe navigation, and mobile-friendly layout.",
      "Supported split-volume exports via a configurable sections array, allowing large series to be packaged into multiple named EPUB volumes.",
    ],
  },
];

const techColors: Record<string, string> = {
  "Next.js 15": "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
  "ReactJS": "bg-cyan-500 text-white",
  "TypeScript": "bg-blue-600 text-white",
  "Node.js": "bg-green-600 text-white",
  "Socket.IO": "bg-slate-600 text-white",
  "MongoDB": "bg-green-700 text-white",
  "Redux Toolkit": "bg-purple-600 text-white",
  "TanStack Query": "bg-red-500 text-white",
  "Cloudinary": "bg-blue-500 text-white",
  "AWS EC2": "bg-orange-500 text-white",
  "Clean Architecture": "bg-teal-600 text-white",
  "CI/CD": "bg-slate-500 text-white",
  "uWebSockets.js": "bg-violet-700 text-white",
  "Redis": "bg-red-600 text-white",
  "Zustand": "bg-teal-500 text-white",
  "Puppeteer": "bg-emerald-700 text-white",
  "Express": "bg-gray-600 text-white",
  "Sharp": "bg-indigo-500 text-white",
  "epub-gen": "bg-gray-500 text-white",
};

const statusColors: Record<Project["status"], string> = {
  "In Process": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export default function ProjectsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <FolderCode className="text-accent-text w-7 h-7" />
          <h1 className="text-3xl font-bold text-text-primary">Projects</h1>
        </div>
        <p className="text-text-secondary text-lg">
          Personal projects I&apos;ve built and maintained.
        </p>
        <div className="mt-4">
          <Link
            href="/portfolio"
            className="text-sm text-accent-text hover:underline"
          >
            ← Back to Portfolio
          </Link>
        </div>
      </div>

      {/* Projects list */}
      <div className="space-y-8">
        {projects.map((proj) => (
          <div
            key={proj.name}
            className="bg-card rounded-3xl p-8 border border-border shadow-sm"
          >
            {/* Title row */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-text-primary">{proj.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[proj.status]}`}>
                    {proj.status}
                  </span>
                </div>
                <p className="text-text-secondary">{proj.description}</p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {proj.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-surface px-3 py-1.5 rounded-lg border border-border hover:border-accent/50 transition-colors text-sm font-medium text-text-secondary"
                  >
                    {link.icon === "github" ? <Github size={14} /> : <ExternalLink size={14} />}
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-accent-text shrink-0" />
                <span>Team: {proj.teamSize === 1 ? "Solo" : `${proj.teamSize} members`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-accent-text shrink-0" />
                <span>{proj.role}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 mb-6">
              <Code2 size={16} className="text-accent-text shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {proj.techStack.map((tech) => (
                  <span
                    key={tech}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${techColors[tech] ?? "bg-surface-raised text-text-secondary"}`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
                Highlights
              </h3>
              <ul className="space-y-2">
                {proj.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-text-secondary text-sm">
                    <span className="text-accent-text mt-1.5 shrink-0">▸</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href={proj.detailPath}
              className="inline-flex items-center gap-1 text-sm text-accent-text hover:underline font-medium"
            >
              View details <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
