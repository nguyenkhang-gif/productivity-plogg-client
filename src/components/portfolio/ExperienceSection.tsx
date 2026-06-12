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
    <section className="fade-in w-full px-5 py-6 md:p-8 flex flex-col items-center relative rounded-3xl md:bg-card text-text-primary mb-10 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-8 self-start">
        <Briefcase className="text-accent-text" />
        <h2 className="text-2xl font-bold">Experience</h2>
      </div>

      <div className="w-full space-y-10">
        {experiences.map((exp, index) => (
          <div key={index} className="relative pl-8 border-l-2 border-border">
            <div className="absolute w-4 h-4 bg-accent rounded-full -left-[9px] top-1" />

            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-1 md:gap-0">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-text-primary">{exp.role}</h3>
                <p className="text-base md:text-lg font-medium text-accent-text">{exp.company}</p>
              </div>
              <div className="md:text-right">
                <p className="text-text-muted font-medium text-sm md:text-base">{exp.period}</p>
                <p className="text-text-muted text-sm">{exp.location}</p>
              </div>
            </div>

            <div className="space-y-6">
              {exp.projects.map((proj, pIndex) => (
                <div key={pIndex} className="bg-surface p-4 rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-text-primary">Project: {proj.name}</span>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-accent-text hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink size={14} />
                        View Project
                      </a>
                    )}
                  </div>
                  <p className="text-text-secondary mb-3">{proj.description}</p>
                  <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm ml-2">
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
