import { Circle, MapPin } from "lucide-react";
import React from "react";

type User = {
  name: string;
  desciptions: string;
  location: string;
  positions: string;
  avatar: string;
};

type PortfolioUserOverviewProps = {
  user: User;
};

const PortfolioUserOverview = ({ user }: PortfolioUserOverviewProps) => {
  console.log("render PortfolioUserOverview");

  return (
    <section className="fade-in w-auto p-8 flex flex-col-reverse md:flex-row items-center md:items-start relative rounded-3xl md:bg-slate-50 dark:md:bg-slate-800 md:mx-10 text-default mb-20 md:mb-2">
      {/* title and user info */}
      <div className="w-full h-72 mt-10 md:text-left md:mt-2 ">
        <div>
          <h1 className="text-3xl text-black dark:text-white my-3">
            Hi, I'm <span className="font-bold">{user.name}</span>
          </h1>
          <p className=" ">{user.desciptions}</p>
        </div>

        <div className="gap-3 flex flex-col mt-10">
          <p className="flex ">
            <MapPin className="mr-2" />
            <span>{user.location}</span>
          </p>
          <p className="flex text-center items-center relative">
            <span className="w-5 h-5 bg-green-500 rounded-full mx-0.5 mr-3 text-center right-1"></span>
            <span>{user.positions}</span>
          </p>
        </div>
      </div>

      {/* avatar + background circle */}
      <div className=" flex items-center justify-center relative">
        {/* gray circle behind */}
        <div className="absolute w-48 h-48 bg-gray-300 dark:bg-gray-600 rounded-full -z-10" />

        {/* avatar */}
        <div className="rounded-full overflow-hidden flex items-center justify-center w-40 h-40 md:w-72 md:h-72">
          <img
            src={user.avatar}
            alt="user profile"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </section>
  );
};

export default React.memo(PortfolioUserOverview);
