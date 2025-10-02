"use client";

import React, { useState } from "react";

const Skills = () => {
  const skills = [
    { name: "Web Development", percentage: 95 },
    { name: "Brand Identity", percentage: 80 },
    { name: "Logo Design", percentage: 90 },
    { name: "UI/UX Design", percentage: 85 },
    { name: "Graphic Design", percentage: 88 },
    { name: "Brand Identity", percentage: 80 },
    { name: "Logo Design", percentage: 90 },
    { name: "UI/UX Design", percentage: 85 },
    { name: "Graphic Design", percentage: 88 },
    { name: "Brand Identity", percentage: 80 },
    { name: "Logo Design", percentage: 90 },
    { name: "UI/UX Design", percentage: 85 },
    { name: "Graphic Design", percentage: 88 },
  ];

  const [currentIndex, ] = useState(0);

  const getCircleDasharray = (percentage: number) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - (percentage / 100) * circumference;
    return { circumference, dashoffset };
  };

  // const nextSlide = () => {
  //   setCurrentIndex((prev) => (prev + 3 >= skills.length ? 0 : prev + 3));
  // };

  // const prevSlide = () => {
  //   setCurrentIndex((prev) =>
  //     prev - 3 < 0 ? Math.max(0, skills.length - 3) : prev - 3
  //   );
  // };

  const visibleSkills = skills.slice(currentIndex, currentIndex + 3);

  return (
    <section className="bg-gray-900   text-white py-16 px-4 my-3 rounded-3xl w-full">
      <div className="container mx-auto text-center ">
        <h2 className="text-4xl font-bold mb-4">Skills</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          been the industry`s standard dummy text.
        </p>
        <div className="relative">
          <div className="flex justify-center gap-12 flex-wrap transition-all duration-500 ease-in-out">
            {visibleSkills.map((skill, index) => {
              const { circumference, dashoffset } = getCircleDasharray(
                skill.percentage
              );
              return (
                <div key={index} className="text-center animate-slide-in">
                  <svg width="120" height="120" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#333"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#A100F2"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashoffset}
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dy="0.3em"
                      fontSize="16"
                      fill="#FFF"
                    >
                      {skill.percentage}%
                    </text>
                  </svg>
                  <p className="mt-4 text-gray-400">{skill.name}</p>
                </div>
              );
            })}
          </div>
          {/* {skills.length > 3 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={prevSlide}
                className="bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700 transition-colors"
                disabled={currentIndex === 0}
              >
                ←
              </button>
              <button
                onClick={nextSlide}
                className="bg-gray-800 p-2 rounded-full text-white hover:bg-gray-700 transition-colors"
                disabled={currentIndex + 3 >= skills.length}
              >
                →
              </button>
            </div>
          )} */}
        </div>
      </div>
      {/* <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slideIn 0.5s ease-in-out;
        }
      `}</style> */}
    </section>
  );
};

export default Skills;
