import React from "react";
import { FolderCode, Users, ExternalLink, Code2 } from "lucide-react";

type ProjectLink = {
  label: string;
  url: string;
};

type Project = {
  name: string;
  status: string;
  description: string;
  teamSize: number;
  role: string;
  techStack: string;
  links: ProjectLink[];
  highlights: string[];
};

type ProjectsSectionProps = {
  projects: Project[];
};

const ProjectsSection = ({ projects }: ProjectsSectionProps) => {
  return (
    <section className="fade-in w-full p-8 flex flex-col items-center relative rounded-3xl md:bg-white dark:md:bg-slate-900 text-default mb-10 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-8 self-start">
        <FolderCode className="text-primary" />
        <h2 className="text-2xl font-bold">Projects</h2>
      </div>

      <div className="w-full grid grid-cols-1 gap-8">
        {projects.map((proj, index) => (
          <div key={index} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{proj.name}</h3>
                  <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                    {proj.status}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg">{proj.description}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {proj.links.map((link, lIndex) => (
                  <a
                    key={lIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-primary transition-colors text-sm font-medium"
                  >
                    <ExternalLink size={14} />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Users size={18} className="text-primary" />
                <span>Team size: {proj.teamSize}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Briefcase size={18} className="text-primary" />
                <span>Role: {proj.role}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Code2 size={18} className="text-primary" />
                <span>Tech: {proj.techStack}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider">Highlights</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                {proj.highlights.map((highlight, hIndex) => (
                  <li key={hIndex}>{highlight}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

import { Briefcase } from "lucide-react";

export default ProjectsSection;
