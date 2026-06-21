import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/track — Terima data tracking dari sendBeacon (track.js)
 * dan simpan ke database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      site_id,
      url,
      referrer,
      title,
      screen,
      language,
    } = body;

    if (!site_id || !url) {
      return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
    }

    // Simpan ke database
    await prisma.trackingEvent.create({
      data: {
        siteId: site_id,
        url,
        referrer: referrer || null,
        title: title || null,
        screen: screen || null,
        language: language || null,
        ipAddress: 
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          null,
        userAgent: req.headers.get("user-agent") || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track] error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/**
 * GET /api/track — Fallback via Image beacon (?d= encoded JSON)
 * Return 1x1 transparent GIF.
 */
export async function GET(req: NextRequest) {
  const d = req.nextUrl.searchParams.get("d");
  if (d) {
    try {
      const data = JSON.parse(decodeURIComponent(d));
      const { site_id, url, referrer, title, screen, language } = data;

      if (site_id && url) {
        await prisma.trackingEvent.create({
          data: {
            siteId: site_id,
            url,
            referrer: referrer || null,
            title: title || null,
            screen: screen || null,
            language: language || null,
            ipAddress:
              req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
              req.headers.get("x-real-ip") ||
              null,
            userAgent: req.headers.get("user-agent") || null,
          },
        });
      }
    } catch {
      // ignore parse errors
    }
  }

  // 1x1 transparent GIF
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
