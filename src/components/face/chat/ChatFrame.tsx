"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { RootState } from "@/core/redux/store";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useAskAiWithSound } from "@/core/hooks/aiChat/useAskAiWithSound";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Hàm parse nội dung tin nhắn để tách text và code
const parseMessageContent = (text: string) => {
  const parts: { type: "text" | "code"; content: string; language?: string }[] =
    [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
  let lastIndex = 0;
  let match;

  // Tìm tất cả các khối code
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const startIndex = match.index;
    const endIndex = codeBlockRegex.lastIndex;

    // Thêm text trước khối code (nếu có)
    if (startIndex > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, startIndex),
      });
    }

    // Thêm khối code
    parts.push({
      type: "code",
      content: match[2].trim(),
      language: match[1] || "javascript", // Mặc định là javascript nếu không có ngôn ngữ
    });

    lastIndex = endIndex;
  }

  // Thêm phần text còn lại (nếu có)
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  // Nếu không có khối code, toàn bộ là text
  if (parts.length === 0) {
    parts.push({
      type: "text",
      content: text,
    });
  }

  return parts;
};

const ChatFrame = () => {
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messages = useSelector((state: RootState) => state.aiChat.messages);
  const { ask: askAi, isPending } = useAskAiWithSound();

  // Handle sending messages
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    askAi(inputText);
    setInputText("");
  };

  // Auto-adjust textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  return (
    <div className="flex flex-col h-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-800/50">
      {/* Chat display area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            } animate-slideIn`}
          >
            <div
              className={`inline-block p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 transition-all duration-300 hover:shadow-md ${
                message.sender === "user"
                  ? "text-blue-800 dark:text-blue-300"
                  : "text-gray-800 dark:text-gray-200"
              }`}
            >
              {parseMessageContent(message.text).map((part, index) => (
                <div key={index}>
                  {part.type === "code" ? (
                    <SyntaxHighlighter
                      language={part.language}
                      style={vscDarkPlus}
                      customStyle={{
                        background: "transparent",
                        padding: "8px",
                        margin: "0",
                        borderRadius: "4px",
                      }}
                    >
                      {part.content}
                    </SyntaxHighlighter>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2">{children}</p>,
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside mb-2">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-2">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-bold">{children}</strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            className="text-blue-500 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {part.content}
                    </ReactMarkdown>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Input area */}
      <div className="p-4 bg-transparent border-t border-gray-200/50 dark:border-gray-800/50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none bg-white/50 dark:bg-gray-900/50 border border-gray-300/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-black dark:text-white transition-all duration-300 focus:scale-[1.01] focus:shadow-lg rounded-md p-2"
            style={{ minHeight: "40px", maxHeight: "120px", overflowY: "auto" }}
            disabled={isPending}
          />
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 h-auto"
            disabled={isPending}
          >
            {isPending ? "Sending..." : "Send"}
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
