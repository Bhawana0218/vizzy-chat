"use client";

import { useRef, useState } from "react";
import { GeneratedAsset } from "@/lib/types";
import AssetCard from "./AssetCard";

interface AssetGridProps {
  assets: GeneratedAsset[];
  onRegenerate?: (asset: GeneratedAsset) => void;
  onVariation?: (asset: GeneratedAsset) => void;
  onOpen?: (asset: GeneratedAsset) => void;
}

export default function AssetGrid({ assets, onRegenerate, onVariation, onOpen }: AssetGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  const multiple = assets.length > 1;

  return (
    <div className="relative mt-3">
      {canScrollLeft && multiple && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#1a1a1e]/90 border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#222226] transition-all shadow-lg backdrop-blur-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      {canScrollRight && multiple && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#1a1a1e]/90 border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#222226] transition-all shadow-lg backdrop-blur-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {assets.map((asset) => (
          <div key={asset.id} className="snap-start">
            <AssetCard
              asset={asset}
              onRegenerate={onRegenerate}
              onVariation={onVariation}
              onOpen={onOpen}
            />
          </div>
        ))}
      </div>

      {multiple && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {assets.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-zinc-700"
            />
          ))}
        </div>
      )}
    </div>
  );
}
