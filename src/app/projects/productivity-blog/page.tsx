"use client";

import React from "react";
import { ArrowLeft, ExternalLink, Code2, Users, Briefcase } from "lucide-react";
import Link from "next/link";

const project = {
  name: "Productivity Blog",
  status: "In Process",
  description:
    "A full-stack productivity and social platform featuring real-time chat, post feeds, file uploads, EPUB generation, and AI integrations — built to showcase and iterate on new features.",
  teamSize: 1,
  role: "Full-Stack Developer",
  techStack: ["Next.js 15", "TypeScript", "Node.js", "Socket.IO", "MongoDB", "Redux Toolkit", "TanStack Query", "Cloudinary", "AWS EC2"],
  links: [
    { label: "Website", url: "http://knnpb.duckdns.org/posts" },
  ],
  demoImages: [
    // Thêm URL ảnh demo vào đây
    "",
  ],
  highlights: [
    "Architected a full-stack app with Next.js App Router, React Query + Redux Toolkit for layered state management.",
    "Implemented real-time chat with Socket.IO — singleton connection with auto-reconnect up to 5 times.",
    "Built a dual-provider file upload system supporting both backend storage and Cloudinary CDN.",
    "Integrated Google Gemini AI and ElevenLabs TTS for AI-powered features via Next.js API routes.",
    "Deployed frontend on AWS EC2 with PM2, backend on Render — CI/CD via manual SCP deploy workflow.",
    "Implemented JWT-based auth with SSO-style ?jwt= param flow and route-level access control guard.",
  ],
};

export default function ProductivityBlogPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10">
      {/* Back */}
      <div className="mb-8">
        <Link href="/projects" className="flex items-center gap-1 text-sm text-blue-500 dark:text-blue-400 hover:underline">
          <ArrowLeft size={14} /> Back to Projects
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
            {project.status}
          </span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">{project.description}</p>

        {/* Links */}
        <div className="flex flex-wrap gap-2">
          {project.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors text-sm font-medium"
            >
              <ExternalLink size={14} />
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-primary" />
          <span>Team: Solo</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-primary" />
          <span>{project.role}</span>
        </div>
        <div className="flex items-start gap-2">
          <Code2 size={16} className="text-primary shrink-0 mt-0.5" />
          <span>{project.techStack.join(", ")}</span>
        </div>
      </div>

      {/* Demo Images */}
      {project.demoImages.filter(Boolean).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">Demo</h2>
          <div className="space-y-4">
            {project.demoImages.filter(Boolean).map((img, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`${project.name} demo ${i + 1}`} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Highlights */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Highlights</h2>
        <ul className="space-y-3">
          {project.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm">
              <span className="text-primary mt-1.5 shrink-0">▸</span>
              {h}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
