import { useMutation } from "@tanstack/react-query";
import { sentPrompts } from "../api/aiChat";

export const useAskGemini = () => {
  return useMutation({
    mutationFn: (prompt: string) => sentPrompts(prompt),
    onSuccess: async (data) => {
      return data;
    },
    onError: (error) => {
      console.log(error, "error");
    },
  });
};
