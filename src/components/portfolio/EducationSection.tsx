import React from "react";
import { GraduationCap } from "lucide-react";

type Education = {
  school: string;
  major: string;
  period: string;
};

type EducationSectionProps = {
  education: Education[];
};

const EducationSection = ({ education }: EducationSectionProps) => {
  return (
    <section className="fade-in w-full p-8 flex flex-col items-center relative rounded-3xl md:bg-white dark:md:bg-slate-900 text-default mb-10 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-8 self-start">
        <GraduationCap className="text-primary" />
        <h2 className="text-2xl font-bold">Education</h2>
      </div>

      <div className="w-full space-y-6">
        {education.map((edu, index) => (
          <div key={index} className="flex flex-col md:flex-row md:justify-between md:items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{edu.school}</h3>
              <p className="text-lg text-primary font-medium">{edu.major}</p>
            </div>
            <div className="mt-2 md:mt-0 md:text-right">
              <p className="text-slate-500 dark:text-slate-400 font-semibold bg-slate-200 dark:bg-slate-700 px-4 py-1 rounded-full text-sm inline-block">
                {edu.period}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EducationSection;
