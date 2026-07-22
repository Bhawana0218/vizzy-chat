import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  credits: number;
  plan: string;
}

export async function getAuthUser(): Promise<AuthUser> {
  let supabase;
  try {
    supabase = await Promise.race([
      createClient(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("supabase-timeout")), 3000)),
    ]);
  } catch (err) {
    console.error("[getAuthUser] Failed to create Supabase client:", err);
    throw new Error("UNAUTHORIZED");
  }

  const { data: { user }, error } = await Promise.race([
    supabase.auth.getUser(),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("supabase-timeout")), 3000)),
  ]);

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  try {
    const dbUser = await Promise.race([
      prisma.user.upsert({
        where: { providerId: user.id },
        create: {
          email: user.email!,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatarUrl: user.user_metadata?.avatar_url,
          provider: user.app_metadata?.provider || "google",
          providerId: user.id,
        },
        update: {
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatarUrl: user.user_metadata?.avatar_url,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          credits: true,
          plan: true,
        },
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("db-timeout")), 3000)),
    ]);
    return dbUser;
  } catch (dbErr: unknown) {
    const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
    if (msg.includes("does not exist")) {
      console.warn("[getAuthUser] DB tables missing — using Supabase fallback");
    } else {
      console.error("[getAuthUser] Prisma error:", msg);
    }
    return {
      id: user.id,
      email: user.email || "",
      name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
      credits: 1000,
      plan: "free",
    };
  }
}

export async function getOptionalAuthUser(): Promise<AuthUser | null> {
  try {
    return await getAuthUser();
  } catch {
    return null;
  }
}
