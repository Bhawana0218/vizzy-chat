import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { UnauthorizedError } from "@/lib/errors";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  credits: number;
  plan: string;
}

export async function getAuthUser(): Promise<AuthUser> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError();
  }

  // Get or create user in our database
  const dbUser = await prisma.user.upsert({
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
  });

  return dbUser;
}

export async function getOptionalAuthUser(): Promise<AuthUser | null> {
  try {
    return await getAuthUser();
  } catch {
    return null;
  }
}
