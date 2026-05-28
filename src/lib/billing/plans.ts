/** Paid tiers stored on Entitlement.tier */
export const TIER_BASIC = "basic";
export const TIER_AI = "ai";
/** Legacy invite / grant tier — same access as AI */
export const TIER_PRO = "pro";

export type PaidTier = typeof TIER_BASIC | typeof TIER_AI | typeof TIER_PRO;
export type SubscriptionTier = "free" | typeof TIER_BASIC | typeof TIER_AI;

export const PLANS = {
  free: {
    id: "free" as const,
    name: "免费版",
    price: "¥0",
    priceNote: "",
  },
  basic: {
    id: TIER_BASIC,
    name: "官方关卡版",
    price: "¥19.9",
    priceNote: "/年",
    planId: "typing-basic-year",
  },
  ai: {
    id: TIER_AI,
    name: "AI 智能版",
    price: "¥49.9",
    priceNote: "/年",
    planId: "typing-ai-year",
    /** Marketing promise — bundle tier not shipped yet */
    bundleBenefit: "日后成长包免费获取",
  },
} as const;

export const AI_PLAN_FEATURES = [
  "包含官方关卡版全部权益",
  "AI 定制关 · 弱项键位专属练习",
  "AI 学习报告 · 深度分析与建议",
  "全部主题皮肤",
  PLANS.ai.bundleBenefit,
] as const;

export function tierGrantsBasic(tier: string) {
  return tier === TIER_BASIC || tier === TIER_AI || tier === TIER_PRO;
}

export function tierGrantsAi(tier: string) {
  return tier === TIER_AI || tier === TIER_PRO;
}

export function subscriptionLabel(tier: SubscriptionTier) {
  if (tier === TIER_BASIC) return PLANS.basic.name;
  if (tier === TIER_AI) return PLANS.ai.name;
  return PLANS.free.name;
}
