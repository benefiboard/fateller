module.exports = {
  siteUrl: 'https://brainlabeling.com',
  generateRobotsTxt: true,
  exclude: ['/~offline'], // PWA offline 페이지 제외
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
  },
  additionalPaths: async (config) => {
    const result = [
      // 메인 랜딩 페이지 (가장 중요)
      {
        loc: 'https://brainlabeling.com',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0, // 가장 높은 우선순위
      },
      // 메모 페이지
      {
        loc: 'https://brainlabeling.com/memo',
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9,
      },
      // 그 외 중요 페이지들
      {
        loc: 'https://brainlabeling.com/auth',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      },
      // 필요한 만큼 페이지 추가
    ];

    return result;
  },
};
