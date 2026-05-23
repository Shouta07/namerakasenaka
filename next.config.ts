import type { NextConfig } from "next";

const config: NextConfig = {
  typedRoutes: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async redirects() {
    // The /demo/* tour has been merged into the real role-prefixed routes.
    // These redirects keep any old links functional.
    return [
      { source: "/demo", destination: "/", permanent: false },
      { source: "/demo/client", destination: "/c/progress", permanent: false },
      {
        source: "/demo/client/progress/compare",
        destination: "/c/progress/compare",
        permanent: false,
      },
      { source: "/demo/client/meals", destination: "/c/meals", permanent: false },
      {
        source: "/demo/client/calendar",
        destination: "/c/calendar",
        permanent: false,
      },
      { source: "/demo/therapist", destination: "/t/today", permanent: false },
      {
        source: "/demo/therapist/calendar",
        destination: "/t/calendar",
        permanent: false,
      },
      {
        source: "/demo/therapist/clients/:clientId",
        destination: "/t/clients/:clientId",
        permanent: false,
      },
      { source: "/demo/admin", destination: "/admin/dashboard", permanent: false },
      {
        source: "/demo/admin/calendar",
        destination: "/admin/calendar",
        permanent: false,
      },
      { source: "/demo/nutritionist", destination: "/n/queue", permanent: false },
    ];
  },
};

export default config;
