"use client";

import { useState, ReactNode } from "react";
import { Message, GeneratedAsset, GenerationStage } from "@/lib/types";
import AssetCard from "@/components/AssetCard";

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: (asset: GeneratedAsset) => void;
  onVariation?: (asset: GeneratedAsset) => void;
  onOpen?: (asset: GeneratedAsset) => void;
  onCopy?: (text: string) => void;
  onCopyPrompt?: (asset: GeneratedAsset) => void;
  onFavorite?: (asset: GeneratedAsset) => void;
  onDelete?: (asset: GeneratedAsset) => void;
  onRetry?: () => void;
}

function StageIndicator({ stage }: { stage: GenerationStage }) {
  const stages: { key: GenerationStage; label: string; icon: ReactNode }[] = [
    { key: "enhancing", label: "Enhancing prompt", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> },
    { key: "generating", label: "Generating assets", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg> },
    { key: "rendering", label: "Rendering variations", icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
  ];

  const current = stages.find((s) => s.key === stage);
  if (!current || stage === "idle" || stage === "completed" || stage === "error") return null;

  return (
    <div className="flex items-center gap-3 py-3 px-4 mt-2 rounded-xl bg-violet-500/[0.06] border border-violet-500/10">
      <div className="flex items-center gap-1">
        {stages.map((s, i) => {
          const isCurrent = s.key === stage;
          const isPast = stages.findIndex((x) => x.key === stage) > i;
          return (
            <div
              key={s.key}
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCurrent ? "bg-violet-500/20 text-violet-400 animate-pulse" : isPast ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.03] text-zinc-600"
              }`}
            >
              {isPast ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <span className="text-[9px] font-bold">{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-violet-300 font-medium">{current.label}</span>
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-2 px-1">
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

export default function MessageBubble({ message, onRegenerate, onVariation, onOpen, onCopy, onCopyPrompt, onFavorite, onDelete, onRetry }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopy) onCopy(message.content);
    else navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 animate-message-in ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-violet-500/20">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end max-w-[80%]" : "items-start max-w-[85%]"} min-w-0`}>
        {message.attachments && message.attachments.length > 0 && !message.isStreaming && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {message.attachments.map((att) => (
              <div key={att.id} className="w-16 h-16 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03] shrink-0 animate-scale-in">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {message.voiceData && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/15">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-violet-400">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            </svg>
            <span className="text-[11px] text-violet-300">Voice note &middot; {Math.floor(message.voiceData.duration / 60)}:{String(Math.floor(message.voiceData.duration % 60)).padStart(2, "0")}</span>
          </div>
        )}

        <div
          className={`
            rounded-2xl px-4 py-3 text-[14px] leading-relaxed
            ${isUser
              ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-md shadow-lg shadow-violet-500/15"
              : "bg-[#141418] text-zinc-200 border border-white/[0.06] rounded-bl-md"
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

        {message.stage && <StageIndicator stage={message.stage} />}

        {message.error && (
          <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/15 animate-scale-in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-400 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="text-[12px] text-red-300 flex-1">{message.error}</span>
            <button onClick={onRetry} className="text-[11px] text-red-400 hover:text-red-300 font-medium transition-colors">Retry</button>
          </div>
        )}

        {message.assets && message.assets.length > 0 && !message.isStreaming && (
          <>
            <div className="flex flex-wrap gap-2 mt-3 w-full">
              {message.assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onOpen={onOpen}
                  onRegenerate={onRegenerate}
                  onVariation={onVariation}
                  onFavorite={onFavorite}
                  onDelete={onDelete}
                  onCopyPrompt={onCopyPrompt}
                />
              ))}
            </div>

            {(message.assets[0]?.enhancedPrompt || message.assets[0]?.metadata?.enhancedPrompt) && (
              <div className="mt-2 px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] max-w-full">
                <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-medium">Enhanced Prompt</span>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed line-clamp-2">
                  {message.assets[0].enhancedPrompt || message.assets[0].metadata?.enhancedPrompt}
                </p>
              </div>
            )}
          </>
        )}

        {!message.isStreaming && !isUser && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors">
              {copied ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            {message.assets && message.assets.length > 0 && (
              <>
                <button onClick={() => message.assets?.[0] && onRegenerate?.(message.assets[0])} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                  Regenerate
                </button>
                <button onClick={() => message.assets?.[0] && onVariation?.(message.assets[0])} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.04] transition-colors">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22V8"/><path d="m21 3-9 9"/></svg>
                  Variations
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-zinc-700/80 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[12px] font-semibold text-zinc-300">U</span>
        </div>
      )}
    </div>
  );
}
