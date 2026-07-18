import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.razorpay.com https://*.vercel-storage.com https://vitals.vercel-insights.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.instagram.com https://api.razorpay.com https://checkout.razorpay.com",
      "media-src 'self' https: blob:",
    ].join("; "),
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@phonepe-pg/pg-sdk-node", "heic-decode", "libheif-js", "sharp"],
  async redirects() {
    return [
      {
        source: "/portfolio",
        destination: "/for-interior-designers",
        permanent: true,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      {
        pathname: "/api/artwork-image/**",
      },
      {
        pathname: "/artworks/**",
      },
      {
        pathname: "/portraits/**",
      },
      {
        pathname: "/site/**",
      },
      {
        pathname: "/hero-banner.jpg",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.private.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
  async headers() {
    // Allow same-origin PDF embeds on the trade page; keep DENY elsewhere.
    const documentHeaders = securityHeaders.map((header) =>
      header.key === "X-Frame-Options"
        ? { key: "X-Frame-Options", value: "SAMEORIGIN" }
        : header,
    );

    return [
      {
        source: "/api/site-document/:path*",
        headers: documentHeaders,
      },
      {
        source: "/((?!api/site-document/).*)",
        headers: securityHeaders,
      },
    ];
  },
};

const sentryBuildEnabled = Boolean(
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
);

export default sentryBuildEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      disableLogger: true,
      widenClientFileUpload: true,
    })
  : nextConfig;
