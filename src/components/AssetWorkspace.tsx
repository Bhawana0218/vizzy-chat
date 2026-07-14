"use client";

import { useState, useMemo } from "react";
import { GeneratedAsset } from "@/lib/types";
import { downloadAllImages } from "@/lib/download";

interface AssetWorkspaceProps {
  assets: GeneratedAsset[];
  onOpen: (asset: GeneratedAsset) => void;
  onCompare?: (assets: GeneratedAsset[]) => void;
  isOpen: boolean;
  onToggle: () => void;
}

type FilterType = "all" | "image" | "video" | "poster" | "moodboard" | "storyboard";

export default function AssetWorkspace({ assets, onOpen, onCompare, isOpen, onToggle }: AssetWorkspaceProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return assets;
    return assets.filter((a) => a.type === filter);
  }, [assets, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: assets.length };
    for (const a of assets) {
      c[a.type] = (c[a.type] || 0) + 1;
    }
    return c;
  }, [assets]);

  const handleBulkDownload = async () => {
    setBulkDownloading(true);
    setBulkProgress({ done: 0, total: assets.length });
    await downloadAllImages(
      assets.map((a) => ({ url: a.url, title: a.title })),
      "png",
      (done, total) => setBulkProgress({ done, total }),
    );
    setBulkDownloading(false);
    setBulkProgress(null);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "image", label: "Images" },
    { key: "video", label: "Video" },
    { key: "poster", label: "Posters" },
    { key: "moodboard", label: "Boards" },
    { key: "storyboard", label: "Stories" },
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm" onClick={onToggle} />
      )}
      <aside
        className={`
          fixed top-0 right-0 z-40 h-full w-[320px] bg-[#0a0a0d]/95 backdrop-blur-xl border-l border-white/[0.06]
          flex flex-col transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <h3 className="text-[13px] font-semibold text-zinc-200">Assets</h3>
            {assets.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-medium">{assets.length}</span>
            )}
          </div>
          <button onClick={onToggle} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-colors lg:hidden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          </button>
        </div>

        {assets.length > 0 && (
          <div className="flex items-center gap-1 px-3 py-2 border-b border-white/[0.04] overflow-x-auto scrollbar-none">
            {filters.map((f) => (
              counts[f.key] !== undefined && counts[f.key] > 0 ? (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`
                    shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-200
                    ${filter === f.key
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/20"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] border border-transparent"
                    }
                  `}
                >
                  {f.label}
                  <span className="ml-1 opacity-60">{counts[f.key]}</span>
                </button>
              ) : null
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <p className="text-[12px] text-zinc-600 mb-1">No assets yet</p>
              <p className="text-[11px] text-zinc-700">Generated assets will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {filtered.map((asset, i) => (
                <div
                  key={asset.id}
                  className="asset-card group rounded-xl overflow-hidden border border-white/[0.05] bg-white/[0.02] cursor-pointer animate-asset-in"
                  style={{ animationDelay: `${i * 50}ms` }}
                  onClick={() => onOpen(asset)}
                  onMouseEnter={() => setHoveredId(asset.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="aspect-square relative">
                    <AssetPlaceholder asset={asset} />
                    {hoveredId !== asset.id && (
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white/60 uppercase font-medium">
                          {asset.type}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-[11px] text-zinc-300 truncate font-medium">{asset.title}</p>
                    <p className="text-[10px] text-zinc-600 truncate mt-0.5">{asset.width}x{asset.height}</p>
                    {asset.variationName && (
                      <p className="text-[9px] text-violet-400/60 truncate mt-0.5">{asset.variationName}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {assets.length > 0 && (
          <div className="px-3 py-3 border-t border-white/[0.06] space-y-2">
            {assets.length >= 2 && onCompare && (
              <button
                onClick={() => onCompare(filtered.length >= 2 ? filtered : assets)}
                className="w-full py-2 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/20 text-[12px] text-violet-300 hover:text-violet-200 transition-all duration-200 font-medium flex items-center justify-center gap-1.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="8" height="18" rx="1"/><rect x="14" y="3" width="8" height="18" rx="1"/></svg>
                Compare Side by Side
              </button>
            )}
            <button
              onClick={handleBulkDownload}
              disabled={bulkDownloading}
              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.06] border border-white/[0.06] text-[12px] text-zinc-400 hover:text-zinc-200 transition-all duration-200 font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {bulkDownloading ? (
                <>
                  <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  Downloading {bulkProgress ? `${bulkProgress.done}/${bulkProgress.total}` : "..."}
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download All ({assets.length} assets)
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function AssetPlaceholder({ asset }: { asset: GeneratedAsset }) {
  const gradients: Record<string, string> = {
    image: "from-violet-900/60 via-purple-800/40 to-fuchsia-900/60",
    video: "from-blue-900/60 via-indigo-800/40 to-cyan-900/60",
    poster: "from-rose-900/60 via-pink-800/40 to-red-900/60",
    moodboard: "from-amber-900/60 via-orange-800/40 to-yellow-900/60",
    storyboard: "from-emerald-900/60 via-teal-800/40 to-green-900/60",
  };
  const gradient = gradients[asset.type] || gradients.image;

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        <p className="text-[9px] text-white/40 font-medium">{asset.title}</p>
      </div>
    </div>
  );
}
