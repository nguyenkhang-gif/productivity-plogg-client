"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TIPS = [
  "Use `const` by default. Reach for `let` only when you need to reassign.",
  "`git stash` saves uncommitted changes so you can switch branches cleanly.",
  "Keyboard shortcut: `Cmd+Shift+P` opens the command palette in VS Code.",
  "Prefer composition over inheritance — small, focused components scale better.",
  "`console.table()` prints arrays of objects in a readable grid format.",
  "HTTP 304 means 'Not Modified' — the browser serves the cached version.",
  "A pure function always returns the same output for the same input.",
  "Debounce expensive operations like search inputs to reduce unnecessary calls.",
  "`Promise.all()` runs async tasks in parallel — much faster than awaiting in sequence.",
  "CSS `gap` works in both flexbox and grid — no more margin hacks.",
  "Use `structuredClone()` for deep-copying objects without a library.",
  "TypeScript's `satisfies` operator validates a type without widening it.",
];

export default function LoadingScreen() {
  const [tip, setTip] = useState("");

  useEffect(() => {
    setTip(TIPS[Math.floor(Math.random() * TIPS.length)]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background gap-8">
      {/* Logo / app name */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-2xl font-bold tracking-tight text-foreground"
      >
        KPro
      </motion.div>

      {/* Animated dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#0E78F9]"
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Tech tip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        className="max-w-sm px-6 text-center"
      >
        <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
          <span className="text-[#0E78F9] mr-1.5">tip:</span>
          {tip}
        </p>
      </motion.div>
    </div>
  );
}
