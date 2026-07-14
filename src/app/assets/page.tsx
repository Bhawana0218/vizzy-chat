"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { GeneratedAsset } from "@/lib/types";

type FilterType = "all" | "image" | "poster" | "storyboard" | "moodboard" | "video";

export default function AssetsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("vizzy-chat-conversations");
      if (raw) {
        const convs = JSON.parse(raw);
        const allAssets: GeneratedAsset[] = [];
        for (const conv of convs) {
          for (const msg of conv.messages || []) {
            for (const asset of msg.assets || []) {
              allAssets.push({
                ...asset,
                createdAt: asset.createdAt || conv.createdAt,
              });
            }
          }
        }
        setAssets(allAssets.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
      }
    } catch { /* ok */ }
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return assets;
    return assets.filter((a) => a.type === filter);
  }, [assets, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: assets.length };
    for (const a of assets) c[a.type] = (c[a.type] || 0) + 1;
    return c;
  }, [assets]);

  if (loading || !user) return null;

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "image", label: "Images" },
    { key: "poster", label: "Posters" },
    { key: "storyboard", label: "Stories" },
    { key: "moodboard", label: "Boards" },
    { key: "video", label: "Video" },
  ];

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      <div className="ambient-bg" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 animate-fade-in">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 mb-4 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Chat
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">My Assets</h1>
              <p className="text-[14px] text-zinc-500">{assets.length} assets across all conversations</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none pb-1 animate-slide-up">
          {filters.map((f) => (
            counts[f.key] !== undefined && counts[f.key] > 0 ? (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all ${
                  filter === f.key
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/20"
                    : "text-zinc-500 hover:text-zinc-300 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
                }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-60">{counts[f.key]}</span>
              </button>
            ) : null
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zinc-700">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <p className="text-[14px] text-zinc-500 mb-1">No assets yet</p>
            <p className="text-[12px] text-zinc-700 mb-4">Start creating to build your collection</p>
            <button onClick={() => router.push("/")} className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors">
              Start Creating
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 animate-slide-up">
            {filtered.map((asset, i) => (
              <div
                key={asset.id}
                className="group rounded-2xl overflow-hidden border border-white/[0.05] bg-[#111113] hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/20 transition-all cursor-pointer"
                style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
                onMouseEnter={() => setHoveredId(asset.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => { localStorage.setItem("vizzy-chat-open-asset", JSON.stringify(asset)); router.push("/"); }}
              >
                <div className="aspect-square relative bg-[#1a1a1e]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${hoveredId === asset.id ? "opacity-100" : "opacity-0"}`} />
                  <div className="absolute top-2 right-2">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm text-white/60 uppercase font-medium">{asset.type}</span>
                  </div>
                  {asset.variationName && (
                    <div className="absolute top-2 left-2">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white/60">{asset.variationName}</span>
                    </div>
                  )}
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[11px] text-zinc-300 truncate font-medium">{asset.title}</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">{asset.width}x{asset.height}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
