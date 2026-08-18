import { useCallback, useRef } from "react";

interface Options {
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  threshold = 0,
  rootMargin = "0px",
}: Options) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  return useCallback(
    (node: HTMLDivElement | null) => {
      observerRef.current?.disconnect();
      if (!node) return;

      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold, rootMargin },
      );
      io.observe(node);
      observerRef.current = io;
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage, threshold, rootMargin],
  );
}
