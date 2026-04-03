import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase API timeout for Gemini report generation
  serverExternalPackages: ["@google/generative-ai"],
};

export default nextConfig;
