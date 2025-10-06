import axiosInstance from "@/core/lib/axiosInstance";

export const sentPrompts = async (prompt: string) => {
  try {
    const res = await axiosInstance.post("/gemini/prompt-with-personal", {
      prompt,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
export const sentPromptsWithActions = async (prompt: string) => {
  try {
    const res = await axiosInstance.post("/gemini/prompt-with-actions", {
      prompt,
    });
    return res.data.data;
  } catch (error) {
    console.log(error);
  }
};
export const clearContext = async () => {
  try {
    const res = await axiosInstance.get("/gemini/clear-context");
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
