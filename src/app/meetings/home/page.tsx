import React from "react";

const Page = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <div className="h-[300px] bg-slate-500  w-full rounded-lg">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="glasseffect max-w-[270px] rounded py-2 text-center text-base font-normal">
            Meeting at time time time
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">11:30 AM</h1>
            <p>Day/moth/year</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page;
