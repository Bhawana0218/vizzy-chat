"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface Stats {
  totalConversations: number;
  totalAssets: number;
  totalCreditsUsed: number;
  favoriteAssets: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ totalConversations: 0, totalAssets: 0, totalCreditsUsed: 0, favoriteAssets: 0 });

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

useEffect(() => {
    try {
      const userId = user?.id || user?.email;
      const safeId = userId ? userId.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() : "";
      const key = safeId ? `vizzy-chat-conversations-${safeId}` : "vizzy-chat-conversations";
      const raw = localStorage.getItem(key);
      if (raw) {
        const convs = JSON.parse(raw);
        const totalAssets = convs.reduce((sum: number, c: { messages?: { assets?: unknown[] }[] }) => sum + (c.messages?.reduce((s: number, m: { assets?: unknown[] }) => s + (m.assets?.length || 0), 0) || 0), 0);
        setStats({
          totalConversations: convs.length,
          totalAssets,
          totalCreditsUsed: totalAssets * 5,
          favoriteAssets: 0,
        });
      }
    } catch { /* ok */ }
  }, [user]);

  if (loading || !user) return null;

  const statCards = [
    { label: "Conversations", value: stats.totalConversations, icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", color: "from-violet-500 to-fuchsia-500" },
    { label: "Assets Created", value: stats.totalAssets, icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8", color: "from-blue-500 to-cyan-500" },
    { label: "Credits Used", value: stats.totalCreditsUsed, icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6", color: "from-amber-500 to-orange-500" },
    { label: "Favorites", value: stats.favoriteAssets, icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", color: "from-rose-500 to-pink-500" },
  ];

  const quickActions = [
    { label: "Luxury Product Ad", prompt: "Create a luxury product ad for Instagram", icon: "M3 3h18v18H3z M12 8v8 M8 12h8" },
    { label: "Vision Board", prompt: "Create a vision board with my goals for the next 3 years", icon: "M2 2h8v8H2z M14 2h8v8h-8z M2 14h8v8H2z M14 14h8v8h-8z" },
    { label: "Quote Poster", prompt: "Design a quote poster for my living room", icon: "M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" },
    { label: "Story for Kids", prompt: "Generate a children's story about a brave little fox, visualize it scene by scene", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" },
  ];

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      <div className="ambient-bg" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 mb-4 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Chat
          </button>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Dashboard</h1>
          <p className="text-[14px] text-zinc-500">Welcome back, {user.name || "Creator"}. Here&apos;s your creative overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 animate-slide-up">
          {statCards.map((card) => (
            <div key={card.label} className="p-4 rounded-2xl bg-[#111113] border border-white/[0.06] hover:border-white/[0.1] transition-all">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 shadow-lg`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={card.icon}/></svg>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-[12px] text-zinc-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <h2 className="text-[13px] font-semibold text-zinc-300 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => { localStorage.setItem("vizzy-chat-quick-prompt", action.prompt); router.push("/"); }}
                className="p-4 rounded-xl bg-[#111113] border border-white/[0.06] hover:border-violet-500/30 hover:bg-violet-500/[0.04] text-left transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] group-hover:bg-violet-500/15 flex items-center justify-center mb-2 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-violet-400 transition-colors"><path d={action.icon}/></svg>
                </div>
                <p className="text-[12px] font-medium text-zinc-300 group-hover:text-white transition-colors">{action.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Plan & Usage */}
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-[13px] font-semibold text-zinc-300 mb-3">Account</h2>
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[14px] font-medium text-white capitalize">{user.plan} Plan</p>
                <p className="text-[12px] text-zinc-500">{user.credits.toLocaleString()} credits remaining</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors shadow-lg shadow-violet-500/25">
                Upgrade Plan
              </button>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500" style={{ width: `${(user.credits / 1000) * 100}%` }} />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-zinc-600">0</span>
              <span className="text-[10px] text-zinc-600">1,000 credits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
