"use client";

import { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  credits: number;
  plan: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  supabaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function buildFallbackProfile(sbUser: User): AuthUser {
  return {
    id: sbUser.id,
    email: sbUser.email || "",
    name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || null,
    avatarUrl: sbUser.user_metadata?.avatar_url || null,
    credits: 1000,
    plan: "free",
  };
}

async function fetchUserProfile(sbUser: User): Promise<AuthUser> {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch {
    // Network error or API down
  }
  return buildFallbackProfile(sbUser);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let cancelled = false;

    supabase.auth.getUser().then(({ data: { user: sbUser } }: { data: { user: User | null } }) => {
      if (cancelled) return;
      setSupabaseUser(sbUser);
      if (sbUser) {
        fetchUserProfile(sbUser).then((profile) => {
          if (!cancelled) setUser(profile);
        }).catch(() => {});
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: { user: User } | null) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        fetchUserProfile(session.user).then(setUser).catch(() => {});
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    const { origin } = window.location;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${appUrl}/api/auth/callback`,
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    window.location.href = "/";
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      setSupabaseUser(sbUser);
      if (sbUser) {
        const profile = await fetchUserProfile(sbUser);
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch {
      setSupabaseUser(null);
      setUser(null);
    }
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, supabaseUser, loading, signInWithGoogle, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
