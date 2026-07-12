import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger, generateRequestId } from "@/lib/logger";

export async function POST() {
  const requestId = generateRequestId();

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    logger.info("User logged out", { requestId });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Logout error", { requestId, error: String(error) });
    return NextResponse.json({ success: true }); // Still return success
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const { origin } = new URL(request.url);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    logger.info("User logged out via GET", { requestId });

    return NextResponse.redirect(`${origin}/`);
  } catch (error) {
    logger.error("Logout error", { requestId, error: String(error) });
    return NextResponse.redirect(`${origin}/`);
  }
}
