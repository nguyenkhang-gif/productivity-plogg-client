import { LANDING_THEME } from "../landingTheme";
import KProPlaceholder from "./KProPlaceholder";

export interface ProjectVisualProps {
  image: string | null;
  imageAlt: string;
}

export default function ProjectVisual({ image, imageAlt }: ProjectVisualProps) {
  if (!image) return <KProPlaceholder />;

  return (
    <div
      className="w-full overflow-hidden rounded-xl border"
      style={{
        borderColor: LANDING_THEME.cardBorder,
        boxShadow: `0 0 40px ${LANDING_THEME.accentGlow}`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={imageAlt}
        className="w-full h-full object-cover object-top"
        style={{ maxHeight: "380px" }}
      />
    </div>
  );
}
