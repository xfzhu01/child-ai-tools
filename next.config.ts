import type { NextConfig } from "next";

const deployTarget = process.env.DEPLOY_TARGET ?? "vercel";
const dockerTargets = new Set(["cloudflare", "aliyun", "docker"]);

const dockerConfig: NextConfig = dockerTargets.has(deployTarget)
  ? {
      output: "standalone",
      serverExternalPackages: [
        "pg",
        "@prisma/client",
        "@prisma/adapter-pg",
        ...(deployTarget === "cloudflare" ? (["pg-cloudflare"] as const) : []),
      ],
      ...(deployTarget === "cloudflare"
        ? {
            outputFileTracingIncludes: {
              "**/*": [
                "./node_modules/pg-cloudflare/dist/**",
                "./node_modules/pg-cloudflare/esm/**",
              ],
            },
          }
        : {}),
    }
  : {};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(process.env.SKIP_TYPE_CHECK === "1"
    ? {
        // CI already runs full typecheck; skip on constrained Docker hosts (Aliyun ECS).
        typescript: { ignoreBuildErrors: true },
      }
    : {}),
  ...dockerConfig,
};

export default nextConfig;

if (deployTarget === "cloudflare") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}
