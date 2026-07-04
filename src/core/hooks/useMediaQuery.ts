"use client";

import { useEffect, useState } from "react";

/**
 * Reactive media query. SSR-safe: false on the server render, resolves after
 * mount and stays in sync with viewport/orientation changes.
 *
 *   const isMobileLandscape = useMediaQuery(MOBILE_LANDSCAPE);
 *   const isDesktop = useMediaQuery("(min-width: 1024px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Phone held sideways — landscape orientation with a short viewport.
 *  The height guard keeps desktop monitors (also landscape) from matching. */
export const MOBILE_LANDSCAPE = "(orientation: landscape) and (max-height: 500px)";
