"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input"; // Shadcn Input component
import { Button } from "@/components/ui/button"; // Shadcn Button component

interface Message {
  text: string;
  sender: string;
}

const ChatFrame = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputText.trim()) {
      setMessages([...messages, { text: inputText, sender: "user" }]);
      setInputText("");
      // Simulate a bot response for demo purposes
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "This is a bot response!", sender: "bot" },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-800/50">
      {/* Chat display area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            } animate-slideIn`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg transition-all duration-300 ${
                message.sender === "user"
                  ? "bg-blue-500 text-white dark:bg-blue-600"
                  : "bg-gray-200/70 text-black dark:bg-gray-700/70 dark:text-white"
              } hover:shadow-md`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      {/* Input area */}
      <div className="p-4 bg-transparent border-t border-gray-200/50 dark:border-gray-800/50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/50 dark:bg-gray-900/50 border-gray-300/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-black dark:text-white transition-all duration-300 focus:scale-[1.01] focus:shadow-lg"
          />
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

// Custom Tailwind animation for slide-in effect
const styles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;

// Inject styles into the document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ChatFrame;
