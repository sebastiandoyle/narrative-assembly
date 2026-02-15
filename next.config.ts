import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  outputFileTracingIncludes: {
    "/api/search": ["./data/**/*.json"],
    "/api/reddit-topics": ["./data/**/*.json"],
  },
};

export default nextConfig;
