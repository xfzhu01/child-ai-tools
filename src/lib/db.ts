import { GameMode, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  prismaVersion: number | undefined;
};

/** Bump when Prisma schema changes (e.g. new GameMode enum values). */
const PRISMA_CLIENT_VERSION = 4;

/** Avoid pg v9 SSL mode deprecation warning while keeping Neon-compatible TLS. */
function normalizePgConnectionString(url: string) {
  if (!url.includes("sslmode=")) return url;
  if (url.includes("uselibpqcompat=")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}uselibpqcompat=true`;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString: normalizePgConnectionString(connectionString),
      max: process.env.DATABASE_POOL_MAX ? Number(process.env.DATABASE_POOL_MAX) : 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

/** Recreate client in dev when schema changes (e.g. after prisma generate). */
function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (
    cached &&
    globalForPrisma.prismaVersion === PRISMA_CLIENT_VERSION &&
    "modeProgress" in cached &&
    "FOUNDATION" in GameMode
  ) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaVersion = PRISMA_CLIENT_VERSION;
  }
  return client;
}

const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export { prisma };
export default prisma;
