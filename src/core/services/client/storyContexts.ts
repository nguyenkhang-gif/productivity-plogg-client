"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@/core/plugins/reactQuery";
import {
  storyContextsApi,
  CreateStoryContextDto,
  UpdateStoryContextDto,
} from "@/core/services/api/storyContexts";
import { FetchQueryKeys } from "@/core/services/endpoints";

export function useGetStoryContexts(page = 1, limit = 20) {
  return useQuery({
    queryKey: [FetchQueryKeys.STORY_CONTEXT_LIST, page, limit],
    queryFn: () => storyContextsApi.list(page, limit),
  });
}

export function useCreateStoryContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateStoryContextDto) => storyContextsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FetchQueryKeys.STORY_CONTEXT_LIST],
      });
    },
  });
}

export function useUpdateStoryContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStoryContextDto }) =>
      storyContextsApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FetchQueryKeys.STORY_CONTEXT_LIST],
      });
    },
  });
}

export function useDeleteStoryContext() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => storyContextsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [FetchQueryKeys.STORY_CONTEXT_LIST],
      });
    },
  });
}
