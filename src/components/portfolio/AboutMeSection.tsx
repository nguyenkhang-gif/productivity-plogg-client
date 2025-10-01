import React from "react";

const AboutMeSection = ({
  desciptions,
  imgUrl,
}: {
  descriptions: string;
  imgUrl: string;
}) => {
  console.log(desciptions);

  return (
    <section className="fade-in w-auto p-8 flex flex-col items-center relative rounded-3xl md:bg-gray-50 dark:md:bg-slate-800 md:mx-10 text-default mb-20 md:mb-2">
      <div className="">
        <span className="bg-[#E5E7EB] rounded-lg px-5 py-1">About me</span>
      </div>
      <div className="w-full">
        <div className="w-full">
          <img src={imgUrl} alt="" />
        </div>
        <div className="w-full"></div>
      </div>
    </section>
  );
};

export default AboutMeSection;
