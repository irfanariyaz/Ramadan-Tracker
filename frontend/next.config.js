/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '8000',
                pathname: '/static/**',
            },
            {
                protocol: 'https',
                hostname: '**.onrender.com',
                pathname: '/static/**',
            },
            {
                protocol: 'https',
                hostname: '**.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },

};

module.exports = nextConfig;
