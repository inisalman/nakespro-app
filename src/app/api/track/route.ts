import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/track — Terima data tracking dari sendBeacon
 * GET /api/track — Fallback via Image beacon (?d= encoded JSON)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Log saja untuk MVP — nanti bisa disimpan ke DB/analytics service
    console.log("[track]", JSON.stringify(body));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const d = req.nextUrl.searchParams.get("d");
  if (d) {
    try {
      const data = JSON.parse(decodeURIComponent(d));
      console.log("[track]", JSON.stringify(data));
    } catch {
      // ignore
    }
  }
  // Return 1x1 transparent GIF
  const gif = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  return new NextResponse(gif, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store",
    },
  });
}
