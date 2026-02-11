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
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
// https://imagedelivery.net/AXBOLKJ2nB6B4T-JIYE73g/f129e_urban_classics_heavy_oversized_t-shirt_urban_classics_heavy_oversized_t-shirt_green_front/width=538,height=415,quality=90,fit=pad,format=webp