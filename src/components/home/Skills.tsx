// components/Skills.tsx
"use client";

import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function Skills() {
  const skills = [
    { name: "Web Development", percentage: 95 },
    { name: "Brand Identity", percentage: 80 },
    { name: "Logo Design", percentage: 90 },
  ];

  return (
    <section className="bg-gradient-to-b from-black via-gray-900 to-black text-white py-16 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">Skills</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text.
        </p>
        <div className="flex justify-center gap-8 flex-wrap">
          {skills.map((skill, index) => (
            <div key={index} className="text-center">
              <div className="w-32 h-32">
                <CircularProgressbar
                  value={skill.percentage}
                  text={`${skill.percentage}%`}
                  styles={{
                    root: {},
                    path: {
                      stroke: "#A100F2",
                      strokeWidth: "10",
                      strokeLinecap: "round",
                    },
                    trail: {
                      stroke: "#333",
                      strokeWidth: "10",
                    },
                    text: {
                      fill: "#FFF",
                      fontSize: "16px",
                    },
                  }}
                />
              </div>
              <p className="mt-4 text-gray-400">{skill.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}