import React from "react";
import { Briefcase, ExternalLink } from "lucide-react";

type Project = {
  name: string;
  link?: string;
  description: string;
  highlights: string[];
};

type Experience = {
  role: string;
  company: string;
  location: string;
  period: string;
  projects: Project[];
};

type ExperienceSectionProps = {
  experiences: Experience[];
};

const ExperienceSection = ({ experiences }: ExperienceSectionProps) => {
  return (
    <section className="fade-in w-full p-8 flex flex-col items-center relative rounded-3xl md:bg-white dark:md:bg-slate-900 text-default mb-10 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-8 self-start">
        <Briefcase className="text-primary" />
        <h2 className="text-2xl font-bold">Experience</h2>
      </div>

      <div className="w-full space-y-10">
        {experiences.map((exp, index) => (
          <div key={index} className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-700">
            <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1" />
            
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{exp.role}</h3>
                <p className="text-lg font-medium text-primary">{exp.company}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 dark:text-slate-400 font-medium">{exp.period}</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm">{exp.location}</p>
              </div>
            </div>

            <div className="space-y-6">
              {exp.projects.map((proj, pIndex) => (
                <div key={pIndex} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Project: {proj.name}</span>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink size={14} />
                        View Project
                      </a>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-3">{proj.description}</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-sm ml-2">
                    {proj.highlights.map((highlight, hIndex) => (
                      <li key={hIndex}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExperienceSection;
