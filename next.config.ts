
import type {NextConfig} from 'next';
import _withPWA from 'next-pwa';

const withPWA = _withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

// Replace 'YOUR_REPOSITORY_NAME' with the actual name of your GitHub repository
// if you are deploying to username.github.io/YOUR_REPOSITORY_NAME
// If deploying to username.github.io or a custom domain, these can be empty strings or removed.
const repoName = 'trackIt'; // CHANGE THIS
const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export', // Enable static export
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Recommended for static exports
  },
  // basePath and assetPrefix are needed if deploying to a subpath on GitHub Pages
  // e.g., your-username.github.io/your-repository-name
  // If deploying to the root (e.g., your-username.github.io or a custom domain),
  // you can remove basePath and assetPrefix or set them to an empty string.
  basePath: isProd && repoName !== '' ? `/${repoName}` : '',
  assetPrefix: isProd && repoName !== '' ? `/${repoName}/` : '',
};

export default withPWA(nextConfig);
