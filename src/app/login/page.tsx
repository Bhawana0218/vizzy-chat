"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/30">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight mb-2">
            Welcome to Vizzy Chat
          </h1>
          <p className="text-[15px] text-zinc-500 leading-relaxed">
            The conversational operating system for creativity.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-8 shadow-2xl">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-[14px] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {isLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-3 bg-[#111113] text-zinc-600">or</span>
            </div>
          </div>

          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-500 text-[14px] font-medium cursor-not-allowed opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 6L2 7" />
            </svg>
            Microsoft Login (Coming Soon)
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[12px] text-zinc-700 leading-relaxed">
            By continuing, you agree to Vizzy Chat&apos;s{" "}
            <span className="text-zinc-500 cursor-pointer hover:underline">Terms of Service</span>
            {" "}and{" "}
            <span className="text-zinc-500 cursor-pointer hover:underline">Privacy Policy</span>.
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-10 grid grid-cols-3 gap-3">
          {[
            { icon: "\uD83C\uDFA8", label: "Create" },
            { icon: "\uD83D\uDD04", label: "Iterate" },
            { icon: "\uD83D\uDCE4", label: "Deploy" },
          ].map((f) => (
            <div key={f.label} className="text-center py-3 rounded-xl border border-white/[0.04] bg-white/[0.01]">
              <div className="text-lg mb-1">{f.icon}</div>
              <div className="text-[11px] text-zinc-600 font-medium">{f.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
