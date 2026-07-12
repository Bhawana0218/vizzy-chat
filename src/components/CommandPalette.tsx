"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  commands: Command[];
}

export default function CommandPalette({ commands }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  };

  const handleKeyDownInPalette = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      filtered[selectedIndex].action();
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="relative w-full max-w-lg mx-4 bg-[#141416] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center gap-3 px-4 border-b border-white/[0.06]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500 shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDownInPalette}
            placeholder="Type a command..."
            className="flex-1 py-3.5 bg-transparent text-[14px] text-zinc-100 placeholder:text-zinc-600 outline-none"
          />
          <kbd className="text-[10px] text-zinc-600 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded-md font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-64 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-[13px] text-zinc-600">No commands found</div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action();
                  setIsOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  i === selectedIndex ? "bg-white/[0.06] text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span className="text-zinc-500">{cmd.icon}</span>
                <span className="flex-1 text-[13px]">{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd className="text-[10px] text-zinc-600 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded-md font-mono">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
