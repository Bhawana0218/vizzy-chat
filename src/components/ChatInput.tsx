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

const ACCEPTED_FILE_TYPES = [
  "image/*",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

function getFileIcon(type: string): string {
  if (type.startsWith("image/")) return "";
  if (type === "application/pdf") return "pdf";
  if (type.includes("wordprocessingml")) return "doc";
  if (type === "text/plain") return "txt";
  return "file";
}

function WaveformBars({ waveform }: { waveform: number[] }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {waveform.slice(0, 16).map((val, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-red-400 transition-all duration-75"
          style={{ height: `${Math.max(2, val * 16)}px` }}
        />
      ))}
    </div>
  );
}

export default function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const recorder = useVoiceRecorder();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const processFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((f) => {
      if (f.size > MAX_FILE_SIZE) return false;
      for (const accepted of ACCEPTED_FILE_TYPES) {
        if (accepted.endsWith("/*") && f.type.startsWith(accepted.replace("/*", "/"))) return true;
        if (f.type === accepted) return true;
      }
      return false;
    });

    const remaining = MAX_FILES - attachments.length;
    const toAdd = validFiles.slice(0, remaining);

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = file.type.startsWith("image/")
          ? (e.target?.result as string)
          : "";

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

  const toggleVoiceRecording = useCallback(async () => {
    if (recorder.isRecording) {
      const blob = await recorder.stopRecording();
      if (blob) {
        const url = URL.createObjectURL(blob);
        const voiceData: VoiceData = {
          blob,
          url,
          duration: recorder.duration,
          waveform: recorder.waveform,
          transcript: recorder.transcript,
        };
        const trimmed = input.trim();
        const transcript = recorder.transcript.trim();
        const messageText = trimmed || transcript || "Create an image based on my voice description";
        onSend(messageText, attachments.length > 0 ? [...attachments] : undefined, voiceData);
        setInput("");
        setAttachments([]);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      }
    } else {
      await recorder.startRecording();
    }
  }, [recorder, input, attachments, onSend]);

  const cancelRecording = useCallback(() => {
    recorder.cancelRecording();
  }, [recorder]);

  const handleSend = () => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || isLoading || disabled || recorder.isRecording) return;
    const sendText = trimmed || `Analyze ${attachments.length} attached file${attachments.length > 1 ? "s" : ""}`;

    onSend(sendText, attachments.length > 0 ? [...attachments] : undefined);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = input.trim() || attachments.length > 0;
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  };

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
            : isFocused || recorder.isRecording
              ? "border-white/[0.12] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.4)]"
              : "border-white/[0.06] hover:border-white/[0.1]"
          }
          bg-[#0e0e12]/90 backdrop-blur-xl
        `}
      >
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
              <p className="text-[13px] text-violet-300 font-medium">Drop files to attach</p>
              <p className="text-[11px] text-zinc-500">Images, PDFs, Documents, Text</p>
            </div>
          </div>
        )}

        {/* Voice Recording Indicator */}
        {recorder.isRecording && (
          <div className="px-3 pt-3 pb-0">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[12px] text-red-300 font-medium">{recorder.isPaused ? "Paused" : "Recording"}</span>
              </div>
              <WaveformBars waveform={recorder.waveform} />
              <span className="text-[11px] text-zinc-400 font-mono">{formatDuration(recorder.duration)}</span>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={recorder.isPaused ? recorder.resumeRecording : recorder.pauseRecording}
                  className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors"
                  title={recorder.isPaused ? "Resume" : "Pause"}
                >
                  {recorder.isPaused ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  )}
                </button>
                <button
                  onClick={cancelRecording}
                  className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                  title="Cancel recording"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <button
                  onClick={toggleVoiceRecording}
                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                  title="Stop and send"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex items-center gap-2 px-3 pt-3 pb-0 flex-wrap">
            {attachments.map((att) => (
              <div key={att.id} className="relative group shrink-0 animate-scale-in">
                <div className={`w-16 h-16 rounded-xl overflow-hidden border border-white/[0.08] bg-white/[0.03] flex items-center justify-center ${!att.previewUrl ? "bg-gradient-to-br from-zinc-800 to-zinc-900" : ""}`}>
                  {att.previewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-400">
                        {getFileIcon(att.type)}
                      </span>
                      <span className="text-[8px] text-zinc-600">{formatSize(att.size)}</span>
                    </div>
                  )}
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
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={recorder.isRecording ? "Speak now..." : attachments.length > 0 ? "Describe what to create with these files..." : "Describe what you want to create..."}
          rows={1}
          disabled={disabled || recorder.isRecording}
          className={`w-full bg-transparent text-[14px] text-zinc-100 resize-none outline-none leading-relaxed min-h-[48px] disabled:opacity-40 px-4 pt-3.5 pb-2 pl-20 ${attachments.length > 0 ? "pt-2 pb-2" : ""}`}
        />

        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-2 pb-2 pt-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-200 border ${
                attachments.length > 0
                  ? "text-violet-300 bg-violet-500/15 border-violet-500/25 shadow-sm shadow-violet-500/10"
                  : "text-zinc-400 bg-white/[0.04] border-white/[0.06] hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] hover:shadow-md hover:shadow-black/20"
              }`}
              title="Attach files"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
              <span className="hidden sm:inline">Attach</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ""; }}
            />

            <button
              onClick={toggleVoiceRecording}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-200 border ${
                recorder.isRecording
                  ? "text-red-300 bg-red-500/15 border-red-500/25 shadow-sm shadow-red-500/10"
                  : "text-zinc-400 bg-white/[0.04] border-white/[0.06] hover:text-white hover:bg-white/[0.08] hover:border-white/[0.12] hover:shadow-md hover:shadow-black/20"
              }`}
              title="Record voice message with waveform"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <span className="hidden sm:inline">{recorder.isRecording ? "Stop" : "Voice"}</span>
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!hasContent || isLoading || disabled || recorder.isRecording}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium transition-all duration-200 btn-press
              ${hasContent && !isLoading && !disabled && !recorder.isRecording
                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/25"
                : "bg-white/[0.04] text-zinc-600 cursor-not-allowed border border-white/[0.06]"
              }
            `}
          >
            {isLoading ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
            <span className="hidden sm:inline">{isLoading ? "Generating..." : "Send"}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        <p className="text-[11px] text-zinc-700">
          {recorder.isRecording
            ? "Recording... use pause or stop to send"
            : recorder.error
              ? recorder.error
              : attachments.length > 0
                ? `${attachments.length} file${attachments.length > 1 ? "s" : ""} attached`
                : "Attach files or click Voice to record. Enter to send, Shift+Enter for newline."
          }
        </p>
      </div>
    </div>
  );
}
