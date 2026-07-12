"use client";

import { Message } from "@/lib/types";
import AssetGrid from "./AssetGrid";
import { GeneratedAsset } from "@/lib/types";

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: (asset: GeneratedAsset) => void;
  onVariation?: (asset: GeneratedAsset) => void;
  onOpen?: (asset: GeneratedAsset) => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function StreamingText({ text }: { text: string }) {
  return (
    <span className="inline">
      {text}
      <span className="inline-block w-0.5 h-[1.1em] bg-violet-400 ml-0.5 animate-pulse align-text-bottom" />
    </span>
  );
}

export default function MessageBubble({ message, onRegenerate, onVariation, onOpen }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`group flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[85%] md:max-w-[70%]`}>
        {message.attachments && message.attachments.length > 0 && !message.isStreaming && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {message.attachments.map((att) => (
              <div key={att.id} className="w-14 h-14 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03] shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div
          className={`
            rounded-2xl px-4 py-3 text-[14px] leading-relaxed
            ${
              isUser
                ? "bg-violet-600 text-white rounded-br-md"
                : "bg-[#1a1a1e] text-zinc-200 border border-white/[0.06] rounded-bl-md"
            }
          `}
        >
          {message.isStreaming && !message.content ? (
            <TypingIndicator />
          ) : message.isStreaming ? (
            <StreamingText text={message.content} />
          ) : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>

        {message.assets && message.assets.length > 0 && !message.isStreaming && (
          <AssetGrid
            assets={message.assets}
            onRegenerate={onRegenerate}
            onVariation={onVariation}
            onOpen={onOpen}
          />
        )}

        {!message.isStreaming && (
          <div className="flex items-center gap-3 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {!isUser && (
              <>
                <button className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Copy
                </button>
                <button className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                  Regenerate
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[12px] font-semibold text-zinc-300">U</span>
        </div>
      )}
    </div>
  );
}
