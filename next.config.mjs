import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
    //  Allowed Diverse Configuration
    allowedDevOrigins: ["192.168.2.103", "192.168.2.104", "192.168.3.3"],

}

export default withNextIntl(nextConfig)
