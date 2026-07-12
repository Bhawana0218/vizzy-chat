"use client";

import { useState } from "react";

interface CreditsBadgeProps {
  credits: number;
  maxCredits: number;
  plan: string;
}

export default function CreditsBadge({ credits, maxCredits, plan }: CreditsBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const percentage = (credits / maxCredits) * 100;
  const isLow = percentage < 25;

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
        <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLow ? "bg-red-400" : "bg-gradient-to-r from-violet-500 to-fuchsia-500"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className={`text-[11px] font-medium ${isLow ? "text-red-400" : "text-zinc-400"}`}>
          {credits.toLocaleString()}
        </span>
      </button>

      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-[#1a1a1e] border border-white/[0.08] rounded-xl shadow-2xl p-4 z-50 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-zinc-300">{plan} Plan</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 font-medium">Active</span>
          </div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-semibold text-white">{credits.toLocaleString()}</span>
            <span className="text-[12px] text-zinc-500">/ {maxCredits.toLocaleString()} credits</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${isLow ? "bg-red-400" : "bg-gradient-to-r from-violet-500 to-fuchsia-500"}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <button className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[12px] font-medium transition-colors">
            Upgrade Plan
          </button>
        </div>
      )}
    </div>
  );
}
