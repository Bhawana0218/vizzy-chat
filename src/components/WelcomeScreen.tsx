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
      <div className="text-center mb-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/20">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-white mb-3 tracking-tight">
          What shall we create?
        </h1>
        <p className="text-[15px] text-zinc-500 max-w-md mx-auto leading-relaxed">
          Describe any visual, artwork, campaign, or creative project.
          Vizzy handles the rest.
        </p>
      </div>

      <div className="w-full space-y-6">
        <div>
          <h3 className="text-[12px] font-medium text-zinc-600 uppercase tracking-wider mb-3 px-1">
            Personal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {homePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onPromptSelect(prompt.text)}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] text-left text-[13px] text-zinc-400 hover:text-zinc-200 transition-all duration-200"
              >
                <span className="text-lg">{prompt.icon}</span>
                <span className="flex-1 leading-snug">{prompt.text}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 group-hover:text-zinc-500 shrink-0 transition-colors">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[12px] font-medium text-zinc-600 uppercase tracking-wider mb-3 px-1">
            Business
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {businessPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onPromptSelect(prompt.text)}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1] text-left text-[13px] text-zinc-400 hover:text-zinc-200 transition-all duration-200"
              >
                <span className="text-lg">{prompt.icon}</span>
                <span className="flex-1 leading-snug">{prompt.text}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700 group-hover:text-zinc-500 shrink-0 transition-colors">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
