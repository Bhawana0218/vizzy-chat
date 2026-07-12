"use client";

import { useState } from "react";
import { GeneratedAsset } from "@/lib/types";

interface AssetCardProps {
  asset: GeneratedAsset;
  onRegenerate?: (asset: GeneratedAsset) => void;
  onVariation?: (asset: GeneratedAsset) => void;
  onOpen?: (asset: GeneratedAsset) => void;
}

export default function AssetCard({ asset, onRegenerate, onVariation, onOpen }: AssetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const getPlaceholderStyle = (asset: GeneratedAsset) => {
    const gradients: Record<string, string> = {
      "Hero Shot": "linear-gradient(135deg, #1a1612 0%, #3d2e1a 30%, #1a1612 60%, #0d0a07 100%)",
      "Lifestyle": "linear-gradient(135deg, #1c1917 0%, #44403c 40%, #292524 70%, #0c0a09 100%)",
      "Detail": "linear-gradient(135deg, #292524 0%, #57534e 30%, #292524 60%, #1c1917 100%)",
      "Oil Painting": "linear-gradient(135deg, #422006 0%, #92400e 30%, #78350f 60%, #451a03 100%)",
      "Baroque Style": "linear-gradient(135deg, #1c1917 0%, #713f12 40%, #292524 70%, #0c0a09 100%)",
      "Serenity": "linear-gradient(135deg, #1e1b4b 0%, #4338ca 30%, #3730a3 60%, #1e1b4b 100%)",
      "Reflection": "linear-gradient(135deg, #1e3a5f 0%, #1e40af 40%, #3730a3 70%, #1e1b4b 100%)",
      "Inner Peace": "linear-gradient(135deg, #2e1065 0%, #7c3aed 30%, #6d28d9 60%, #1e1b4b 100%)",
      "Contemplation": "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1e40af 70%, #1e1b4b 100%)",
      "Career Goals": "linear-gradient(135deg, #4c0519 0%, #be123c 30%, #9f1239 60%, #881337 100%)",
      "Health & Wellness": "linear-gradient(135deg, #064e3b 0%, #059669 30%, #047857 60%, #064e3b 100%)",
      "Financial Growth": "linear-gradient(135deg, #451a03 0%, #d97706 30%, #b45309 60%, #451a03 100%)",
      "Personal Growth": "linear-gradient(135deg, #1e3a5f 0%, #2563eb 30%, #1d4ed8 60%, #1e3a5f 100%)",
      "Travel Dreams": "linear-gradient(135deg, #2e1065 0%, #7c3aed 30%, #6d28d9 60%, #2e1065 100%)",
      "Family & Home": "linear-gradient(135deg, #042f2e 0%, #0d9488 30%, #0f766e 60%, #042f2e 100%)",
      "The Dream Portal": "linear-gradient(135deg, #0c0a30 0%, #4c1d95 30%, #7c3aed 60%, #1e1b4b 100%)",
      "Ethereal Passage": "linear-gradient(135deg, #1a0533 0%, #a21caf 30%, #7c3aed 60%, #0c0a30 100%)",
      "Dream Realm": "linear-gradient(135deg, #0a1628 0%, #1e40af 30%, #4338ca 60%, #1e1b4b 100%)",
      "Chapter 1: The Meadow": "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 30%, #7dd3fc 60%, #0284c7 100%)",
      "Chapter 2: The Forest": "linear-gradient(135deg, #059669 0%, #34d399 30%, #6ee7b7 60%, #047857 100%)",
      "Chapter 3: The Mountain": "linear-gradient(135deg, #d97706 0%, #fbbf24 30%, #fde68a 60%, #b45309 100%)",
      "Premium Sale Banner": "linear-gradient(135deg, #991b1b 0%, #dc2626 30%, #b91c1c 60%, #7f1d1d 100%)",
      "Seasonal Offer": "linear-gradient(135deg, #92400e 0%, #f59e0b 30%, #d97706 60%, #78350f 100%)",
      "Winter Elegance": "linear-gradient(135deg, #dbeafe 0%, #93c5fd 30%, #bfdbfe 60%, #60a5fa 100%)",
      "Frost Collection": "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 30%, #cbd5e1 60%, #64748b 100%)",
      "Holiday Warmth": "linear-gradient(135deg, #ccfbf1 0%, #5eead4 30%, #99f6e4 60%, #2dd4bf 100%)",
      "Brand Essence": "linear-gradient(135deg, #2e1065 0%, #7c3aed 30%, #5b21b6 60%, #2e1065 100%)",
      "Core Values": "linear-gradient(135deg, #1e3a5f 0%, #2563eb 30%, #1d4ed8 60%, #1e3a5f 100%)",
      "Minimalist": "linear-gradient(135deg, #e7e5e4 0%, #d6d3d1 30%, #f5f5f4 60%, #e7e5e4 100%)",
      "Bold Dark": "linear-gradient(135deg, #1e1b4b 0%, #4338ca 30%, #3730a3 60%, #1e1b4b 100%)",
    };

    return {
      background: gradients[asset.title] || gradients["Serenity"],
      aspectRatio: asset.type === "video" ? "16/9" : "1/1",
    };
  };

  const style = getPlaceholderStyle(asset);
  const isVideo = asset.type === "video";

  return (
    <div
      className="group relative flex-shrink-0 w-[240px] md:w-[280px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
    >
      <div
        className="relative rounded-2xl overflow-hidden border border-white/[0.06] bg-[#111113] cursor-pointer hover:border-white/[0.12] transition-all duration-200 hover:shadow-xl hover:shadow-black/20"
        style={{ aspectRatio: style.aspectRatio }}
        onClick={() => onOpen?.(asset)}
      >
        <div className="absolute inset-0" style={{ background: style.background }} />

        {/* Decorative content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          {isVideo && (
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          )}
          {!isVideo && (
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          )}
        </div>

        {/* Hover overlay with actions */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
            <span className="text-[11px] font-medium text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
              {asset.title}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                className={`p-1.5 rounded-lg backdrop-blur-sm transition-colors ${isLiked ? "bg-red-500/20 text-red-400" : "bg-black/40 text-white/70 hover:text-white"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                  className="p-1.5 rounded-lg bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute bottom-full right-0 mb-1 w-40 bg-[#1a1a1e] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden z-50">
                    <button
                      onClick={(e) => { e.stopPropagation(); onRegenerate?.(asset); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-[12px] text-zinc-300 hover:bg-white/[0.06] hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2v6h-6" />
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                        <path d="M3 22v-6h6" />
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                      </svg>
                      Regenerate
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onVariation?.(asset); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-[12px] text-zinc-300 hover:bg-white/[0.06] hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="8" height="8" rx="1" />
                        <rect x="14" y="2" width="8" height="8" rx="1" />
                        <rect x="2" y="14" width="8" height="8" rx="1" />
                        <rect x="14" y="14" width="8" height="8" rx="1" />
                      </svg>
                      Create variation
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-[12px] text-zinc-300 hover:bg-white/[0.06] hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </button>
                    <div className="border-t border-white/[0.06]" />
                    <button
                      className="w-full px-3 py-2 text-left text-[12px] text-zinc-300 hover:bg-white/[0.06] hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Open in canvas
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
