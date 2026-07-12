"use client";

import { useRef, useEffect } from "react";
import { Message, GeneratedAsset } from "@/lib/types";
import MessageBubble from "./MessageBubble";

interface ChatAreaProps {
  messages: Message[];
  onRegenerate?: (asset: GeneratedAsset) => void;
  onVariation?: (asset: GeneratedAsset) => void;
  onOpen?: (asset: GeneratedAsset) => void;
}

export default function ChatArea({ messages, onRegenerate, onVariation, onOpen }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lastContent = messages.length > 0 ? messages[messages.length - 1].content : "";

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, lastContent]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4"
    >
      <div className="max-w-3xl mx-auto py-6 space-y-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRegenerate={onRegenerate}
            onVariation={onVariation}
            onOpen={onOpen}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
