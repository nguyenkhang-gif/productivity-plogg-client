// import { useState, useMemo } from "react";
// import axiosInstance from "@/core/lib/axiosInstance"; // Thay thế bằng cách gọi API của bạn
import {
  useAskGemini,
  useAskGeminiWithAction,
} from "@/core/services/client/aiChat";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { setMessages } from "@/core/redux/aiChat";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

async function handleGenerateGoogleTTS(text: string, lang = "en") {
  const res = await fetch("/api/google-tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      lang,
    }),
  });

  if (!res.ok) {
    console.error("TTS error:", await res.json());
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const audio = new Audio(url);
  audio.play();
}

export const useAskAiWithSound = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.aiChat.messages);

  const { mutate: askAi, isPending } = useAskGemini();

  const ask = async (inputText: string, lang = "en") => {
    const userMessage: Message = {
      id: String(Date.now()),
      text: inputText,
      sender: "user",
    };
    dispatch(setMessages([...messages, userMessage]));
    // Chuẩn bị body dữ liệu với các trường đầy đủ
    askAi(inputText, {
      onSuccess: (data) => {
        const botMessage: Message = {
          id: String(Date.now() + 1),
          text: data.data[0]?.text ?? "Sorry, I couldn't process that.",
          sender: "bot",
        };

        const codeBlock = /```[\s\S]*?```/g; // remove code block
        const inlineCode = /`([^`]+)`/g; // remove inline code

        const cleanText = botMessage.text
          .replace(codeBlock, "")
          .replace(inlineCode, "$1") // giữ lại chữ bên trong hoặc xóa hoàn toàn
          .replace(/\*\*(.*?)\*\*/g, "$1") // bold
          .replace(/\*(.*?)\*/g, "$1") // italic
          .replace(/#+\s?(.*)/g, "$1") // heading
          .trim();
        // handleGenerateTTS(botMessage.text).then(() => {
        //   dispatch(setMessages([...messages, userMessage, botMessage]));
        // });
        handleGenerateGoogleTTS(cleanText, lang).then(() => {
          dispatch(setMessages([...messages, userMessage, botMessage]));
        });
        // handleGenerateGeminiTTS(cleanText, lang).then(() => {
        //   dispatch(setMessages([...messages, userMessage, botMessage]));
        // });
      },
      onError: (error) => {
        console.error("Error asking AI:", error);
        const errorMessage: Message = {
          id: String(Date.now() + 1),
          text: "Error: Could not get response from AI",
          sender: "bot",
        };
        dispatch(setMessages([...messages, userMessage, errorMessage]));
      },
    });
  };

  return {
    ask,
    isPending,
  };
};

export const useAskAiWithSoundAndAction = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.aiChat.messages);

  const { mutate: askAi, isPending } = useAskGeminiWithAction();

  const ask = async (inputText: string, lang = "en") => {
    const userMessage: Message = {
      id: String(Date.now()),
      text: inputText,
      sender: "user",
    };
    dispatch(setMessages([...messages, userMessage]));
    // Chuẩn bị body dữ liệu với các trường đầy đủ
    askAi(inputText, {
      onSuccess: (data) => {
        const text =
          data.data.candidates[0]?.content.parts[0]?.text ??
          "Sorry, I couldn't process that.";
        const botMessage: Message = {
          id: String(Date.now() + 1),
          text: text,
          sender: "bot",
        };

        const codeBlock = /```[\s\S]*?```/g; // remove code block
        const inlineCode = /`([^`]+)`/g; // remove inline code

        const cleanText = botMessage.text
          .replace(codeBlock, "")
          .replace(inlineCode, "$1") // giữ lại chữ bên trong hoặc xóa hoàn toàn
          .replace(/\*\*(.*?)\*\*/g, "$1") // bold
          .replace(/\*(.*?)\*/g, "$1") // italic
          .replace(/#+\s?(.*)/g, "$1") // heading
          .trim();
        // handleGenerateTTS(botMessage.text).then(() => {
        //   dispatch(setMessages([...messages, userMessage, botMessage]));
        // });
        handleGenerateGoogleTTS(cleanText, lang).then(() => {
          dispatch(setMessages([...messages, userMessage, botMessage]));
        });
        // handleGenerateGeminiTTS(cleanText, lang).then(() => {
        //   dispatch(setMessages([...messages, userMessage, botMessage]));
        // });
      },
      onError: (error) => {
        console.error("Error asking AI:", error);
        const errorMessage: Message = {
          id: String(Date.now() + 1),
          text: "Error: Could not get response from AI",
          sender: "bot",
        };
        dispatch(setMessages([...messages, userMessage, errorMessage]));
      },
    });
  };

  return {
    ask,
    isPending,
  };
};
