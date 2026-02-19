import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "solarsys-app.vercel.app",
          },
        ],
        destination: "https://solarsystemsim.ethandellaposta.dev/:path*",
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
