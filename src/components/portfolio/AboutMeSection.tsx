import React from "react";
import { User } from "lucide-react";

const AboutMeSection = ({
  descriptions,
  imgUrl,
}: {
  descriptions: string;
  imgUrl: string;
}) => {
  return (
    <section className="fade-in w-full p-8 flex flex-col items-center relative rounded-3xl md:bg-white dark:md:bg-slate-900 text-default mb-10 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-8 self-start">
        <User className="text-primary" />
        <h2 className="text-2xl font-bold">About Me</h2>
      </div>
      
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-start w-full">
        {imgUrl && (
          <div className="w-full md:w-1/3 shrink-0">
            <div className="rounded-2xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
              <img src={imgUrl} alt="About me" className="w-full h-auto object-cover" />
            </div>
          </div>
        )}
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
