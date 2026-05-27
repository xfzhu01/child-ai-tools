import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPassword } from "../src/lib/auth/password";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin12345";

  const admin = await prisma.user.upsert({
    where: { email },
    update: { isAdmin: true },
    create: {
      email,
      name: "管理员",
      passwordHash: await hashPassword(password),
      isAdmin: true,
      guardianConsent: true,
    },
  });

  const invite = await prisma.inviteCode.upsert({
    where: { code: "BETA2026" },
    update: { tier: "ai" },
    create: {
      code: "BETA2026",
      tier: "ai",
      toolSlug: "typing",
      maxUses: 100,
      createdById: admin.id,
    },
  });

  console.log("Seed complete:");
  console.log(`Admin: ${email} / ${password}`);
  console.log(`Invite code: ${invite.code}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
