"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Message, Conversation, GeneratedAsset, MessageAttachment, Workspace, ConversationFolder, GenerationStage, VoiceData } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { sendChatMessage } from "@/lib/api";
import { enhancePrompt, getMockResponseForIntent } from "@/lib/ai/prompt-engine";
import { getMockResponse, buildAssets } from "@/lib/mock-data";
import Sidebar from "@/components/Sidebar";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import AssetWorkspace from "@/components/AssetWorkspace";
import CanvasModal from "@/components/CanvasModal";
import CreditsBadge from "@/components/CreditsBadge";
import CommandPalette from "@/components/CommandPalette";
import UserMenu from "@/components/UserMenu";
import { ToastProvider, useToast } from "@/components/Toast";
import LoginPage from "@/app/login/page";

const API_TIMEOUT = 30000;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateTitle(message: string): string {
  const cleaned = message.replace(/[^\w\s]/g, "").trim();
  return cleaned.split(/\s+/).slice(0, 6).join(" ") || "New conversation";
}

function loadSavedConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("vizzy-chat-conversations");
    if (!raw) return [];
    return JSON.parse(raw).map((c: Conversation) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
      messages: c.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })),
    }));
  } catch {
    return [];
  }
}

function mockGenerationPipeline(
  text: string,
  hasAttachments: boolean,
  convId: string,
  assistantId: string,
  updateConversation: (id: string, updater: (conv: Conversation) => Conversation) => void,
  setIsLoading: (v: boolean) => void,
  addToast: (msg: string, type?: "success" | "error" | "info") => void,
) {
  const enhanced = enhancePrompt(text, hasAttachments);
  const mockResp = getMockResponse(text);
  const intentResp = getMockResponseForIntent(enhanced);
  const responseText = intentResp || mockResp.text;
  const assets = mockResp.assets
    ? mockResp.assets.flatMap((a) => buildAssets(a.category, a.count, a.type))
    : buildAssets("generic-creative", enhanced.format.count);

  let stageIdx = 0;
  const stages: GenerationStage[] = ["enhancing", "generating", "rendering"];
  const stageTexts = [
    "Analyzing your prompt and enhancing for optimal results...",
    `Generating ${assets.length} ${enhanced.format.assetType} assets...`,
    "Rendering final compositions...",
  ];

  const advanceStage = () => {
    if (stageIdx >= stages.length) return;
    const stage = stages[stageIdx];
    const stageText = stageTexts[stageIdx];

    updateConversation(convId, (conv) => ({
      ...conv,
      messages: conv.messages.map((m) =>
        m.id === assistantId ? { ...m, content: stageText, stage, isStreaming: true } : m
      ),
      updatedAt: new Date(),
    }));

    stageIdx++;
    if (stageIdx <= stages.length) {
      setTimeout(advanceStage, 400 + Math.random() * 300);
    } else {
      streamFinalResponse(responseText, assets, enhanced.enhanced, convId, assistantId, updateConversation, setIsLoading, addToast);
    }
  };

  setTimeout(advanceStage, 200);
}

function streamFinalResponse(
  text: string,
  assets: GeneratedAsset[],
  enhancedPrompt: string,
  convId: string,
  assistantId: string,
  updateConversation: (id: string, updater: (conv: Conversation) => Conversation) => void,
  setIsLoading: (v: boolean) => void,
  addToast: (msg: string, type?: "success" | "error" | "info") => void,
) {
  const words = text.split(" ");
  let idx = 0;
  let acc = "";

  const interval = setInterval(() => {
    if (idx >= words.length) {
      clearInterval(interval);
      updateConversation(convId, (conv) => ({
        ...conv,
        messages: conv.messages.map((m) =>
          m.id === assistantId ? { ...m, content: acc, assets, enhancedPrompt, stage: "completed", isStreaming: false } : m
        ),
        updatedAt: new Date(),
      }));
      setIsLoading(false);
      addToast(`Generated ${assets.length} creative assets`, "success");
      return;
    }
    acc += (idx > 0 ? " " : "") + words[idx];
    idx++;
    updateConversation(convId, (conv) => ({
      ...conv,
      messages: conv.messages.map((m) =>
        m.id === assistantId ? { ...m, content: acc, isStreaming: true } : m
      ),
      updatedAt: new Date(),
    }));
  }, 20);
}

function ChatApp() {
  const { user, loading: authLoading } = useAuth();
  const loadedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assetsPanelOpen, setAssetsPanelOpen] = useState(false);
  const [canvasAsset, setCanvasAsset] = useState<GeneratedAsset | null>(null);
  const [workspace, setWorkspace] = useState<Workspace>("personal");
  const [folders] = useState<ConversationFolder[]>([
    { id: "business", name: "Business", icon: "briefcase", color: "text-amber-400" },
    { id: "personal", name: "Personal", icon: "heart", color: "text-pink-400" },
  ]);
  const { addToast } = useToast();

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;
  const messages = activeConv?.messages || [];

  const allAssets = messages.flatMap((m) => m.assets || []);

  useEffect(() => {
    if (!user || loadedRef.current) return;
    loadedRef.current = true;
    setConversations(loadSavedConversations());
  }, [user]);

  useEffect(() => {
    if (conversations.length > 0) {
      try { localStorage.setItem("vizzy-chat-conversations", JSON.stringify(conversations)); } catch { /* ok */ }
    }
  }, [conversations]);

  // Assets panel auto-opens via streaming pipeline when assets are generated

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const updateConversation = useCallback(
    (id: string, updater: (conv: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
    }, []
  );

  const handleSend = useCallback(
    (text: string, attachs?: MessageAttachment[], voiceData?: VoiceData) => {
      let convId = activeConvId;
      if (!convId) {
        convId = generateId();
        const now = new Date();
        setConversations((prev) => [{ id: convId!, title: generateTitle(text), messages: [], createdAt: now, updatedAt: now, workspace }, ...prev]);
        setActiveConvId(convId);
      }

      const userMessage: Message = {
        id: generateId(), role: "user", content: text, timestamp: new Date(),
        attachments: attachs && attachs.length > 0 ? attachs : undefined,
        voiceData: voiceData || undefined,
      };
      const assistantId = generateId();

      updateConversation(convId, (conv) => ({
        ...conv,
        messages: [...conv.messages, userMessage, { id: assistantId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true, stage: "enhancing" }],
        updatedAt: new Date(),
      }));

      setIsLoading(true);

      let settled = false;
      const settle = () => { if (!settled) { settled = true; if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; } } };

      sendChatMessage(text, activeConvId, {
        onChunk: (chunk) => {
          settle();
          updateConversation(convId!, (conv) => ({
            ...conv,
            messages: conv.messages.map((m) => m.id === assistantId ? { ...m, content: chunk, stage: "completed", isStreaming: true } : m),
            updatedAt: new Date(),
          }));
        },
        onDone: (messageId, newConvId) => {
          settle();
          updateConversation(convId!, (conv) => ({
            ...conv,
            id: newConvId || conv.id,
            messages: conv.messages.map((m) => m.id === assistantId ? { ...m, content: m.content || "Here's what I created for you.", stage: "completed", isStreaming: false } : m),
            updatedAt: new Date(),
          }));
          setIsLoading(false);
        },
        onError: () => {
          settle();
          mockGenerationPipeline(text, (attachs?.length || 0) > 0, convId!, assistantId, updateConversation, setIsLoading, addToast);
        },
      });

      timeoutRef.current = setTimeout(() => {
        if (!settled) {
          settle();
          mockGenerationPipeline(text, (attachs?.length || 0) > 0, convId!, assistantId, updateConversation, setIsLoading, addToast);
        }
      }, API_TIMEOUT);
    },
    [activeConvId, updateConversation, addToast, workspace]
  );

  const handleRegenerate = useCallback(
    (asset: GeneratedAsset) => {
      if (!activeConvId) return;
      handleSend(`Regenerate "${asset.title}" with fresh creative direction`);
    },
    [activeConvId, handleSend]
  );

  const handleVariation = useCallback(
    (asset: GeneratedAsset) => {
      if (!activeConvId) return;
      handleSend(`Create 3 alternative variations of "${asset.title}" exploring different creative directions`);
    },
    [activeConvId, handleSend]
  );

  const handlePin = useCallback(
    (id: string) => {
      setConversations((prev) => prev.map((c) => c.id === id ? { ...c, pinned: !c.pinned } : c));
    }, []
  );

  const handleNewConversation = useCallback(() => { setActiveConvId(null); setSidebarOpen(false); }, []);
  const handleSelectConversation = useCallback((id: string) => { setActiveConvId(id); setSidebarOpen(false); }, []);
  const handleDeleteConversation = useCallback(
    (id: string) => { setConversations((prev) => prev.filter((c) => c.id !== id)); if (activeConvId === id) setActiveConvId(null); addToast("Conversation deleted", "info"); },
    [activeConvId, addToast]
  );

  const commandPaletteCommands = [
    { id: "new-chat", label: "New Conversation", shortcut: "Ctrl+N", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>, action: handleNewConversation },
    { id: "luxury", label: "Create a luxury product ad", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>, action: () => handleSend("Create a luxury product ad for Instagram") },
    { id: "renaissance", label: "Turn photo into renaissance art", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>, action: () => handleSend("Turn this photo into a renaissance-style artwork") },
    { id: "vision", label: "Generate a vision board", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>, action: () => handleSend("Create a vision board with my goals for the next 3 years") },
  ];

  if (authLoading) {
    return (
      <div className="h-screen bg-[#06060a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 blur-xl opacity-40 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
          </div>
          <p className="text-[13px] text-zinc-600">Loading Vizzy...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="flex h-screen bg-[#06060a] text-white overflow-hidden noise-overlay">
      <div className="ambient-bg" />
      <CommandPalette commands={commandPaletteCommands} />
      <Sidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={handleSelectConversation}
        onNew={handleNewConversation}
        onDelete={handleDeleteConversation}
        onPin={handlePin}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        workspace={workspace}
        onWorkspaceChange={setWorkspace}
        folders={folders}
        onNewFolder={() => {}}
        onRenameFolder={() => {}}
        onDeleteFolder={() => {}}
      />
      <main className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] bg-[#06060a]/80 backdrop-blur-xl shrink-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-1 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors lg:hidden">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          {activeConv ? (
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-[14px] font-medium text-zinc-200 truncate">{activeConv.title}</h2>
              <span className="text-[11px] text-zinc-600 shrink-0 hidden sm:inline">{activeConv.messages.filter((m) => m.role === "user").length} prompts</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <span className="text-[14px] font-bold text-zinc-200 tracking-tight">Vizzy</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => document.querySelector<HTMLTextAreaElement>("textarea")?.focus()} className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>Search</span>
              <kbd className="text-[9px] bg-white/[0.06] border border-white/[0.08] px-1 py-0.5 rounded font-mono ml-1">Ctrl+K</kbd>
            </button>
            {allAssets.length > 0 && (
              <button onClick={() => setAssetsPanelOpen(!assetsPanelOpen)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all duration-200 ${assetsPanelOpen ? "border-violet-500/30 bg-violet-500/10 text-violet-300" : "border-white/[0.06] bg-white/[0.03] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]"}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                <span>{allAssets.length} assets</span>
              </button>
            )}
            <CreditsBadge credits={user.credits} maxCredits={1000} plan={user.plan} />
            <UserMenu />
          </div>
        </header>
        {messages.length === 0 ? (
          <WelcomeScreen onPromptSelect={handleSend} />
        ) : (
          <ChatArea messages={messages} onRegenerate={handleRegenerate} onVariation={handleVariation} onOpen={setCanvasAsset} />
        )}
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </main>
      <AssetWorkspace
        assets={allAssets}
        onOpen={setCanvasAsset}
        onRegenerate={handleRegenerate}
        onVariation={handleVariation}
        isOpen={assetsPanelOpen}
        onToggle={() => setAssetsPanelOpen(!assetsPanelOpen)}
      />
      <CanvasModal asset={canvasAsset} onClose={() => setCanvasAsset(null)} onRegenerate={handleRegenerate} onVariation={handleVariation} />
    </div>
  );
}

export default function Home() {
  return <ToastProvider><ChatApp /></ToastProvider>;
}
