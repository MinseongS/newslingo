/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.arirang.com',
            },
        ],
    },
};

module.exports = nextConfig;