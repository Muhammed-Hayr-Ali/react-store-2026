import { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.3.1",
    "192.168.3.2",
    "192.168.3.3",
    "192.168.3.4",
    "192.168.3.5",
    "192.168.3.6",
    "192.168.3.7",
    "192.168.3.8",
    "192.168.3.9",
    "192.168.2.101",
    "192.168.2.102",
    "192.168.2.103",
    "192.168.2.104",
    "192.168.2.105",
    "192.168.2.106",
    "192.168.2.107",
    "192.168.2.108",
    "192.168.2.109",
    "10.80.61.175",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "cdn.waplog.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
}


  
  
  const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
