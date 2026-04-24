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
    <section className="fade-in w-full p-8 flex flex-col items-center relative rounded-3xl md:bg-white dark:md:bg-slate-900 text-default mb-10 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-8 self-start">
        <Wrench className="text-primary" />
        <h2 className="text-2xl font-bold">Skills</h2>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, index) => (
          <div key={index} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              {cat.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item, iIndex) => (
                <span
                  key={iIndex}
                  className="bg-white dark:bg-slate-700 px-3 py-1 rounded-full text-sm border border-slate-200 dark:border-slate-600 font-medium"
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
