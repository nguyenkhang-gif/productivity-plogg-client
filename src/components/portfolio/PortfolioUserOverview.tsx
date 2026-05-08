import { MapPin, Mail, Phone, Linkedin, Github } from "lucide-react";
import React from "react";

type UserHeader = {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  avatar: string;
};

type PortfolioUserOverviewProps = {
  user: UserHeader;
};

const PortfolioUserOverview = ({ user }: PortfolioUserOverviewProps) => {
  return (
    <section className="fade-in w-full p-8 flex flex-col-reverse md:flex-row items-center md:items-start relative rounded-3xl md:bg-slate-50 dark:md:bg-slate-800 text-default mb-10 border border-slate-200 dark:border-slate-700">
      {/* title and user info */}
      <div className="w-full mt-10 md:text-left md:mt-2 flex-1">
        <div>
          <h1 className="text-4xl text-black dark:text-white my-3">
            Hi, I&apos;m <span className="font-bold text-primary">{user.name}</span>
          </h1>
          <h2 className="text-2xl text-slate-600 dark:text-slate-400 font-medium mb-4">{user.role}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <p className="flex items-center">
            <MapPin className="mr-3 text-primary" size={20} />
            <span>{user.location}</span>
          </p>
          <p className="flex items-center">
            <Mail className="mr-3 text-primary" size={20} />
            <a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a>
          </p>
          <p className="flex items-center">
            <Phone className="mr-3 text-primary" size={20} />
            <a href={`tel:${user.phone}`} className="hover:underline">{user.phone}</a>
          </p>
          <div className="flex gap-4">
             <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Linkedin size={24} />
             </a>
             <a href={user.github} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                <Github size={24} />
             </a>
          </div>
        </div>
      </div>

      {/* avatar + background circle */}
      <div className="flex items-center justify-center relative md:ml-10">
        {/* gray circle behind */}
        <div className="absolute w-48 h-48 bg-primary/10 rounded-full -z-10 animate-pulse" />

        {/* avatar */}
        <div className="rounded-full overflow-hidden flex items-center justify-center w-40 h-40 md:w-64 md:h-64 border-4 border-white dark:border-slate-700 shadow-xl">
          <img
            src={user.avatar}
            alt={user.name}
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </section>
  );
};

export default React.memo(PortfolioUserOverview);
