"use client";

import { useEffect, useCallback } from "react";
import { GeneratedAsset } from "@/lib/types";

interface CanvasModalProps {
  asset: GeneratedAsset | null;
  onClose: () => void;
  onDownload?: (asset: GeneratedAsset) => void;
  onRegenerate?: (asset: GeneratedAsset) => void;
  onVariation?: (asset: GeneratedAsset) => void;
}

export default function CanvasModal({ asset, onClose, onDownload, onRegenerate, onVariation }: CanvasModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
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

  if (!asset) return null;

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

  const bg = gradients[asset.title] || gradients["Serenity"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-4xl mx-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-semibold text-white">{asset.title}</h2>
            <p className="text-[13px] text-zinc-500 mt-0.5">{asset.type.toUpperCase()} &middot; {asset.width}&times;{asset.height}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Canvas area */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111113]" style={{ aspectRatio: asset.type === "video" ? "16/9" : "1/1" }}>
          <div className="absolute inset-0" style={{ background: bg }} />

          {/* Canvas tools */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {[
              { icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z", label: "Edit" },
              { icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15", label: "Inpaint" },
              { icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", label: "Recolor" },
            ].map((tool) => (
              <button
                key={tool.label}
                title={tool.label}
                className="w-9 h-9 rounded-xl bg-black/50 backdrop-blur-sm border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={tool.icon}/></svg>
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/50 backdrop-blur-sm border border-white/[0.08] rounded-xl px-2 py-1">
            <button className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
            <span className="text-[11px] text-zinc-500 px-2 min-w-[36px] text-center">100%</span>
            <button className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRegenerate?.(asset)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-[13px] text-zinc-300 hover:text-white transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
              Regenerate
            </button>
            <button
              onClick={() => onVariation?.(asset)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-[13px] text-zinc-300 hover:text-white transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>
              Variation
            </button>
            <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-[13px] text-zinc-300 hover:text-white transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Edit in Canvas
            </button>
          </div>
          <button
            onClick={() => onDownload?.(asset)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-all shadow-lg shadow-violet-500/20"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
