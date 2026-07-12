"use client";

import { useState } from "react";

interface SidebarProps {
  conversations: { id: string; title: string; updatedAt: Date }[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const grouped = groupByDate(conversations);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-[280px] bg-[#0d0d0f] border-r border-white/[0.06]
          flex flex-col transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-white tracking-tight">Vizzy Chat</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* New conversation button */}
        <div className="px-3 py-2">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.08] hover:border-violet-500/30 bg-white/[0.03] hover:bg-violet-500/[0.06] text-zinc-300 hover:text-white text-[13px] font-medium transition-all duration-200 group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-violet-400 transition-colors">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            New conversation
          </button>
        </div>

        {/* Conversations list */}
        <nav className="flex-1 overflow-y-auto px-3 py-1">
          {conversations.length === 0 ? (
            <div className="px-3 py-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-[12px] text-zinc-600 mb-1">No conversations yet</p>
              <p className="text-[11px] text-zinc-700">Start creating to see history</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(grouped).map(([label, convs]) => (
                <div key={label}>
                  <p className="text-[10px] font-medium text-zinc-700 uppercase tracking-wider px-3 mb-1">{label}</p>
                  <div className="space-y-0.5">
                    {convs.map((conv) => (
                      <div
                        key={conv.id}
                        onMouseEnter={() => setHoveredId(conv.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={`
                          relative flex items-center rounded-xl text-[13px] transition-all duration-150 group cursor-pointer
                          ${
                            activeId === conv.id
                              ? "bg-white/[0.08] text-white"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                          }
                        `}
                      >
                        <button
                          onClick={() => onSelect(conv.id)}
                          className="flex-1 flex items-center gap-2.5 px-3 py-2 text-left min-w-0"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${activeId === conv.id ? "text-violet-400" : "text-zinc-600 group-hover:text-zinc-400"}`}>
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <span className="truncate flex-1">{conv.title}</span>
                          <span className="text-[11px] text-zinc-600 shrink-0">
                            {formatDate(conv.updatedAt)}
                          </span>
                        </button>

                        {hoveredId === conv.id && onDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(conv.id);
                            }}
                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-[11px] font-semibold text-white shadow-md shadow-violet-500/20">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-zinc-200 truncate">Creator Plan</p>
              <p className="text-[11px] text-zinc-600 truncate">847 / 1,000 credits</p>
            </div>
            <button className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function groupByDate(conversations: { id: string; title: string; updatedAt: Date }[]): Record<string, typeof conversations> {
  const now = new Date();
  const groups: Record<string, typeof conversations> = {};

  for (const conv of conversations) {
    const diff = now.getTime() - conv.updatedAt.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    let label: string;
    if (days === 0) label = "Today";
    else if (days === 1) label = "Yesterday";
    else if (days < 7) label = "This Week";
    else if (days < 30) label = "This Month";
    else label = "Older";

    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  return groups;
}
