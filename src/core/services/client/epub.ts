import { useQuery } from "@/core/plugins/reactQuery";
import { FetchQueryKeys } from "../endpoints";
import { getAllEpub } from "../api/epub";

export const useGetAllEpub = () => {
  return useQuery({
    queryKey: [FetchQueryKeys.EPUB_GET_USER_EPUB],
    queryFn: async () => {
      const response = await getAllEpub();
      return response;
    },
  });
};
