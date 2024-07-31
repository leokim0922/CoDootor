/** @type {import('next').NextConfig} */
const nextConfig = {
    // This ensures that all our internal requests are forwarded to the Express REST API through the middleware
    async rewrites() {
        return [
            {
                source: '/api/auth/:path',
                destination: '/api/auth/:path*',
            },
            {
            source: '/api/:path*',
            destination: 'http://host.docker.internal:5001/:path*',
            },
        ];
    },
};

export default nextConfig;
