export type AvatarPreset = {
  id: string;
  emoji: string;
  label: string;
  ring: string;
  bg: string;
};

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: "panda", emoji: "🐼", label: "熊猫宝", ring: "ring-pink-300", bg: "from-pink-100 via-rose-100 to-pink-200" },
  { id: "cat", emoji: "🐱", label: "喵喵", ring: "ring-orange-300", bg: "from-amber-100 via-orange-100 to-amber-200" },
  { id: "dog", emoji: "🐶", label: "汪汪", ring: "ring-yellow-300", bg: "from-yellow-100 via-amber-100 to-yellow-200" },
  { id: "fox", emoji: "🦊", label: "小狐狸", ring: "ring-orange-300", bg: "from-orange-100 via-red-100 to-orange-200" },
  { id: "rabbit", emoji: "🐰", label: "兔宝", ring: "ring-violet-300", bg: "from-violet-100 via-purple-100 to-violet-200" },
  { id: "bear", emoji: "🐻", label: "熊宝", ring: "ring-amber-400", bg: "from-amber-100 via-yellow-100 to-amber-200" },
  { id: "koala", emoji: "🐨", label: "考拉", ring: "ring-slate-300", bg: "from-slate-100 via-gray-100 to-slate-200" },
  { id: "lion", emoji: "🦁", label: "小狮子", ring: "ring-amber-300", bg: "from-amber-100 via-orange-100 to-yellow-200" },
  { id: "frog", emoji: "🐸", label: "呱呱", ring: "ring-emerald-300", bg: "from-emerald-100 via-green-100 to-emerald-200" },
  { id: "unicorn", emoji: "🦄", label: "独角兽", ring: "ring-fuchsia-300", bg: "from-fuchsia-100 via-pink-100 to-violet-200" },
  { id: "chick", emoji: "🐣", label: "小鸡仔", ring: "ring-yellow-300", bg: "from-yellow-100 via-lime-100 to-yellow-200" },
  { id: "penguin", emoji: "🐧", label: "企鹅宝", ring: "ring-sky-300", bg: "from-sky-100 via-blue-100 to-sky-200" },
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickAvatarPreset(seed: string): AvatarPreset {
  return AVATAR_PRESETS[hashString(seed) % AVATAR_PRESETS.length]!;
}

export function resolveChildAvatar(child: { id: string; avatarUrl?: string | null }): AvatarPreset {
  const preset = AVATAR_PRESETS.find((item) => item.id === child.avatarUrl);
  if (preset) return preset;
  return pickAvatarPreset(child.id);
}

export function avatarPresetId(seed: string) {
  return pickAvatarPreset(seed).id;
}
