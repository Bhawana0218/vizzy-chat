"use client";

import { useState, useRef, useEffect, KeyboardEvent, DragEvent, useCallback } from "react";
import { MessageAttachment } from "@/lib/types";

interface ChatInputProps {
  onSend: (message: string, attachments?: MessageAttachment[]) => void;
  isLoading: boolean;
  disabled?: boolean;
}

function generateAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

const MAX_FILES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const processFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const remaining = MAX_FILES - attachments.length;
    const toAdd = imageFiles.slice(0, remaining);

    toAdd.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          { id: generateAttachmentId(), name: file.name, type: file.type, size: file.size, previewUrl },
        ]);
      };
      reader.readAsDataURL(file);
    });
  }, [attachments.length]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      processFiles(imageFiles);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || isLoading || disabled) return;
    const sendText = trimmed || "Analyze these reference images";
    onSend(sendText, attachments.length > 0 ? [...attachments] : undefined);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = input.trim() || attachments.length > 0;

  return (
    <div
      className="w-full max-w-3xl mx-auto px-4 pb-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`
          relative rounded-2xl border transition-all duration-200
          ${
            isDragOver
              ? "border-violet-400/60 shadow-[0_0_0_2px_rgba(139,92,246,0.2),0_0_32px_rgba(139,92,246,0.12)] bg-violet-500/[0.04]"
              : isFocused
                ? "border-violet-500/50 shadow-[0_0_0_1px_rgba(139,92,246,0.15),0_4px_24px_rgba(139,92,246,0.08)]"
                : "border-white/[0.08] hover:border-white/[0.12]"
          }
          bg-[#111113]
        `}
      >
        {isDragOver && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#111113]/90 backdrop-blur-sm pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-[13px] text-violet-300 font-medium">Drop reference images here</p>
              <p className="text-[11px] text-zinc-500">Up to {MAX_FILES} images</p>
            </div>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="flex items-center gap-2 px-3 pt-3 pb-0">
            {attachments.map((att) => (
              <div key={att.id} className="relative group shrink-0 animate-scale-in">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-800 border border-white/[0.1] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <p className="absolute bottom-0 left-0 right-0 text-[8px] text-zinc-400 text-center truncate px-0.5 bg-black/50 rounded-b-xl">
                  {att.name.length > 12 ? att.name.substring(0, 10) + ".." : att.name}
                </p>
              </div>
            ))}
            {attachments.length < MAX_FILES && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-xl border border-dashed border-white/[0.1] hover:border-violet-500/40 flex items-center justify-center text-zinc-600 hover:text-violet-400 transition-colors shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={attachments.length > 0 ? "Describe what you want to create with these references..." : "Describe what you want to create..."}
          rows={1}
          disabled={disabled}
          className={`w-full bg-transparent text-[14px] text-zinc-100 placeholder:text-zinc-600 resize-none outline-none px-4 leading-relaxed min-h-[48px] disabled:opacity-40 ${attachments.length > 0 ? "pt-2 pb-2 pr-24" : "pt-3.5 pb-2 pr-24"}`}
        />

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-lg transition-colors ${attachments.length > 0 ? "text-violet-400 bg-violet-500/10" : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]"}`}
              title="Upload reference image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              className="p-2 rounded-lg text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors"
              title="Voice input"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!hasContent || isLoading || disabled}
            className={`
              p-2 rounded-xl transition-all duration-200
              ${
                hasContent && !isLoading && !disabled
                  ? "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20"
                  : "bg-white/[0.04] text-zinc-600 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        <p className="text-[11px] text-zinc-700">
          {attachments.length > 0
            ? `${attachments.length} reference image${attachments.length > 1 ? "s" : ""} attached — drag & drop or paste images`
            : "Drag & drop, paste (Ctrl+V), or click the image icon to attach references"}
        </p>
      </div>
    </div>
  );
}
