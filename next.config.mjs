// next.config.mjs

import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    // 기존 buildExcludes 옵션을 exclude로 변경
    exclude: [/middleware-manifest\.json$/],
    // 외부 링크 처리를 위한 runtimeCaching 설정
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/link\.coupang\.com/,
        handler: 'NetworkOnly',
        options: {
          backgroundSync: {
            name: 'external-links',
            options: {
              maxRetentionTime: 60 * 60 * 24, // 24시간
            },
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['timezone'],
  },
  env: {
    TZ: 'UTC',
  },
  images: {
    domains: [
      'i.ytimg.com', // YouTube 썸네일
      'storage.googleapis.com', // Google Storage (가능한 Supabase 저장소)
      'lh3.googleusercontent.com', // Google 관련 이미지
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'platform-lookaside.fbsbx.com',
      'contents.kyobobook.co.kr',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'stllwgszmjhoifabsyfd.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  transpilePackages: ['youtube-transcript-api', 'cheerio'],
};

export default withPWA(nextConfig);
