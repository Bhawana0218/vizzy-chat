export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Use production URL if available, otherwise fall back to request origin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const getOrigin = () => appUrl || new URL(request.url).origin;

  if (errorParam) {
    console.error("[AuthCallback] OAuth provider error:", errorParam, errorDescription);
    return NextResponse.redirect(`${getOrigin()}/?error=${encodeURIComponent(errorParam)}`);
  }

  if (!code) {
    console.error("[AuthCallback] No code in callback URL");
    return NextResponse.redirect(`${getOrigin()}/?error=no_code`);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[AuthCallback] exchangeCodeForSession failed:", error.message, error.status);
      return NextResponse.redirect(`${getOrigin()}/?error=exchange_failed&detail=${encodeURIComponent(error.message)}`);
    }

    if (!data.session) {
      console.error("[AuthCallback] No session after exchange");
      return NextResponse.redirect(`${getOrigin()}/?error=no_session`);
    }

    const redirectUrl = `${getOrigin()}${next}`;
    const response = NextResponse.redirect(redirectUrl);
    return response;
  } catch (err) {
    console.error("[AuthCallback] Unexpected error:", err);
    return NextResponse.redirect(`${getOrigin()}/?error=callback_exception&detail=${encodeURIComponent(String(err))}`);
  }
}
