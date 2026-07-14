"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface BrandSettings {
  brandName: string;
  brandColors: string[];
  brandValues: string[];
  toneOfVoice: string;
  industry: string;
  targetAudience: string;
  logoDescription: string;
}

const DEFAULT_SETTINGS: BrandSettings = {
  brandName: "",
  brandColors: ["#7c3aed", "#d946ef"],
  brandValues: [],
  toneOfVoice: "professional",
  industry: "",
  targetAudience: "",
  logoDescription: "",
};

const TONE_OPTIONS = ["professional", "casual", "playful", "luxurious", "bold", "minimal", "warm", "edgy"];
const INDUSTRY_OPTIONS = ["Food & Beverage", "Fashion", "Technology", "Health & Wellness", "Real Estate", "Education", "Entertainment", "Retail", "Hospitality", "Art & Design", "Other"];

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<BrandSettings>(DEFAULT_SETTINGS);
  const [newColor, setNewColor] = useState("#7c3aed");
  const [newValue, setNewValue] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("vizzy-chat-brand-settings");
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch { /* ok */ }
  }, []);

  const handleSave = () => {
    try { localStorage.setItem("vizzy-chat-brand-settings", JSON.stringify(settings)); } catch { /* ok */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addColor = () => {
    if (newColor && settings.brandColors.length < 6) {
      setSettings((s) => ({ ...s, brandColors: [...s.brandColors, newColor] }));
    }
  };

  const removeColor = (idx: number) => {
    setSettings((s) => ({ ...s, brandColors: s.brandColors.filter((_, i) => i !== idx) }));
  };

  const addValue = () => {
    if (newValue.trim() && settings.brandValues.length < 8) {
      setSettings((s) => ({ ...s, brandValues: [...s.brandValues, newValue.trim()] }));
      setNewValue("");
    }
  };

  const removeValue = (idx: number) => {
    setSettings((s) => ({ ...s, brandValues: s.brandValues.filter((_, i) => i !== idx) }));
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#06060a] text-white">
      <div className="ambient-bg" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-fade-in">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 mb-4 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Chat
          </button>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Brand Settings</h1>
          <p className="text-[14px] text-zinc-500">Set your brand identity for AI-generated content.</p>
        </div>

        <div className="space-y-6">
          {/* Brand Name */}
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.06] animate-slide-up">
            <label className="text-[12px] font-semibold text-zinc-300 uppercase tracking-wider">Brand Name</label>
            <input
              type="text"
              value={settings.brandName}
              onChange={(e) => setSettings((s) => ({ ...s, brandName: e.target.value }))}
              placeholder="Your brand name"
              className="w-full mt-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-violet-500/30 transition-colors"
            />
          </div>

          {/* Brand Colors */}
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.06] animate-slide-up" style={{ animationDelay: "50ms" }}>
            <label className="text-[12px] font-semibold text-zinc-300 uppercase tracking-wider">Brand Colors</label>
            <p className="text-[11px] text-zinc-600 mt-1 mb-3">These colors will influence AI-generated visuals</p>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {settings.brandColors.map((color, i) => (
                <div key={i} className="relative group">
                  <div className="w-10 h-10 rounded-xl border border-white/[0.1] shadow-lg" style={{ backgroundColor: color }} />
                  <button
                    onClick={() => removeColor(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-800 border border-white/[0.1] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
              {settings.brandColors.length < 6 && (
                <div className="flex items-center gap-2">
                  <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border-0" />
                  <button onClick={addColor} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[11px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors">
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Brand Values */}
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.06] animate-slide-up" style={{ animationDelay: "100ms" }}>
            <label className="text-[12px] font-semibold text-zinc-300 uppercase tracking-wider">Brand Values</label>
            <p className="text-[11px] text-zinc-600 mt-1 mb-3">Core values that define your brand personality</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.brandValues.map((val, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-300 text-[12px] font-medium">
                  {val}
                  <button onClick={() => removeValue(i)} className="text-violet-400/60 hover:text-violet-300 transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addValue(); }}
                placeholder="e.g. Sustainability, Innovation, Trust..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[12px] text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-violet-500/30 transition-colors"
              />
              <button onClick={addValue} className="px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[12px] text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Tone of Voice */}
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.06] animate-slide-up" style={{ animationDelay: "150ms" }}>
            <label className="text-[12px] font-semibold text-zinc-300 uppercase tracking-wider">Tone of Voice</label>
            <div className="flex flex-wrap gap-2 mt-3">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSettings((s) => ({ ...s, toneOfVoice: tone }))}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all capitalize ${
                    settings.toneOfVoice === tone
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : "bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:text-zinc-300 hover:bg-white/[0.06]"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Industry */}
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.06] animate-slide-up" style={{ animationDelay: "200ms" }}>
            <label className="text-[12px] font-semibold text-zinc-300 uppercase tracking-wider">Industry</label>
            <div className="flex flex-wrap gap-2 mt-3">
              {INDUSTRY_OPTIONS.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setSettings((s) => ({ ...s, industry: ind }))}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all ${
                    settings.industry === ind
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : "bg-white/[0.04] text-zinc-500 border border-white/[0.06] hover:text-zinc-300 hover:bg-white/[0.06]"
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.06] animate-slide-up" style={{ animationDelay: "250ms" }}>
            <label className="text-[12px] font-semibold text-zinc-300 uppercase tracking-wider">Target Audience</label>
            <textarea
              value={settings.targetAudience}
              onChange={(e) => setSettings((s) => ({ ...s, targetAudience: e.target.value }))}
              placeholder="e.g. Young professionals aged 25-35 who value sustainability..."
              rows={3}
              className="w-full mt-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-violet-500/30 transition-colors resize-none"
            />
          </div>

          {/* Logo Description */}
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.06] animate-slide-up" style={{ animationDelay: "300ms" }}>
            <label className="text-[12px] font-semibold text-zinc-300 uppercase tracking-wider">Logo Description</label>
            <p className="text-[11px] text-zinc-600 mt-1 mb-2">Describe your logo for AI to incorporate it</p>
            <textarea
              value={settings.logoDescription}
              onChange={(e) => setSettings((s) => ({ ...s, logoDescription: e.target.value }))}
              placeholder="e.g. Minimalist mountain icon in deep purple..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[13px] text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-violet-500/30 transition-colors resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end animate-slide-up" style={{ animationDelay: "350ms" }}>
            <button
              onClick={handleSave}
              className={`px-6 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                saved
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25"
              }`}
            >
              {saved ? "Saved!" : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
