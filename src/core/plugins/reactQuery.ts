"use client";
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useIsFetching,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: 3000,
      staleTime: 60 * 1000, // 1 minutes in miliseconds
      refetchOnWindowFocus: false,
    },
  },
});

export {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueries,
  useMutation,
  useInfiniteQuery,
  useIsFetching,
  useQueryClient,
};
