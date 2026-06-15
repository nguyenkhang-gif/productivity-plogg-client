"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { LANDING_THEME } from "./landingTheme";
import {
  fadeInUp,
  fadeInRight,
  scaleIn,
  staggerContainer,
  buttonHoverGlow,
  buttonTap,
  buttonHover,
  viewportOnce,
} from "@/core/lib/animations";

const AVATAR_URL =
  "https://lh3.googleusercontent.com/a/ACg8ocJdWiIXRbvDWMs5aTL4nBQ3iKHTD_cR5fQd4f3YGVb86MvjmzBP=s1000";

const TAGLINE = "I build tools that simplify life — for myself, and for anyone who needs them.";

const STATS: { value: string; label: string }[] = [
  { value: "2", label: "yrs experience" },
  { value: "4", label: "projects shipped" },
  { value: "6", label: "open source repos" },
  { value: "2", label: "companies" },
];

const TERMINAL_LINES: {
  prompt?: boolean;
  key?: string;
  value?: string;
  blank?: boolean;
  section?: string;
  cursor?: boolean;
}[] = [
  { prompt: true },
  { key: "role    ", value: "Full-Stack Developer" },
  { key: "exp     ", value: "2 years" },
  { key: "location", value: "Ho Chi Minh City, VN" },
  { key: "status  ", value: "open to work ✓" },
  { blank: true },
  { section: "stack:" },
  { value: "Next.js · React · Vue.js · Nuxt.js" },
  { value: "Node.js · NestJS · Express" },
  { value: "MongoDB · MySQL · Firebase" },
  { value: "AWS EC2 · Nginx · Socket.IO" },
  { blank: true },
  { section: "currently building:" },
  { value: "KPro — productivity platform" },
  { cursor: true },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ zIndex: -1 }}>
      {/* dot grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #0E78F9 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          opacity: 0.05,
        }}
      />
      {/* accent glow */}
      <div
        className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-accent"
        style={{ opacity: 0.04 }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-14 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

          {/* ── Left: intro ── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.p variants={fadeInUp} className="font-mono text-xs mb-7 tracking-widest">
              <span style={{ color: LANDING_THEME.terminal, opacity: 0.55 }}>~/portfolio</span>
              <span style={{ color: LANDING_THEME.terminal }} className="ml-2">$ whoami</span>
            </motion.p>

            <motion.div
              variants={scaleIn}
              className="mb-5 w-20 h-20 rounded-full overflow-hidden border-2 border-accent"
              style={{ boxShadow: `0 0 28px ${LANDING_THEME.accentGlow}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={AVATAR_URL} alt="Nguyen Nguyen Khang" className="object-cover w-full h-full" />
            </motion.div>

            <motion.p variants={fadeInUp} className="font-mono text-xs mb-1.5" style={{ color: LANDING_THEME.terminal }}>
              <span style={{ opacity: 0.45 }}>&gt;</span> hello, I&apos;m
            </motion.p>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-text-primary"
            >
              Nguyen Nguyen Khang
            </motion.h1>

            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded border mb-5"
              style={{
                borderColor: LANDING_THEME.accentBorder,
                backgroundColor: LANDING_THEME.accentMuted,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: LANDING_THEME.terminal }}
              />
              <span className="font-mono text-sm text-accent">
                Full-Stack Developer
              </span>
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="text-sm md:text-base leading-relaxed mb-7 max-w-md text-text-secondary"
            >
              {TAGLINE}
            </motion.p>

            {/* Stats row */}
            <motion.div variants={staggerContainer} className="grid grid-cols-4 gap-3 mb-8 max-w-sm">
              {STATS.map((stat) => (
                <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                  <p className="text-xl font-bold font-mono text-accent">
                    {stat.value}
                  </p>
                  <p className="text-[10px] leading-tight mt-0.5 text-text-muted">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={staggerContainer} className="flex items-center gap-3 flex-wrap">
              <motion.div variants={fadeInUp} whileHover={buttonHoverGlow(LANDING_THEME.accentGlow)} whileTap={buttonTap}>
                <Link
                  href="/posts"
                  className="px-6 py-2.5 font-medium rounded text-sm inline-block bg-accent text-text-primary"
                >
                  Enter App →
                </Link>
              </motion.div>
              <motion.a
                variants={fadeInUp}
                whileHover={buttonHover}
                whileTap={buttonTap}
                href="https://github.com/nguyenkhang-gif"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 font-mono text-sm rounded border border-border text-text-secondary inline-block"
              >
                GitHub ↗
              </motion.a>
              <motion.a
                variants={fadeInUp}
                whileHover={buttonHover}
                whileTap={buttonTap}
                href="#projects"
                className="px-6 py-2.5 font-mono text-sm rounded border border-border-muted text-text-muted inline-block"
              >
                Projects ↓
              </motion.a>
            </motion.div>
          </motion.div>

          {/* ── Right: terminal window ── */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="rounded-xl overflow-hidden border border-border hidden lg:block"
            style={{
              backgroundColor: LANDING_THEME.overlayBg,
              backdropFilter: "blur(10px)",
              boxShadow: `0 0 40px ${LANDING_THEME.accentGlow}`,
            }}
          >
            {/* title bar */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-surface-raised">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ff5f57" }} />
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#febc2e" }} />
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#28c840" }} />
              <span className="ml-3 font-mono text-xs text-text-muted">
                about.txt — bash
              </span>
            </div>

            {/* terminal body */}
            <div className="p-6 font-mono text-xs space-y-1.5">
              {TERMINAL_LINES.map((line, i) => {
                if (line.blank) return <div key={i} className="h-1" />;

                if (line.cursor) {
                  return (
                    <p key={i} className="pt-1 text-text-muted">
                      <span style={{ color: LANDING_THEME.terminal }}>❯</span>
                      <span
                        className="ml-2 inline-block w-2 h-3 align-middle animate-pulse"
                        style={{ backgroundColor: LANDING_THEME.terminal, opacity: 0.8 }}
                      />
                    </p>
                  );
                }

                if (line.prompt) {
                  return (
                    <p key={i} className="mb-1 text-text-muted">
                      <span style={{ color: LANDING_THEME.terminal }}>❯</span>
                      <span className="ml-2">cat about.txt</span>
                    </p>
                  );
                }

                if (line.section) {
                  return (
                    <p key={i} className="pt-1 text-text-muted">
                      {line.section}
                    </p>
                  );
                }

                if (line.key) {
                  return (
                    <p key={i}>
                      <span className="text-accent">{line.key}</span>
                      <span className="mx-2 text-text-muted">│</span>
                      <span className="text-text-secondary">{line.value}</span>
                    </p>
                  );
                }

                return (
                  <p key={i} className="pl-2 text-text-secondary">
                    <span style={{ color: LANDING_THEME.terminal, opacity: 0.5 }}>▸</span>
                    <span className="ml-2">{line.value}</span>
                  </p>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
