import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
    //  Allowed Diverse Configuration
    allowedDevOrigins: ["192.168.2.104",],

}

export default withNextIntl(nextConfig)
