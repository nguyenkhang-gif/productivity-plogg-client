import React from "react";
import { UserCircle } from "lucide-react";

const AboutMeSection = ({
  descriptions,
}: {
  descriptions: string;
}) => {
  return (
    <section className="fade-in w-full px-5 py-6 md:p-8 flex flex-col items-center relative rounded-3xl md:bg-white dark:md:bg-slate-900 text-default mb-10 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-8 self-start">
        <UserCircle className="text-primary" />
        <h2 className="text-2xl font-bold">About Me</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-start w-full">
        <div className="w-full md:w-1/3 shrink-0">
          <div className="rounded-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300 bg-slate-50 dark:bg-slate-800 flex items-center justify-center aspect-square">
            <UserCircle className="w-16 h-16 text-slate-300 dark:text-slate-600" strokeWidth={1} />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed first-letter:text-4xl first-letter:font-bold first-letter:mr-1">
            {descriptions}
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutMeSection;
