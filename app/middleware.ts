import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 요청 출처 확인
  const origin = request.headers.get('origin') || '';

  // API 경로만 처리
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();

    // 허용할 출처 목록
    const allowedOrigins = [
      'https://www.brainlabeling.com',
      'http://localhost:3000',
      // 익스텐션 ID는 개발 후 확인 필요
      // 현재는 모든 익스텐션 허용 (개발용)
      origin.startsWith('chrome-extension://') ? origin : null,
    ].filter(Boolean);

    // 허용된 출처인 경우에만 CORS 헤더 설정
    if (allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  }

  return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: ['/api/:path*'],
};
