"use client";

import { SUGGESTED_PROMPTS } from "@/lib/mock-data";

interface WelcomeScreenProps {
  onPromptSelect: (prompt: string) => void;
}

export default function WelcomeScreen({ onPromptSelect }: WelcomeScreenProps) {
  const homePrompts = SUGGESTED_PROMPTS.filter((p) => p.category === "home");
  const businessPrompts = SUGGESTED_PROMPTS.filter((p) => p.category === "business");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-3xl mx-auto w-full">
      <div className="text-center mb-14 animate-fade-in">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-xl opacity-30 animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          What shall we <span className="gradient-text">create</span>?
        </h1>
        <p className="text-[15px] text-zinc-500 max-w-lg mx-auto leading-relaxed">
          Describe any visual, artwork, campaign, or creative project.
          Vizzy transforms your words into stunning visual assets.
        </p>
      </div>

      <div className="w-full space-y-8 animate-slide-up">
        <div>
          <h3 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-3 px-1">Personal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {homePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onPromptSelect(prompt.text)}
                className="group flex items-center gap-3 px-4 py-3.5 rounded-xl glass-card text-left text-[13px] text-zinc-400 hover:text-zinc-200 btn-press"
              >
                <span className="text-lg">{prompt.icon}</span>
                <span className="flex-1 leading-snug">{prompt.text}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 group-hover:text-zinc-500 shrink-0 transition-colors group-hover:translate-x-0.5 duration-200">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-3 px-1">Business</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {businessPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onPromptSelect(prompt.text)}
                className="group flex items-center gap-3 px-4 py-3.5 rounded-xl glass-card text-left text-[13px] text-zinc-400 hover:text-zinc-200 btn-press"
              >
                <span className="text-lg">{prompt.icon}</span>
                <span className="flex-1 leading-snug">{prompt.text}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 group-hover:text-zinc-500 shrink-0 transition-colors group-hover:translate-x-0.5 duration-200">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-zinc-700 mt-10 text-center">
        Drag & drop images, use voice, or just type to get started
      </p>
    </div>
  );
}
