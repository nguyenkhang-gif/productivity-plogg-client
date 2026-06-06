import Link from "next/link";

import { LANDING_THEME } from "../landingTheme";
import type { Project } from "./projectsData";

export interface ProjectTextProps {
  project: Project;
}

export default function ProjectText({ project }: ProjectTextProps) {
  return (
    <div className="flex flex-col justify-center">
      <div className="flex items-center gap-3 mb-4">
        <span
          className="font-mono text-4xl font-bold opacity-20 select-none"
          style={{ color: LANDING_THEME.accent }}
        >
          {project.number}
        </span>
        <span
          className="font-mono text-[10px] px-2 py-0.5 rounded border"
          style={{
            color: LANDING_THEME.terminal,
            borderColor: LANDING_THEME.terminalMuted,
            backgroundColor: LANDING_THEME.terminalMuted,
          }}
        >
          {project.tag}
        </span>
      </div>

      <h3
        className="text-2xl md:text-3xl font-bold mb-3 tracking-tight"
        style={{ color: LANDING_THEME.textPrimary }}
      >
        {project.name}
      </h3>

      <p
        className="text-sm leading-relaxed mb-5"
        style={{ color: LANDING_THEME.textSecondary }}
      >
        {project.description}
      </p>

      <ul className="space-y-2 mb-6">
        {project.highlights.map((highlight) => (
          <li
            key={highlight}
            className="flex items-start gap-2 text-xs"
            style={{ color: LANDING_THEME.textMuted }}
          >
            <span className="mt-0.5 shrink-0" style={{ color: LANDING_THEME.terminal }}>
              ▸
            </span>
            {highlight}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {project.techStack.map((tech) => (
          <span
            key={tech}
            className="font-mono text-[10px] px-2 py-0.5 rounded border"
            style={{ color: LANDING_THEME.textMuted, borderColor: LANDING_THEME.cardBorder }}
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex gap-4">
        {project.links.map((link) =>
          link.external ? (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm font-medium transition-colors"
              style={{ color: LANDING_THEME.accent }}
            >
              {link.label}
            </a>
          ) : (
            <Link
              key={link.label}
              href={link.url}
              className="font-mono text-sm font-medium transition-colors"
              style={{ color: LANDING_THEME.accent }}
            >
              {link.label}
            </Link>
          ),
        )}
      </div>
    </div>
  );
}
