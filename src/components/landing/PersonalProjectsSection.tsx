"use client";

import { motion } from "framer-motion";

import { LANDING_THEME } from "./landingTheme";
import { fadeInUp, viewportOnce } from "@/core/lib/animations";
import ProjectRow from "./projects/ProjectRow";
import { PROJECTS } from "./projects/projectsData";

export default function PersonalProjectsSection() {
  return (
    <section id="projects" className="py-8 px-6 border-t border-border-muted">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="py-12 text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <p className="font-mono text-xs mb-3" style={{ color: LANDING_THEME.terminal }}>
            <span style={{ opacity: 0.5 }}>&gt;</span> cat ./projects.json
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            Personal Projects
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Things I&apos;ve built outside of work.
          </p>
        </motion.div>

        {PROJECTS.map((project, i) => (
          <ProjectRow key={project.number} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
