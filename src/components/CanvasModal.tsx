"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { GeneratedAsset } from "@/lib/types";
import { downloadImage, DownloadFormat } from "@/lib/download";

interface CanvasModalProps {
  asset: GeneratedAsset | null;
  allAssets?: GeneratedAsset[];
  onClose: () => void;
  onRegenerate?: (asset: GeneratedAsset) => void;
  onVariation?: (asset: GeneratedAsset) => void;
  onCopyPrompt?: (text: string) => void;
}

export default function CanvasModal({ asset, allAssets, onClose, onRegenerate, onVariation, onCopyPrompt }: CanvasModalProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showMetadata, setShowMetadata] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("png");
  const [downloading, setDownloading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const currentIndex = allAssets && asset ? allAssets.findIndex((a) => a.id === asset.id) : -1;
  const hasNav = allAssets && allAssets.length > 1 && currentIndex >= 0;

  useEffect(() => {
    queueMicrotask(() => {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setImgLoaded(false);
    });
  }, [asset?.id]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 5));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.25));
      if (e.key === "0") { setZoom(1); setPan({ x: 0, y: 0 }); }
      if (e.key === "ArrowLeft" && hasNav && currentIndex > 0) {
        const prev = allAssets![currentIndex - 1];
        onRegenerate?.(prev);
      }
      if (e.key === "ArrowRight" && hasNav && currentIndex < allAssets!.length - 1) {
        const next = allAssets![currentIndex + 1];
        onRegenerate?.(next);
      }
    },
    [onClose, hasNav, currentIndex, allAssets, onRegenerate]
  );

  useEffect(() => {
    if (asset) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [asset, handleKeyDown]);

  useEffect(() => {
    const modal = modalRef.current;
    if (!asset || !modal) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.min(Math.max(z + delta, 0.25), 5));
    };

    modal.addEventListener("wheel", handleWheel, { passive: false });
    return () => modal.removeEventListener("wheel", handleWheel);
  }, [asset]);


  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleDownload = async () => {
    if (!asset) return;
    setDownloading(true);
    try {
      await downloadImage({ url: asset.url, filename: asset.title || "vizzy-asset", format: downloadFormat });
    } catch {
      const a = document.createElement("a");
      a.href = asset.url;
      a.download = `vizzy-${asset.title || "asset"}.${downloadFormat}`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const navigate = (dir: -1 | 1) => {
    if (!allAssets || currentIndex < 0) return;
    const next = currentIndex + dir;
    if (next >= 0 && next < allAssets.length) {
      onRegenerate?.(allAssets[next]);
    }
  };

  if (!asset) return null;

  const metaItems = [
    { label: "Prompt", value: asset.prompt },
    { label: "Style", value: asset.metadata?.style || asset.variationName || "Standard" },
    { label: "Size", value: `${asset.width} × ${asset.height}` },
    { label: "Model", value: asset.metadata?.model || "Pollinations AI" },
    { label: "Seed", value: asset.metadata?.seed?.toString() || "Random" },
    { label: "Variation", value: asset.metadata?.variationName || "—" },
  ];

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" onClick={onClose} />

      <div className="relative z-10 w-full h-full flex flex-col max-w-[1400px] mx-auto p-4 md:p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white truncate max-w-[300px]">{asset.title}</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-400 uppercase font-medium">{asset.type}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasNav && (
              <div className="flex items-center gap-1 mr-2 px-2 py-1 rounded-lg bg-white/[0.06]">
                <button onClick={() => navigate(-1)} disabled={currentIndex === 0} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <span className="text-[11px] text-zinc-500 min-w-[40px] text-center">{currentIndex + 1}/{allAssets!.length}</span>
                <button onClick={() => navigate(1)} disabled={currentIndex === allAssets!.length - 1} className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            )}

            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.06]">
              <button onClick={() => { setZoom((z) => Math.max(z - 0.25, 0.25)); }} className="p-1 text-zinc-400 hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <span className="text-[11px] text-zinc-400 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => { setZoom((z) => Math.min(z + 0.25, 5)); }} className="p-1 text-zinc-400 hover:text-white transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="p-1 text-zinc-400 hover:text-white transition-colors ml-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
              </button>
            </div>

            <button onClick={() => setShowMetadata(!showMetadata)} className={`p-2 rounded-lg transition-colors ${showMetadata ? "bg-violet-500/20 text-violet-400" : "bg-white/[0.06] text-zinc-400 hover:text-white"}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>

            <button onClick={onClose} className="p-2 rounded-lg bg-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Image Area */}
          <div
            className={`flex-1 flex items-center justify-center rounded-2xl bg-[#0a0a0c] border border-white/[0.06] overflow-hidden transition-all ${showMetadata ? "mr-0" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
          >
            <div
              ref={imgRef}
              className="relative flex items-center justify-center w-full h-full p-4"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: isDragging ? "none" : "transform 0.2s ease-out",
              }}
            >
              {!imgLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    <span className="text-[12px] text-zinc-500">Loading image...</span>
                  </div>
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg select-none"
                draggable={false}
                onLoad={() => setImgLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          </div>

          {/* Metadata Panel */}
          {showMetadata && (
            <div className="w-[280px] shrink-0 rounded-2xl bg-[#111113] border border-white/[0.06] p-4 overflow-y-auto">
              <h3 className="text-[13px] font-semibold text-white mb-4">Image Details</h3>
              <div className="space-y-3">
                {metaItems.map((item) => (
                  <div key={item.label}>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">{item.label}</span>
                    <p className="text-[12px] text-zinc-300 mt-1 break-words leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-white/[0.06]">
                <h4 className="text-[11px] uppercase tracking-wider text-zinc-500 font-medium mb-3">Download As</h4>
                <div className="flex gap-1.5">
                  {(["png", "jpg", "webp"] as DownloadFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setDownloadFormat(fmt)}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium uppercase transition-colors ${
                        downloadFormat === fmt
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                          : "bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:text-zinc-300"
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-all disabled:opacity-50"
                >
                  {downloading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  )}
                  Download {downloadFormat.toUpperCase()}
                </button>

                <button
                  onClick={() => asset.metadata?.gradient ? navigator.clipboard.writeText(asset.prompt) : onCopyPrompt?.(asset.prompt)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-[12px] font-medium border border-white/[0.06] transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy Prompt
                </button>

                {onRegenerate && (
                  <button
                    onClick={() => onRegenerate(asset)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-[12px] font-medium border border-white/[0.06] transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                    Regenerate
                  </button>
                )}

                {onVariation && (
                  <button
                    onClick={() => onVariation(asset)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white text-[12px] font-medium border border-white/[0.06] transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>
                    Create Variations
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
