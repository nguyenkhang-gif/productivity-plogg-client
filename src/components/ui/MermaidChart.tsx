"use client";

import { useEffect, useRef, useState } from "react";

const MERMAID_CONFIG = {
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#1e3a5f",
    primaryTextColor: "#e2e8f0",
    primaryBorderColor: "#334155",
    lineColor: "#64748b",
    secondaryColor: "#0f172a",
    tertiaryColor: "#1e293b",
    background: "#0f172a",
    mainBkg: "#1e293b",
    nodeBorder: "#334155",
    clusterBkg: "#1e293b",
    titleColor: "#94a3b8",
    edgeLabelBackground: "#1e293b",
    fontFamily: "ui-monospace, monospace",
  },
} as const;

let idCounter = 0;

export default function MermaidChart({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const id = useRef(`mermaid-${++idCounter}`);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize(MERMAID_CONFIG);
        const { svg: rendered } = await mermaid.render(id.current, chart.trim());
        if (!cancelled) setSvg(rendered);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }
    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="text-xs text-red-400 bg-red-950/30 rounded-lg p-3 font-mono whitespace-pre-wrap">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="w-full overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
