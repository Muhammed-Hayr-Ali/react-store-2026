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
        hostname: "emdadx.com",
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
        hostname: "tadirjanu.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "zouqsweet.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
