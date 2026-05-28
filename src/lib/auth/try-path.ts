import prisma from "@/lib/db";

/** Guest → /try; logged-in with a child → mode picker with progress; else → dashboard. */
export async function getTryPath(userId?: string | null): Promise<string> {
  if (!userId) return "/try";

  const child = await prisma.childProfile.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  return child ? `/learn/${child.id}` : "/dashboard";
}
