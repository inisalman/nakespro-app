import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// In-memory rate limit: per IP max 60 hit/menit. Reset setiap menit.
// Cukup untuk MVP; restart akan reset (acceptable trade-off).
const RATE_BUCKET = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = RATE_BUCKET.get(ip);
  if (!bucket || bucket.resetAt < now) {
    RATE_BUCKET.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count++;
  return bucket.count > RATE_LIMIT;
}

const BodySchema = z.object({
  subdomain: z.string().min(1).max(63),
  path: z.string().min(1).max(500),
  referrer: z.string().max(2000).nullable(),
});

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const ua = req.headers.get("user-agent") ?? "";
  const uaTruncated = ua.slice(0, 200);

  if (isRateLimited(ip)) {
    return new NextResponse(null, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new NextResponse(null, { status: 400 });
  }

  const { subdomain, path, referrer } = parsed.data;

  // Lookup order by subdomain. Subdomain disimpan lowercase di DB.
  const order = await prisma.order.findUnique({
    where: { subdomain },
    select: { id: true },
  });

  if (!order) {
    // Subdomain tidak dikenal. Jangan log error, biar tidak noisying.
    // Return 204 supaya beacon client tidak retry.
    return new NextResponse(null, { status: 204 });
  }

  // Hash IP + UA. Salt dengan daily key supaya hash tidak bisa di-crack
  // dengan rainbow table di level individual.
  const dailySalt = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const visitorHash = crypto
    .createHash("sha256")
    .update(`${dailySalt}|${ip}|${ua}`)
    .digest("hex");

  try {
    await prisma.pageView.create({
      data: {
        orderId: order.id,
        visitorHash,
        path,
        referrer,
        userAgent: uaTruncated,
      },
    });
  } catch (err) {
    // Log error tapi return 204 supaya beacon tidak retry otomatis.
    // Trade-off: kalau DB down, kita kehilangan data, bukan nge-spam log.
    console.error("[track] insert failed:", err);
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
