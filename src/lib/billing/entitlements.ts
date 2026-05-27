import prisma from "@/lib/db";
import {
  PLANS,
  subscriptionLabel,
  tierGrantsAi,
  tierGrantsBasic,
  TIER_AI,
  TIER_BASIC,
  TIER_PRO,
  type SubscriptionTier,
} from "@/lib/billing/plans";

const FREE_DAILY_SESSIONS = 3;
const FREE_DAILY_AI_CALLS = 0;

/** Official modes that are always free with no daily session cap. */
export const UNLIMITED_FREE_MODES = ["FOUNDATION"] as const;

export function isUnlimitedFreeMode(mode: string): boolean {
  return (UNLIMITED_FREE_MODES as readonly string[]).includes(mode);
}

function activeEntitlementWhere(userId: string) {
  return {
    userId,
    toolSlug: "typing",
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}

async function getActiveEntitlements(userId: string) {
  return prisma.entitlement.findMany({
    where: activeEntitlementWhere(userId),
    orderBy: { createdAt: "desc" },
  });
}

async function isAdminUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });
  return Boolean(user?.isAdmin);
}

export async function getSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  if (await isAdminUser(userId)) return TIER_AI;
  const rows = await getActiveEntitlements(userId);
  if (rows.some((r) => tierGrantsAi(r.tier))) return TIER_AI;
  if (rows.some((r) => tierGrantsBasic(r.tier))) return TIER_BASIC;
  return "free";
}

export async function getSubscriptionStatus(userId: string) {
  const isAdmin = await isAdminUser(userId);
  const tier = isAdmin ? TIER_AI : await getSubscriptionTier(userId);
  return {
    tier,
    label: isAdmin ? "管理员 · AI 智能版" : subscriptionLabel(tier),
    hasBasic: tier !== "free",
    hasAi: tier === TIER_AI,
  };
}

/** @deprecated Use getSubscriptionStatus().hasBasic or hasAiAccess */
export async function hasProAccess(userId: string) {
  return hasAiAccess(userId);
}

export async function hasBasicAccess(userId: string) {
  const tier = await getSubscriptionTier(userId);
  return tier !== "free";
}

export async function hasAiAccess(userId: string) {
  const tier = await getSubscriptionTier(userId);
  return tier === TIER_AI;
}

export async function canAccessFeature(
  userId: string,
  feature: "ai_custom" | "unlimited" | "weekly_report",
) {
  if (feature === "ai_custom" || feature === "weekly_report") {
    return hasAiAccess(userId);
  }
  if (feature === "unlimited") {
    return hasBasicAccess(userId);
  }
  return false;
}

export async function getDailyUsage(childId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.dailyUsage.upsert({
    where: { childId_date: { childId, date: today } },
    create: { childId, date: today, sessions: 0, aiCalls: 0 },
    update: {},
  });
}

export async function canStartSession(userId: string, childId: string, mode?: string) {
  if (mode && isUnlimitedFreeMode(mode)) return { allowed: true, remaining: Infinity };
  if (await hasBasicAccess(userId)) return { allowed: true, remaining: Infinity };
  const usage = await getDailyUsage(childId);
  const remaining = Math.max(0, FREE_DAILY_SESSIONS - usage.sessions);
  return { allowed: remaining > 0, remaining };
}

export async function incrementSessionUsage(childId: string, mode?: string) {
  if (mode && isUnlimitedFreeMode(mode)) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.dailyUsage.upsert({
    where: { childId_date: { childId, date: today } },
    create: { childId, date: today, sessions: 1, aiCalls: 0 },
    update: { sessions: { increment: 1 } },
  });
}

export async function canCallAi(userId: string, childId: string) {
  if (await hasAiAccess(userId)) return true;
  const usage = await getDailyUsage(childId);
  return usage.aiCalls < FREE_DAILY_AI_CALLS;
}

export async function incrementAiUsage(childId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.dailyUsage.upsert({
    where: { childId_date: { childId, date: today } },
    create: { childId, date: today, sessions: 0, aiCalls: 1 },
    update: { aiCalls: { increment: 1 } },
  });
}

async function grantEntitlement(userId: string, tier: string, planId: string, days = 365) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  await prisma.entitlement.create({
    data: {
      userId,
      toolSlug: "typing",
      tier,
      expiresAt,
    },
  });
  return prisma.subscription.create({
    data: {
      userId,
      planId,
      status: "ACTIVE",
      provider: "manual",
      expiresAt,
    },
  });
}

export async function grantBasicEntitlement(userId: string, days = 365) {
  return grantEntitlement(userId, TIER_BASIC, PLANS.basic.planId, days);
}

export async function grantAiEntitlement(userId: string, days = 365) {
  return grantEntitlement(userId, TIER_AI, PLANS.ai.planId, days);
}

/** @deprecated Use grantAiEntitlement — legacy Pro maps to AI tier */
export async function grantProEntitlement(userId: string, days = 365) {
  return grantAiEntitlement(userId, days);
}

export async function redeemInviteCode(userId: string, code: string) {
  const invite = await prisma.inviteCode.findUnique({ where: { code } });
  if (!invite) throw new Error("邀请码无效");
  if (invite.expiresAt && invite.expiresAt < new Date()) throw new Error("邀请码已过期");
  if (invite.usedCount >= invite.maxUses) throw new Error("邀请码已用完");
  if (invite.redeemedById) throw new Error("邀请码已被使用");

  const tier = invite.tier === TIER_PRO ? TIER_AI : invite.tier;

  await prisma.$transaction([
    prisma.inviteCode.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 }, redeemedById: userId },
    }),
    prisma.entitlement.create({
      data: {
        userId,
        toolSlug: invite.toolSlug,
        tier,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  return tier;
}

export { FREE_DAILY_SESSIONS, subscriptionLabel };
