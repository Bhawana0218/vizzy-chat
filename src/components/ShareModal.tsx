"use client";

import { useState } from "react";
import { GeneratedAsset } from "@/lib/types";
import { downloadImage, DownloadFormat, downloadAllImages } from "@/lib/download";

interface ShareModalProps {
  asset: GeneratedAsset;
  onClose: () => void;
}

export default function ShareModal({ asset, onClose }: ShareModalProps) {
  const [format, setFormat] = useState<DownloadFormat>("png");
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadImage({ url: asset.url, filename: asset.title || "vizzy-asset", format });
    } catch {
      const a = document.createElement("a");
      a.href = asset.url;
      a.download = `vizzy-${asset.title || "asset"}.${format}`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(asset.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ok */ }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(asset.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ok */ }
  };

  const handleBulkDownload = async () => {
    setDownloading(true);
    await downloadAllImages([{ url: asset.url, title: asset.title }], format);
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-[#141416] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h3 className="text-[14px] font-semibold text-white">Share & Export</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#1a1a1e] border border-white/[0.06]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset.url} alt={asset.title} className="w-full h-full object-cover" />
          </div>

          {/* Format Selector */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium">Format</label>
            <div className="flex gap-2 mt-2">
              {(["png", "jpg", "webp"] as DownloadFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-medium uppercase transition-all ${
                    format === fmt
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : "bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:text-zinc-300"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-all disabled:opacity-50"
            >
              {downloading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              )}
              Download as {format.toUpperCase()}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[12px] text-zinc-400 hover:text-white transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={handleCopyPrompt}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[12px] text-zinc-400 hover:text-white transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy Prompt
              </button>
            </div>
          </div>

          {/* Asset Info */}
          <div className="pt-3 border-t border-white/[0.06]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-600">{asset.width} x {asset.height}</span>
              <span className="text-zinc-600">{asset.metadata?.model || "Pollinations AI"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
