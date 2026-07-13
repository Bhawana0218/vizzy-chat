"use client";

import { useState, useMemo } from "react";
import { Conversation, Workspace, ConversationFolder } from "@/lib/types";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  workspace: Workspace;
  onWorkspaceChange: (w: Workspace) => void;
  folders: ConversationFolder[];
  onNewFolder: () => void;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
}

function FolderIcon({ type, className }: { type: string; className?: string }) {
  const cls = className || "w-3.5 h-3.5";
  if (type === "briefcase") return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
  if (type === "heart") return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function Sidebar({
  conversations, activeId, onSelect, onNew, onDelete, onPin,
  isOpen, onToggle, workspace, onWorkspaceChange,
  folders, onRenameFolder,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["business", "personal"]));
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");

  const workspaceConversations = useMemo(
    () => conversations.filter((c) => c.workspace === workspace),
    [conversations, workspace]
  );

  const pinned = useMemo(
    () => workspaceConversations.filter((c) => c.pinned),
    [workspaceConversations]
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return workspaceConversations;
    const q = searchQuery.toLowerCase();
    return workspaceConversations.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [workspaceConversations, searchQuery]);

  const folderConversations = useMemo(() => {
    const map = new Map<string, Conversation[]>();
    for (const f of folders) map.set(f.id, []);
    const unassigned: Conversation[] = [];
    for (const c of filtered) {
      if (c.folderId && map.has(c.folderId)) {
        map.get(c.folderId)!.push(c);
      } else {
        unassigned.push(c);
      }
    }
    return { map, unassigned };
  }, [filtered, folders]);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDate = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm" onClick={onToggle} />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-[280px] bg-[#0a0a0d]/95 backdrop-blur-xl border-r border-white/[0.06]
          flex flex-col transition-transform duration-300 ease-out
          lg:relative lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-white tracking-tight">Vizzy</span>
          </div>
          <button onClick={onToggle} className="lg:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="px-3 py-2">
          <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.06] p-0.5">
            {(["personal", "business"] as Workspace[]).map((w) => (
              <button
                key={w}
                onClick={() => onWorkspaceChange(w)}
                className={`
                  flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 capitalize
                  ${workspace === w
                    ? "bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-white border border-violet-500/20 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                  }
                `}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        {/* New conversation + Search */}
        <div className="px-3 space-y-2">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] hover:border-violet-500/30 bg-white/[0.03] hover:bg-violet-500/[0.06] text-zinc-300 hover:text-white text-[13px] font-medium transition-all duration-200 group btn-press"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 group-hover:text-violet-400 transition-colors">
              <path d="M12 5v14" /><path d="M5 12h14" />
            </svg>
            New conversation
          </button>
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[12px] text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-violet-500/30 transition-colors"
            />
          </div>
        </div>

        {/* Conversations */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 mt-2">
          {filtered.length === 0 && !searchQuery ? (
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
            <div className="space-y-1">
              {/* Pinned */}
              {pinned.length > 0 && !searchQuery && (
                <>
                  <p className="text-[10px] font-medium text-zinc-700 uppercase tracking-wider px-3 mb-1 mt-1 flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 2l-4 4-4-1-3 3 4 4-4 4h6l8-8-3-3-4 4-4-4z"/></svg>
                    Pinned
                  </p>
                  {pinned.map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={activeId === conv.id}
                      isHovered={hoveredId === conv.id}
                      onHover={setHoveredId}
                      onSelect={onSelect}
                      onDelete={onDelete}
                      onPin={onPin}
                      formatDate={formatDate}
                    />
                  ))}
                  <div className="h-px bg-white/[0.04] mx-3 my-2" />
                </>
              )}

              {/* Folders */}
              {!searchQuery && folders.map((folder) => {
                const folderConvs = folderConversations.map.get(folder.id) || [];
                const isExpanded = expandedFolders.has(folder.id);
                return (
                  <div key={folder.id}>
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      <span className={folder.color}><FolderIcon type={folder.icon} /></span>
                      {editingFolderId === folder.id ? (
                        <input
                          autoFocus
                          value={editingFolderName}
                          onChange={(e) => setEditingFolderName(e.target.value)}
                          onBlur={() => { onRenameFolder(folder.id, editingFolderName); setEditingFolderId(null); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { onRenameFolder(folder.id, editingFolderName); setEditingFolderId(null); } }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-transparent border-b border-violet-500/30 text-zinc-200 outline-none px-1 text-[11px]"
                        />
                      ) : (
                        <span className="flex-1 text-left">{folder.name}</span>
                      )}
                      <span className="text-[10px] text-zinc-700">{folderConvs.length}</span>
                    </button>
                    {isExpanded && (
                      <div className="space-y-0.5 ml-2">
                        {folderConvs.map((conv) => (
                          <ConversationItem
                            key={conv.id}
                            conv={conv}
                            isActive={activeId === conv.id}
                            isHovered={hoveredId === conv.id}
                            onHover={setHoveredId}
                            onSelect={onSelect}
                            onDelete={onDelete}
                            onPin={onPin}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Unassigned / search results */}
              {(searchQuery ? filtered : folderConversations.unassigned).map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={activeId === conv.id}
                  isHovered={hoveredId === conv.id}
                  onHover={setHoveredId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onPin={onPin}
                  formatDate={formatDate}
                />
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
              <p className="text-[12px] font-medium text-zinc-200 truncate capitalize">{workspace} workspace</p>
              <p className="text-[11px] text-zinc-600 truncate">{workspaceConversations.length} conversations</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function ConversationItem({
  conv, isActive, isHovered, onHover, onSelect, onDelete, onPin, formatDate,
}: {
  conv: Conversation;
  isActive: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  onPin?: (id: string) => void;
  formatDate: (d: Date) => string;
}) {
  return (
    <div
      onMouseEnter={() => onHover(conv.id)}
      onMouseLeave={() => onHover(null)}
      className={`
        relative flex items-center rounded-xl text-[13px] transition-all duration-150 group cursor-pointer
        ${isActive ? "bg-white/[0.08] text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"}
      `}
    >
      <button onClick={() => onSelect(conv.id)} className="flex-1 flex items-center gap-2.5 px-3 py-2 text-left min-w-0">
        {conv.pinned ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="shrink-0 text-violet-400">
            <path d="M16 2l-4 4-4-1-3 3 4 4-4 4h6l8-8-3-3-4 4-4-4z"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${isActive ? "text-violet-400" : "text-zinc-600 group-hover:text-zinc-400"}`}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
        <span className="truncate flex-1">{conv.title}</span>
        <span className="text-[10px] text-zinc-600 shrink-0">{formatDate(conv.updatedAt)}</span>
      </button>

      {isHovered && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          {onPin && (
            <button
              onClick={(e) => { e.stopPropagation(); onPin(conv.id); }}
              className={`p-1 rounded-md transition-colors ${conv.pinned ? "text-violet-400 hover:text-violet-300" : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.06]"}`}
              title={conv.pinned ? "Unpin" : "Pin"}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill={conv.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 2l-4 4-4-1-3 3 4 4-4 4h6l8-8-3-3-4 4-4-4z"/>
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
              className="p-1 rounded-md hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
