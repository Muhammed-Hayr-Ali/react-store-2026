import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://192.168.2.103:3000", "http://10.2.0.2:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.hp.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "eswgjctygmuiorismvyw.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "files.refurbed.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "caphore.sy",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.b3na.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.moshtare.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.damsouq.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.suar.me",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "miro.medium.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
<<<<<<< HEAD
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.google.com https://*.cloudflare.com",
              "style-src 'self' 'unsafe-inline' https://*.googleapis.com https://*.gstatic.com",
              "img-src 'self' blob: data: https:;",
              "font-src 'self' https://*.gstatic.com data:;",
              "connect-src 'self' https: wss:;",
              "media-src 'self' https:;",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
  poweredByHeader: false,
=======
>>>>>>> f36a4adfff5056eceaacf66323cb179b9952a5a2
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
