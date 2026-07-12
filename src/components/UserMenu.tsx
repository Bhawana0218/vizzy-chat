"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";

function Avatar({ src, alt, className }: { src: string | null; alt: string; className: string }) {
  if (src) {
    return <Image src={src} alt={alt} fill unoptimized className={className + " object-cover"} />;
  }
  return null;
}

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
    : user.email[0].toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 transition-shadow overflow-hidden relative"
      >
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt={user.name || ""} width={32} height={32} unoptimized className="w-full h-full object-cover rounded-full" />
        ) : initials}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[#141416] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-in">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[13px] font-bold text-white overflow-hidden relative shrink-0">
                {user.avatarUrl ? (
                  <Avatar src={user.avatarUrl} alt="" className="w-full h-full rounded-full" />
                ) : initials}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-zinc-200 truncate">{user.name || "User"}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-zinc-400">Plan</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 font-medium capitalize">{user.plan}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-zinc-400">Credits</span>
              <span className="text-[12px] text-zinc-300 font-medium">{user.credits.toLocaleString()}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden mt-2">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${(user.credits / 1000) * 100}%` }} />
            </div>
          </div>

          <div className="p-1.5">
            {[
              { icon: "M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5", label: "Dashboard" },
              { icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8", label: "My Assets" },
              { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", label: "API Access", badge: "Soon" },
            ].map((item) => (
              <button key={item.label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon}/></svg>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-zinc-600 font-medium">{item.badge}</span>}
              </button>
            ))}
          </div>

          <div className="border-t border-white/[0.06] p-1.5">
            <button onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
