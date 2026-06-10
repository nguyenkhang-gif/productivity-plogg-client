"use client";

import { motion } from "framer-motion";

import { fadeInLeft, fadeInRight, viewportOnce } from "@/core/lib/animations";
import type { Project } from "./projectsData";
import ProjectText from "./ProjectText";
import ProjectVisual from "./ProjectVisual";

export interface ProjectRowProps {
  project: Project;
  index: number;
}

export default function ProjectRow({ project, index }: ProjectRowProps) {
  const isImageLeft = index % 2 === 0;

  return (
    <div className="py-16 border-t border-border-muted">
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
          isImageLeft ? "" : "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
        }`}
      >
        <motion.div
          variants={isImageLeft ? fadeInLeft : fadeInRight}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <ProjectText project={project} />
        </motion.div>
        <motion.div
          variants={isImageLeft ? fadeInRight : fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <ProjectVisual image={project.image} imageAlt={project.imageAlt} />
        </motion.div>
      </div>
    </div>
  );
}
