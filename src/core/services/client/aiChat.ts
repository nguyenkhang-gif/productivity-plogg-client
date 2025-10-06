import { useMutation } from "@tanstack/react-query";
import {
  clearContext,
  sentPrompts,
  sentPromptsWithActions,
} from "../api/aiChat";

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

export const useAskGeminiWithAction = () => {
  return useMutation({
    mutationFn: (prompt: string) => sentPromptsWithActions(prompt),
    onSuccess: async (data) => {
      return data;
    },
    onError: (error) => {
      console.log(error, "error");
    },
  });
};

export const useClearContext = () => {
  return useMutation({
    mutationFn: (data: string) => {
      console.log(data);
      return clearContext();
    },
    onSuccess: async (data) => {
      return data;
    },
    onError: (error) => {
      console.log(error, "error");
    },
  });
};
