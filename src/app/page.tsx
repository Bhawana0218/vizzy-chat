"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Message, Conversation, GeneratedAsset, MessageAttachment } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { sendChatMessage } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import WelcomeScreen from "@/components/WelcomeScreen";
import ChatArea from "@/components/ChatArea";
import ChatInput from "@/components/ChatInput";
import CanvasModal from "@/components/CanvasModal";
import CreditsBadge from "@/components/CreditsBadge";
import CommandPalette from "@/components/CommandPalette";
import UserMenu from "@/components/UserMenu";
import { ToastProvider, useToast } from "@/components/Toast";
import LoginPage from "@/app/login/page";

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

function mockStreamResponse(
  text: string,
  convId: string,
  assistantId: string,
  updateConversation: (id: string, updater: (conv: Conversation) => Conversation) => void,
  setIsLoading: (v: boolean) => void,
  addToast: (msg: string, type?: "success" | "error" | "info") => void,
) {
  const responses: Record<string, string> = {
    luxury: "I've created some premium product visuals with a luxurious aesthetic. Each version uses warm amber tones and rich shadows to convey elegance. Would you like me to refine any of these or create variations for specific platforms?",
    renaissance: "Here are your photos reimagined in Renaissance style. I've captured the rich color palettes, dramatic lighting, and compositional techniques of the Old Masters. Would you like a different art period?",
    emotional: "I've created an abstract visualization of your emotional landscape. The deep indigos and soft violets suggest depth and contemplation. Would you like me to explore different emotional tones?",
    vision: "Here's your vision board with six focus areas. Each tile represents a key aspiration with its own color story and mood. You can ask me to regenerate individual tiles or add more areas.",
    dream: "I've visualized your dream as a series of ethereal scenes. The dreamlike quality comes from soft edges, impossible geometry, and a palette that shifts between reality and fantasy.",
    story: "I've created the opening scenes for your storybook. Each illustration brings the narrative to life with vibrant colors and engaging compositions. Want me to continue with more chapters?",
    winter: "Here are three directions for your winter campaign. Each brings a different mood \u2014 from crisp elegance to cozy warmth. Which direction resonates most?",
    sale: "Here are some sale poster designs that feel premium while clearly communicating the offer. I've avoided loud, discount-heavy aesthetics in favor of sophisticated typography.",
    default: "I understand what you're looking for. Let me create something special based on your description. I've generated a few options for you to consider. Would you like me to refine any of these?",
  };

  const key = Object.keys(responses).find((k) => text.toLowerCase().includes(k)) || "default";
  const responseText = responses[key];

  const mockAssets: GeneratedAsset[] = Array.from({ length: 3 }, (_, i) => ({
    id: `asset-${Date.now()}-${i}`,
    type: "image" as const,
    url: `mock://${i}`,
    title: ["Hero Shot", "Lifestyle", "Detail"][i],
    prompt: text,
    width: 1024,
    height: 1024,
  }));

  const words = responseText.split(" ");
  let idx = 0;
  let acc = "";

  const interval = setInterval(() => {
    if (idx >= words.length) {
      clearInterval(interval);
      updateConversation(convId, (conv) => ({
        ...conv,
        messages: conv.messages.map((m) =>
          m.id === assistantId ? { ...m, content: acc, assets: mockAssets, isStreaming: false } : m
        ),
        updatedAt: new Date(),
      }));
      setIsLoading(false);
      addToast(`Generated ${mockAssets.length} creative assets`, "success");
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
  }, 22);
}

function ChatApp() {
  const { user, loading: authLoading } = useAuth();
  const loadedRef = useRef(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [canvasAsset, setCanvasAsset] = useState<GeneratedAsset | null>(null);
  const { addToast } = useToast();

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;
  const messages = activeConv?.messages || [];

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

  const updateConversation = useCallback(
    (id: string, updater: (conv: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
    }, []
  );

  const handleSend = useCallback(
    (text: string, attachs?: MessageAttachment[]) => {
      let convId = activeConvId;
      if (!convId) {
        convId = generateId();
        const now = new Date();
        setConversations((prev) => [{ id: convId!, title: generateTitle(text), messages: [], createdAt: now, updatedAt: now }, ...prev]);
        setActiveConvId(convId);
      }

      const userMessage: Message = { id: generateId(), role: "user", content: text, timestamp: new Date(), attachments: attachs && attachs.length > 0 ? attachs : undefined };
      const assistantId = generateId();

      updateConversation(convId, (conv) => ({
        ...conv,
        messages: [...conv.messages, userMessage, { id: assistantId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true }],
        updatedAt: new Date(),
      }));

      setIsLoading(true);

      sendChatMessage(text, activeConvId, {
        onChunk: (chunk) => {
          updateConversation(convId!, (conv) => ({
            ...conv,
            messages: conv.messages.map((m) => m.id === assistantId ? { ...m, content: chunk, isStreaming: true } : m),
            updatedAt: new Date(),
          }));
        },
        onDone: (messageId, newConvId) => {
          updateConversation(convId!, (conv) => ({
            ...conv,
            id: newConvId || conv.id,
            messages: conv.messages.map((m) => m.id === assistantId ? { ...m, content: m.content || "Here's what I created for you.", isStreaming: false } : m),
            updatedAt: new Date(),
          }));
          setIsLoading(false);
        },
        onError: () => {
          mockStreamResponse(text, convId!, assistantId, updateConversation, setIsLoading, addToast);
        },
      });
    },
    [activeConvId, updateConversation, addToast]
  );

  const handleRegenerate = useCallback(
    (asset: GeneratedAsset) => {
      if (!activeConvId) return;
      const userMessage: Message = { id: generateId(), role: "user", content: `Regenerate "${asset.title}"`, timestamp: new Date() };
      updateConversation(activeConvId, (conv) => ({ ...conv, messages: [...conv.messages, userMessage], updatedAt: new Date() }));
      const assistantId = generateId();
      updateConversation(activeConvId, (conv) => ({
        ...conv,
        messages: [...conv.messages, { id: assistantId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true }],
        updatedAt: new Date(),
      }));
      setIsLoading(true);
      const text = `Here's a fresh take on "${asset.title}". I've applied subtle variations in composition and color while maintaining the original creative intent. Let me know if you'd like further adjustments.`;
      const words = text.split(" ");
      let idx = 0; let acc = "";
      const interval = setInterval(() => {
        if (idx >= words.length) {
          clearInterval(interval);
          const newAssets: GeneratedAsset[] = [
            { id: `asset-${Date.now()}-0`, type: "image", url: "mock://r0", title: asset.title, prompt: asset.prompt, width: 1024, height: 1024 },
            { id: `asset-${Date.now()}-1`, type: "image", url: "mock://r1", title: `${asset.title} v2`, prompt: asset.prompt, width: 1024, height: 1024 },
          ];
          updateConversation(activeConvId!, (conv) => ({
            ...conv, messages: conv.messages.map((m) => m.id === assistantId ? { ...m, content: acc, assets: newAssets, isStreaming: false } : m), updatedAt: new Date(),
          }));
          setIsLoading(false); addToast("Regeneration complete", "success"); return;
        }
        acc += (idx > 0 ? " " : "") + words[idx]; idx++;
        updateConversation(activeConvId!, (conv) => ({
          ...conv, messages: conv.messages.map((m) => m.id === assistantId ? { ...m, content: acc, isStreaming: true } : m), updatedAt: new Date(),
        }));
      }, 22);
    },
    [activeConvId, updateConversation, addToast]
  );

  const handleVariation = useCallback(
    (asset: GeneratedAsset) => {
      if (!activeConvId) return;
      const userMessage: Message = { id: generateId(), role: "user", content: `Create variations of "${asset.title}"`, timestamp: new Date() };
      updateConversation(activeConvId, (conv) => ({ ...conv, messages: [...conv.messages, userMessage], updatedAt: new Date() }));
      const assistantId = generateId();
      updateConversation(activeConvId, (conv) => ({
        ...conv,
        messages: [...conv.messages, { id: assistantId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true }],
        updatedAt: new Date(),
      }));
      setIsLoading(true);
      const text = `Here are three alternative variations. Each explores a different creative direction while keeping the core concept intact. You can mix elements from different versions or ask me to refine a specific one.`;
      const words = text.split(" ");
      let idx = 0; let acc = "";
      const interval = setInterval(() => {
        if (idx >= words.length) {
          clearInterval(interval);
          const vars: GeneratedAsset[] = ["Variation A", "Variation B", "Variation C"].map((t, i) => ({
            id: `var-${Date.now()}-${i}`, type: "image" as const, url: `mock://v${i}`, title: t, prompt: asset.prompt, width: 1024, height: 1024,
          }));
          updateConversation(activeConvId!, (conv) => ({
            ...conv, messages: conv.messages.map((m) => m.id === assistantId ? { ...m, content: acc, assets: vars, isStreaming: false } : m), updatedAt: new Date(),
          }));
          setIsLoading(false); addToast("3 variations created", "success"); return;
        }
        acc += (idx > 0 ? " " : "") + words[idx]; idx++;
        updateConversation(activeConvId!, (conv) => ({
          ...conv, messages: conv.messages.map((m) => m.id === assistantId ? { ...m, content: acc, isStreaming: true } : m), updatedAt: new Date(),
        }));
      }, 22);
    },
    [activeConvId, updateConversation, addToast]
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
    { id: "emotional", label: "Visualize my emotional landscape", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg>, action: () => handleSend("Show me how I feel right now") },
    { id: "vision", label: "Generate a vision board", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/></svg>, action: () => handleSend("Create a vision board with my goals for the next 3 years") },
    { id: "winter", label: "Design a winter campaign", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>, action: () => handleSend("Design a premium winter campaign for my store") },
  ];

  if (authLoading) {
    return (
      <div className="h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <p className="text-[13px] text-zinc-600">Loading Vizzy Chat...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-white overflow-hidden">
      <CommandPalette commands={commandPaletteCommands} />
      <Sidebar conversations={conversations} activeId={activeConvId} onSelect={handleSelectConversation} onNew={handleNewConversation} onDelete={handleDeleteConversation} isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06] bg-[#0a0a0c]/80 backdrop-blur-xl shrink-0 z-20">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 -ml-1 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors lg:hidden">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          {activeConv ? (
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="text-[14px] font-medium text-zinc-200 truncate">{activeConv.title}</h2>
              <span className="text-[11px] text-zinc-600 shrink-0 hidden sm:inline">{activeConv.messages.filter((m) => m.role === "user").length} prompts</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <span className="text-[14px] font-medium text-zinc-200">Vizzy Chat</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={() => document.querySelector<HTMLTextAreaElement>("textarea")?.focus()} className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span>Search</span>
              <kbd className="text-[9px] bg-white/[0.06] border border-white/[0.08] px-1 py-0.5 rounded font-mono ml-1">Ctrl+K</kbd>
            </button>
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
      <CanvasModal asset={canvasAsset} onClose={() => setCanvasAsset(null)} onRegenerate={handleRegenerate} onVariation={handleVariation} />
    </div>
  );
}

export default function Home() {
  return <ToastProvider><ChatApp /></ToastProvider>;
}
