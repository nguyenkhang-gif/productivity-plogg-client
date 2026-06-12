import React from "react";
import { Wrench } from "lucide-react";

type Skills = {
  languages: string[];
  frontend: string[];
  backend: string[];
  database: string[];
  tools: string[];
};

type SkillsSectionProps = {
  skills: Skills;
};

const SkillsSection = ({ skills }: SkillsSectionProps) => {
  const categories = [
    { label: "Languages", items: skills.languages },
    { label: "Frontend", items: skills.frontend },
    { label: "Backend", items: skills.backend },
    { label: "Database", items: skills.database },
    { label: "Tools & Others", items: skills.tools },
  ];

  return (
    <section className="fade-in w-full px-5 py-6 md:p-8 flex flex-col items-center relative rounded-3xl md:bg-card text-text-primary mb-10 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-8 self-start">
        <Wrench className="text-accent-text" />
        <h2 className="text-2xl font-bold">Skills</h2>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, index) => (
          <div key={index} className="bg-surface p-6 rounded-2xl border border-border hover:shadow-md transition-shadow">
            <h3 className="font-bold text-text-primary mb-4 border-b border-border pb-2">
              {cat.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item, iIndex) => (
                <span
                  key={iIndex}
                  className="bg-surface-raised px-3 py-1 rounded-full text-sm border border-border font-medium text-text-secondary"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;
