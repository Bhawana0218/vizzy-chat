export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("[/api/auth/me] Supabase getUser error:", error.message);
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: error.message } },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "No user in session" } },
        { status: 401 }
      );
    }

    let dbUser;
    try {
      dbUser = await prisma.user.upsert({
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
    } catch (dbErr: unknown) {
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      if (msg.includes("does not exist")) {
        console.warn("[/api/auth/me] DB tables missing — using Supabase fallback");
      } else {
        console.error("[/api/auth/me] Prisma error:", msg);
      }
      dbUser = {
        id: user.id,
        email: user.email || "",
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatarUrl: user.user_metadata?.avatar_url || null,
        credits: 1000,
        plan: "free",
      };
    }

    return NextResponse.json({ data: dbUser });
  } catch (err) {
    console.error("[/api/auth/me] Unexpected error:", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile" } },
      { status: 500 }
    );
  }
}
