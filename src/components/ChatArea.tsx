"use client";

import { useRef, useEffect } from "react";
import { Message, GeneratedAsset } from "@/lib/types";
import MessageBubble from "./MessageBubble";

interface ChatAreaProps {
  messages: Message[];
  onRegenerate?: (asset: GeneratedAsset) => void;
  onVariation?: (asset: GeneratedAsset) => void;
  onOpen?: (asset: GeneratedAsset) => void;
  onCopy?: (text: string) => void;
  onCopyPrompt?: (asset: GeneratedAsset) => void;
  onFavorite?: (asset: GeneratedAsset) => void;
  onDelete?: (asset: GeneratedAsset) => void;
  onRetry?: (messageId: string) => void;
}

export default function ChatArea({ messages, onRegenerate, onVariation, onOpen, onCopy, onCopyPrompt, onFavorite, onDelete, onRetry }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastMsg = messages[messages.length - 1];

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, lastMsg?.content, lastMsg?.assets?.length]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto py-6 px-6 space-y-1">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRegenerate={onRegenerate}
            onVariation={onVariation}
            onOpen={onOpen}
            onCopy={onCopy}
            onCopyPrompt={onCopyPrompt}
            onFavorite={onFavorite}
            onDelete={onDelete}
            onRetry={onRetry ? () => onRetry(message.id) : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
