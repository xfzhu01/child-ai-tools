import type { Session } from "next-auth";
import { SiteHeaderClient } from "@/components/layout/site-header-client";

export function SiteHeader({
  session,
  tryHref,
}: {
  session: Session | null;
  tryHref: string;
}) {
  return <SiteHeaderClient session={session} tryHref={tryHref} />;
}
