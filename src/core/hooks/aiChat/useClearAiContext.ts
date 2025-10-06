"use client";
import { useClearContext } from "@/core/services/client/aiChat";
import { useDispatch } from "react-redux";
import { setMessages } from "@/core/redux/aiChat";
import { useToast } from "../use-toast";

// async function handleGenerateTTS(text: string) {
//   const res = await fetch("/api/tts", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       text,
//     }),
//   });

//   if (!res.ok) {
//     console.error("TTS error:", await res.json());
//     return;
//   }

//   const blob = await res.blob();
//   const url = URL.createObjectURL(blob);

//   const audio = new Audio(url);
//   audio.play();
// }

// async function handleGenerateGeminiTTS(text: string, lang = "en") {
//   const res = await fetch("/api/gemini-tts", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       text,
//     }),
//   });

//   if (!res.ok) {
//     console.error("TTS error:", await res.json());
//     return;
//   }

//   const blob = await res.blob();
//   const url = URL.createObjectURL(blob);

//   const audio = new Audio(url);
//   audio.play();
// }

export const useClearAiContext = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { mutate, isPending } = useClearContext();

  const clear = async () => {
    // Chuẩn bị body dữ liệu với các trường đầy đủ
    mutate("yo", {
      onSuccess: () => {
        dispatch(setMessages([]));
        toast({
          title: "Successfully",
          description: "Successfully cleared",
        });
        // handleGenerateGeminiTTS(cleanText, lang).then(() => {
        //   dispatch(setMessages([...messages, userMessage, botMessage]));
        // });
      },
      onError: (error) => {
        console.error("Error asking AI:", error);
      },
    });
  };

  return {
    clear,
    isPending,
  };
};
