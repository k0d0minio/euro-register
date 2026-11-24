import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page except the previews reads the session cookie: plain dynamic
  // rendering, so redirect() and notFound() keep their HTTP status.
  // Cache Components is off on purpose (README, "Choix techniques").
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
