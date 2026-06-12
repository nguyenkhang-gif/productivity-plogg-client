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
    <section className="fade-in w-full px-5 py-6 md:p-8 flex flex-col-reverse md:flex-row items-center md:items-start relative rounded-3xl md:bg-surface text-text-primary mb-10 border border-border">
      {/* title and user info */}
      <div className="w-full mt-5 md:mt-2 flex-1 text-center md:text-left">
        <div>
          <h1 className="text-2xl md:text-4xl text-text-primary my-2 md:my-3">
            Hi, I&apos;m <span className="font-bold text-accent-text">{user.name}</span>
          </h1>
          <h2 className="text-lg md:text-2xl text-text-secondary font-medium mb-3 md:mb-4">{user.role}</h2>
        </div>

        <div className="flex flex-col items-center md:items-start md:grid md:grid-cols-2 gap-3 mt-4 md:mt-6">
          <p className="flex items-center">
            <MapPin className="mr-2 text-accent-text shrink-0" size={18} />
            <span className="text-sm md:text-base">{user.location}</span>
          </p>
          <p className="flex items-center">
            <Mail className="mr-2 text-accent-text shrink-0" size={18} />
            <a href={`mailto:${user.email}`} className="hover:underline text-sm md:text-base truncate">{user.email}</a>
          </p>
          <p className="flex items-center">
            <Phone className="mr-2 text-accent-text shrink-0" size={18} />
            <a href={`tel:${user.phone}`} className="hover:underline text-sm md:text-base">{user.phone}</a>
          </p>
          <div className="flex gap-4">
             <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-text transition-colors">
                <Linkedin size={22} />
             </a>
             <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-text transition-colors">
                <Github size={22} />
             </a>
          </div>
        </div>
      </div>

      {/* avatar */}
      <div className="flex items-center justify-center relative md:ml-10">
        <div className="absolute w-40 h-40 md:w-56 md:h-56 bg-accent/10 rounded-full -z-10 animate-pulse" />
        <div className="rounded-full overflow-hidden w-32 h-32 md:w-56 md:h-56 border-4 border-border shadow-xl">
          <img src={user.avatar} alt={user.name} className="object-cover w-full h-full" />
        </div>
      </div>
    </section>
  );
};

export default React.memo(PortfolioUserOverview);
