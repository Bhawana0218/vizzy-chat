"use client";

import { useState, useRef, useEffect } from "react";
import { GeneratedAsset } from "@/lib/types";
import { downloadImage } from "@/lib/download";
import ShareModal from "./ShareModal";

interface AssetCardProps {
  asset: GeneratedAsset;
  onRegenerate?: (asset: GeneratedAsset) => void;
  onVariation?: (asset: GeneratedAsset) => void;
  onOpen?: (asset: GeneratedAsset) => void;
  onFavorite?: (asset: GeneratedAsset) => void;
  onDelete?: (asset: GeneratedAsset) => void;
  onCopyPrompt?: (asset: GeneratedAsset) => void;
}

export default function AssetCard({ asset, onRegenerate, onVariation, onOpen, onFavorite, onDelete, onCopyPrompt }: AssetCardProps) {
  const [hovered, setHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showMenu]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadImage({ url: asset.url, filename: asset.title || "vizzy-asset", format: "png" });
    } catch {
      const a = document.createElement("a");
      a.href = asset.url;
      a.download = `vizzy-${asset.title || "asset"}.png`;
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  const menuItems = [
    { label: "Open Preview", icon: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7", action: () => onOpen?.(asset) },
    { label: "Download PNG", icon: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3", action: handleDownload },
    { label: "Copy Prompt", icon: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 2h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z", action: () => { onCopyPrompt?.(asset); setShowMenu(false); } },
    { label: "Regenerate", icon: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15", action: () => { onRegenerate?.(asset); setShowMenu(false); } },
    { label: "Generate Similar", icon: "M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5", action: () => { onVariation?.(asset); setShowMenu(false); } },
    { label: "Share & Export", icon: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13", action: () => { setShowShare(true); setShowMenu(false); } },
    { type: "divider" as const },
    { label: "Delete", icon: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", action: () => { onDelete?.(asset); setShowMenu(false); }, danger: true },
  ];

  return (
    <div
      className="group relative flex-shrink-0 w-[240px] md:w-[280px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); }}
    >
      <div
        className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#111113] cursor-pointer hover:border-white/[0.12] transition-all duration-300 hover:shadow-2xl hover:shadow-black/30 hover:scale-[1.02]"
        style={{ aspectRatio: "1/1" }}
        onClick={() => onOpen?.(asset)}
      >
        {/* Image with loading skeleton */}
        <div className="absolute inset-0 bg-[#1a1a1e]">
          {!imgLoaded && (
            <div className="absolute inset-0 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-white/[0.01]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
              </div>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset.url}
            alt={asset.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onLoad={() => setImgLoaded(true)}
          />
        </div>

        {/* Variation name badge */}
        {(asset.variationName || asset.metadata?.variationName) && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/70 font-medium">
              {asset.variationName || asset.metadata?.variationName}
            </span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-white/50 uppercase font-medium">{asset.type}</span>
        </div>

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-all duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}>
          {/* Bottom actions bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-end justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onFavorite?.(asset); }}
                  className={`p-1.5 rounded-lg backdrop-blur-sm transition-all ${asset.favorited ? "bg-red-500/20 text-red-400" : "bg-black/40 text-white/60 hover:text-white hover:bg-white/10"}`}
                  title="Favorite"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={asset.favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                  disabled={downloading}
                  className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                  title="Download"
                >
                  {downloading ? (
                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  )}
                </button>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  title="More"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </button>

                {showMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#1a1a1e] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-scale-in">
                    {menuItems.map((item, i) =>
                      item.type === "divider" ? (
                        <div key={i} className="border-t border-white/[0.06] my-0.5" />
                      ) : (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); item.action(); }}
                          className={`w-full px-3 py-2 text-left text-[11px] flex items-center gap-2.5 transition-colors ${
                            "danger" in item && item.danger
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-60">
                            <path d={item.icon} />
                          </svg>
                          {item.label}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-white/60 truncate">{asset.title}</p>
          </div>
        </div>
      </div>

      {showShare && <ShareModal asset={asset} onClose={() => setShowShare(false)} />}
    </div>
  );
}
