import { useQuery } from "@/core/plugins/reactQuery";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { FetchQueryKeys } from "../endpoints";
import { getAllEpub } from "../api/epub";

export const useGetAllEpub = () => {
  const token = useSelector((s: RootState) => s.user.token);

  return useQuery({
    queryKey: [FetchQueryKeys.EPUB_GET_USER_EPUB],
    queryFn: async () => {
      const response = await getAllEpub();
      return response;
    },
    enabled: !!token,
  });
};
