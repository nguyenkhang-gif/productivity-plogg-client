import { LANDING_THEME } from "../landingTheme";
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
    <div
      className="py-16 border-t"
      style={{ borderColor: LANDING_THEME.sectionDivider }}
    >
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
          isImageLeft ? "" : "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"
        }`}
      >
        <div>
          <ProjectText project={project} />
        </div>
        <div>
          <ProjectVisual image={project.image} imageAlt={project.imageAlt} />
        </div>
      </div>
    </div>
  );
}
