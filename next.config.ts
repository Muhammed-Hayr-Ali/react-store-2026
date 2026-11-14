import { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.2.2", "192.168.4.4"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.waplog.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
