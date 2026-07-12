import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger, generateRequestId } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      logger.info("Auth callback successful", { requestId });
      return NextResponse.redirect(`${origin}${next}`);
    }

    logger.error("Auth callback error", { requestId, error: error.message });
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
