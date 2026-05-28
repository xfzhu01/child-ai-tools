export const FREE_DAILY_SESSIONS = 3;

/** Official modes that are always free with no daily session cap. */
export const UNLIMITED_FREE_MODES = ["FOUNDATION"] as const;

export function isUnlimitedFreeMode(mode: string): boolean {
  return (UNLIMITED_FREE_MODES as readonly string[]).includes(mode);
}
