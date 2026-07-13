"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent, DragEvent } from "react";
import { MessageAttachment, VoiceData } from "@/lib/types";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

interface ChatInputProps {
  onSend: (message: string, attachments?: MessageAttachment[], voiceData?: VoiceData) => void;
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
  const [pendingVoiceBlob, setPendingVoiceBlob] = useState<Blob | null>(null);
  const [pendingVoiceUrl, setPendingVoiceUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const voice = useVoiceRecorder();

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

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
  }, [processFiles]);

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

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleVoiceToggle = async () => {
    if (voice.isRecording) {
      const blob = await voice.stopRecording();
      if (blob && blob.size > 0) {
        const url = URL.createObjectURL(blob);
        setPendingVoiceBlob(blob);
        setPendingVoiceUrl(url);
      }
    } else {
      setPendingVoiceBlob(null);
      if (pendingVoiceUrl) {
        URL.revokeObjectURL(pendingVoiceUrl);
        setPendingVoiceUrl(null);
      }
      await voice.startRecording();
    }
  };

  const cancelVoice = () => {
    voice.cancelRecording();
    setPendingVoiceBlob(null);
    if (pendingVoiceUrl) {
      URL.revokeObjectURL(pendingVoiceUrl);
      setPendingVoiceUrl(null);
    }
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0 && !pendingVoiceBlob) || isLoading || disabled) return;
    const sendText = trimmed || (pendingVoiceBlob ? "Transcribe and analyze this voice note" : "Analyze these reference images");

    let voiceData: VoiceData | undefined;
    if (pendingVoiceBlob) {
      voiceData = {
        blob: pendingVoiceBlob,
        url: pendingVoiceUrl || "",
        duration: voice.duration,
        waveform: voice.waveform,
      };
    }

    onSend(sendText, attachments.length > 0 ? [...attachments] : undefined, voiceData);
    setInput("");
    setAttachments([]);
    setPendingVoiceBlob(null);
    setPendingVoiceUrl(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = input.trim() || attachments.length > 0 || pendingVoiceBlob;
  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div
      className="w-full max-w-3xl mx-auto px-4 pb-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`
          relative rounded-2xl border transition-all duration-300
          ${isDragOver
            ? "border-violet-400/60 shadow-[0_0_0_2px_rgba(139,92,246,0.2),0_0_40px_rgba(139,92,246,0.1)] bg-violet-500/[0.04]"
            : isFocused
              ? "border-white/[0.12] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.4)]"
              : "border-white/[0.06] hover:border-white/[0.1]"
          }
          bg-[#0e0e12]/90 backdrop-blur-xl
        `}
      >
        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#0e0e12]/90 backdrop-blur-sm pointer-events-none">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center animate-float">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-[13px] text-violet-300 font-medium">Drop reference images</p>
              <p className="text-[11px] text-zinc-500">Up to {MAX_FILES} images</p>
            </div>
          </div>
        )}

        {/* Pending Voice Note */}
        {pendingVoiceUrl && !voice.isRecording && (
          <div className="px-3 pt-3 pb-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 animate-scale-in">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-violet-200 font-medium">Voice note</p>
                <p className="text-[10px] text-zinc-500">{formatDuration(voice.duration)}</p>
              </div>
              <button onClick={cancelVoice} className="p-1 rounded-md hover:bg-white/[0.06] text-zinc-400 hover:text-red-400 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* Recording Waveform */}
        {voice.isRecording && (
          <div className="px-3 pt-3 pb-0">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-1 h-6">
                {voice.waveform.slice(0, 16).map((val, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-red-400 transition-all duration-75"
                    style={{ height: `${Math.max(4, val * 24)}px` }}
                  />
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-red-300 font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Recording
                  <span className="text-zinc-500 font-normal">{formatDuration(voice.duration)}</span>
                </p>
              </div>
              <button onClick={voice.pauseRecording} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              </button>
              <button onClick={handleVoiceToggle} className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
              </button>
            </div>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && !voice.isRecording && (
          <div className="flex items-center gap-2 px-3 pt-3 pb-0 flex-wrap">
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
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
            )}
          </div>
        )}

        {/* Textarea */}
        {!voice.isRecording && (
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={attachments.length > 0 ? "Describe what to create with these references..." : pendingVoiceBlob ? "Add a message about your voice note..." : "Describe what you want to create..."}
            rows={1}
            disabled={disabled}
            className={`w-full bg-transparent text-[14px] text-zinc-100 placeholder:text-zinc-600 resize-none outline-none leading-relaxed min-h-[48px] disabled:opacity-40 ${(attachments.length > 0 || pendingVoiceBlob) ? "px-4 pt-2 pb-2 pr-24" : "px-4 pt-3.5 pb-2 pr-24"}`}
          />
        )}

        {/* Bottom toolbar */}
        {!voice.isRecording && (
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-lg transition-colors ${attachments.length > 0 ? "text-violet-400 bg-violet-500/10" : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]"}`}
                title="Upload reference image"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ""; }}
              />
              <button
                onClick={handleVoiceToggle}
                className={`p-2 rounded-lg transition-colors ${pendingVoiceBlob ? "text-violet-400 bg-violet-500/10" : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]"}`}
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
                p-2 rounded-xl transition-all duration-200 btn-press
                ${hasContent && !isLoading && !disabled
                  ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
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
        )}

        {/* Voice recording button (when no other content) */}
        {voice.isRecording && (
          <div className="px-4 pb-3 pt-2">
            <p className="text-[11px] text-zinc-600 text-center">Click stop when finished, then send your voice note</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        <p className="text-[11px] text-zinc-700">
          {voice.isRecording
            ? "Recording in progress..."
            : pendingVoiceBlob
              ? "Voice note ready to send"
              : attachments.length > 0
                ? `${attachments.length} reference${attachments.length > 1 ? "s" : ""} attached`
                : "Drop, paste, or click to attach references. Click mic for voice."
          }
        </p>
      </div>
    </div>
  );
}
