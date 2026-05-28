import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GuestPlayClient } from "@/components/typing/guest-play-client";
import type { GameMode } from "@/lib/typing-engine/level-content";

const GUEST_MODES = ["FOUNDATION", "ASSESSMENT", "ADVENTURE", "CHAIN"] as const;

export default async function GuestPlayPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode: modeParam } = await searchParams;
  const mode = (modeParam ?? "FOUNDATION").toUpperCase() as GameMode;
  if (!GUEST_MODES.includes(mode as (typeof GUEST_MODES)[number])) notFound();

  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">加载中…</div>}>
      <GuestPlayClient mode={mode} />
    </Suspense>
  );
}
