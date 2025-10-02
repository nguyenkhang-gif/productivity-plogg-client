import axiosInstance from "@/core/lib/axiosInstance";

export const sentPrompts = async (prompt: string) => {
  try {
    const res = await axiosInstance.post("/gemini/prompt-with-personal", { prompt });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
