import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@x4/shared", "@x4/auth"],
  experimental: {
    optimizePackageImports: ["@x4/shared"],
  },
};

export default nextConfig;
