/** @type {import('next').NextConfig} */

const apiInternalUrl = process.env.API_INTERNAL_URL || 'http://127.0.0.1:7788';

const nextConfig = {
    reactStrictMode: false,
    output: 'standalone',
    images: { unoptimized: true },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${apiInternalUrl}/api/:path*`,
            },
        ];
    },
};

export default nextConfig;
