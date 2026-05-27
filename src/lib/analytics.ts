import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 120;

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max = MAX_EVENTS_PER_WINDOW) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

export async function trackEvent(params: {
  userId?: string;
  childId?: string;
  event: string;
  props?: Record<string, unknown>;
}) {
  if (params.userId && !checkRateLimit(`analytics:${params.userId}`)) {
    return;
  }
  await prisma.analyticsEvent.create({
    data: {
      userId: params.userId,
      childId: params.childId,
      event: params.event,
      props: (params.props ?? {}) as Prisma.InputJsonValue,
    },
  });
}
