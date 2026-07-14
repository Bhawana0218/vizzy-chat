"use client";

import { useState, useEffect, useCallback } from "react";
import { GeneratedAsset } from "@/lib/types";
import { downloadImage, DownloadFormat } from "@/lib/download";

interface CompareModalProps {
  assets: GeneratedAsset[];
  initialIndex?: number;
  onClose: () => void;
  onOpen?: (asset: GeneratedAsset) => void;
}

export default function CompareModal({ assets, initialIndex = 0, onClose, onOpen }: CompareModalProps) {
  const [leftIdx, setLeftIdx] = useState(initialIndex);
  const [rightIdx, setRightIdx] = useState(Math.min(initialIndex + 1, assets.length - 1));
  const [zoomLeft, setZoomLeft] = useState(1);
  const [zoomRight, setZoomRight] = useState(1);
  const [syncZoom, setSyncZoom] = useState(true);
  const [downloading, setDownloading] = useState<"left" | "right" | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("png");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && leftIdx > 0) {
        setLeftIdx((i) => i - 1);
        if (syncZoom) setZoomLeft(1);
      }
      if (e.key === "ArrowRight" && rightIdx < assets.length - 1) {
        setRightIdx((i) => i + 1);
        if (syncZoom) setZoomRight(1);
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKey); document.body.style.overflow = ""; };
  }, [onClose, leftIdx, rightIdx, assets.length, syncZoom]);

  const handleZoom = useCallback((e: React.WheelEvent, side: "left" | "right") => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    if (syncZoom) {
      setZoomLeft((z) => Math.min(Math.max(z + delta, 0.25), 4));
      setZoomRight((z) => Math.min(Math.max(z + delta, 0.25), 4));
    } else if (side === "left") {
      setZoomLeft((z) => Math.min(Math.max(z + delta, 0.25), 4));
    } else {
      setZoomRight((z) => Math.min(Math.max(z + delta, 0.25), 4));
    }
  }, [syncZoom]);

  const handleDownload = async (side: "left" | "right") => {
    const asset = side === "left" ? assets[leftIdx] : assets[rightIdx];
    if (!asset) return;
    setDownloading(side);
    try {
      await downloadImage({ url: asset.url, filename: asset.title || "vizzy-compare", format: downloadFormat });
    } catch {
      const a = document.createElement("a");
      a.href = asset.url;
      a.download = `vizzy-${asset.title || "compare"}.${downloadFormat}`;
      a.click();
    } finally {
      setDownloading(null);
    }
  };

  if (assets.length < 2) return null;

  const left = assets[leftIdx];
  const right = assets[rightIdx];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#06060a]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-[13px] font-semibold text-white">Compare</h2>
          <span className="text-[11px] text-zinc-500">{assets.length} variations</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 cursor-pointer select-none">
            <input type="checkbox" checked={syncZoom} onChange={(e) => setSyncZoom(e.target.checked)} className="accent-violet-500 w-3 h-3" />
            Sync zoom
          </label>

          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            {(["png", "jpg", "webp"] as DownloadFormat[]).map((fmt) => (
              <button key={fmt} onClick={() => setDownloadFormat(fmt)} className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase transition-colors ${downloadFormat === fmt ? "bg-violet-500/20 text-violet-300" : "text-zinc-600 hover:text-zinc-400"}`}>
                {fmt}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.06] text-zinc-400 hover:text-white transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Compare Panels */}
      <div className="flex-1 flex min-h-0">
        {[
          { side: "left" as const, asset: left, idx: leftIdx, setIdx: setLeftIdx, zoom: zoomLeft, onWheel: (e: React.WheelEvent) => handleZoom(e, "left") },
          { side: "right" as const, asset: right, idx: rightIdx, setIdx: setRightIdx, zoom: zoomRight, onWheel: (e: React.WheelEvent) => handleZoom(e, "right") },
        ].map(({ side, asset, idx, setIdx, zoom, onWheel }) => (
          <div key={side} className="flex-1 flex flex-col min-w-0 border-r border-white/[0.06] last:border-r-0">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04] shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => { if (idx > 0) setIdx(idx - 1); }} disabled={idx === 0} className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span className="text-[11px] text-zinc-400 min-w-[30px] text-center">{idx + 1}/{assets.length}</span>
                <button onClick={() => { if (idx < assets.length - 1) setIdx(idx + 1); }} disabled={idx === assets.length - 1} className="p-1 text-zinc-500 hover:text-white disabled:opacity-30 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-600">{Math.round(zoom * 100)}%</span>
                <button onClick={() => onOpen?.(asset)} className="p-1 text-zinc-500 hover:text-white transition-colors" title="Open full">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
                </button>
                <button onClick={() => handleDownload(side)} disabled={downloading === side} className="p-1 text-zinc-500 hover:text-white transition-colors disabled:opacity-50" title="Download">
                  {downloading === side ? (
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center bg-[#0a0a0c] overflow-hidden" onWheel={onWheel}>
              {asset && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.url}
                  alt={asset.title}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                  draggable={false}
                />
              )}
            </div>

            {/* Info Footer */}
            {asset && (
              <div className="px-3 py-2 border-t border-white/[0.04] shrink-0 space-y-1">
                <div className="flex items-center gap-2">
                  {(asset.variationName || asset.metadata?.variationName) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 font-medium">
                      {asset.variationName || asset.metadata?.variationName}
                    </span>
                  )}
                  {asset.metadata?.style && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-500">
                      {asset.metadata.style}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 truncate">{asset.prompt}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Strip */}
      <div className="flex items-center justify-center gap-2 py-2 border-t border-white/[0.06] shrink-0">
        {assets.map((_, i) => (
          <button
            key={i}
            onClick={() => { setLeftIdx(i); setRightIdx(Math.min(i + 1, assets.length - 1)); }}
            className={`w-2 h-2 rounded-full transition-all ${i === leftIdx || i === rightIdx ? "bg-violet-500 scale-125" : "bg-zinc-700 hover:bg-zinc-500"}`}
          />
        ))}
      </div>
    </div>
  );
}
