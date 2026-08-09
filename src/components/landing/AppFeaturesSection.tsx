"use client";

import { motion } from "framer-motion";

import { LANDING_THEME } from "./landingTheme";
import { fadeInUp, staggerContainerSlow, viewportOnce } from "@/core/lib/animations";

interface Feature {
  symbol: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    symbol: "//",
    title: "Blog & Posts",
    description: "Write, share, and explore markdown-formatted posts.",
  },
  {
    symbol: "[]",
    title: "EPUB Generator",
    description: "AI-powered novel and manga reader with chapter extraction.",
  },
  {
    symbol: "↑",
    title: "File Upload",
    description: "Cloudinary and backend dual-provider file management.",
  },
  {
    symbol: "▣",
    title: "CBZ Reader",
    description: "In-browser manga reader with swipe, keyboard, and webtoon modes.",
  },
];

export default function AppFeaturesSection() {
  return (
    <section className="py-20 px-6 border-t border-border-muted">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="mb-12 text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <p className="font-mono text-xs mb-3" style={{ color: LANDING_THEME.terminal }}>
            <span style={{ opacity: 0.5 }}>&gt;</span> ls ./features
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">
            What&apos;s inside KPro
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            A productivity platform built feature by feature.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
          variants={staggerContainerSlow}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ y: -4, borderColor: LANDING_THEME.accentBorder }}
              className="p-4 rounded-lg border border-border bg-card transition-colors group cursor-default"
            >
              <p className="font-mono text-xl font-bold mb-3 text-accent">
                {feature.symbol}
              </p>
              <p className="text-sm font-semibold mb-1 text-text-primary">
                {feature.title}
              </p>
              <p className="text-xs leading-relaxed text-text-muted">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
