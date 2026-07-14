"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function Avatar({ src, alt, className }: { src: string | null; alt: string; className: string }) {
  if (src) {
    return <Image src={src} alt={alt} fill unoptimized className={className + " object-cover"} />;
  }
  return null;
}

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
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
            <button onClick={() => { setIsOpen(false); router.push("/dashboard"); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              <span className="flex-1 text-left">Dashboard</span>
            </button>
            <button onClick={() => { setIsOpen(false); router.push("/assets"); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span className="flex-1 text-left">My Assets</span>
            </button>
            <button onClick={() => { setIsOpen(false); router.push("/settings"); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span className="flex-1 text-left">Brand Settings</span>
            </button>
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
