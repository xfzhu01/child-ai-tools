import type { NextConfig } from "next";

const deployTarget = process.env.DEPLOY_TARGET ?? "vercel";

const cloudflareConfig: NextConfig =
  deployTarget === "cloudflare"
    ? {
        output: "standalone",
        serverExternalPackages: [
          "pg",
          "pg-cloudflare",
          "@prisma/client",
          "@prisma/adapter-pg",
        ],
        outputFileTracingIncludes: {
          "**/*": [
            "./node_modules/pg-cloudflare/dist/**",
            "./node_modules/pg-cloudflare/esm/**",
          ],
        },
      }
    : {};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...cloudflareConfig,
};

export default nextConfig;

if (deployTarget === "cloudflare") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
  initOpenNextCloudflareForDev();
}
