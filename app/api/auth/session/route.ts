// app/api/auth/session/route.ts
import { createSupabaseServerClient } from '@/lib/supabse/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface SessionResponse {
  user?: any;
  authenticated: boolean;
  token?: string;
  note?: string;
  message?: string;
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = await createSupabaseServerClient();

    console.log('세션 API 호출됨');

    // 모든 쿠키 로깅
    const allCookies = cookieStore.getAll();
    console.log(
      '요청에 포함된 쿠키들:',
      allCookies.map((c) => c.name)
    );

    // 헤더에서 인증 토큰 가져오기
    const authHeader = request.headers.get('Authorization');
    const tokenFromHeader = authHeader?.replace('Bearer ', '');

    // Supabase 전용 쿠키 찾기
    const supabaseCookies = allCookies.filter(
      (cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('-auth-token')
    );

    let userData = null;
    let accessToken = null;

    // 1. 헤더의 토큰 사용 시도
    if (tokenFromHeader) {
      console.log('헤더에서 토큰 발견, 검증 시도');
      const { data, error } = await supabase.auth.getUser(tokenFromHeader);
      if (!error && data.user) {
        userData = data.user;
        accessToken = tokenFromHeader;
      }
    }

    // 2. 세션 API 시도 (Supabase 쿠키 사용)
    if (!userData && supabaseCookies.length > 0) {
      console.log('Supabase 쿠키 발견, 세션 조회 시도');
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session) {
        userData = data.session.user;
        accessToken = data.session.access_token;
      }
    }

    // 3. 마지막으로 currentUser 쿠키 사용 시도
    let cookieUserData = null;
    const currentUserCookie = cookieStore.get('currentUser');
    if (currentUserCookie && currentUserCookie.value) {
      try {
        console.log('currentUser 쿠키 발견, 사용자 정보 파싱');
        cookieUserData = JSON.parse(currentUserCookie.value);
      } catch (e) {
        console.error('currentUser 쿠키 파싱 오류:', e);
      }
    }

    // 응답 구성
    const responseData: SessionResponse = {
      authenticated: false,
    };

    if (userData) {
      responseData.user = userData;
      responseData.authenticated = true;

      if (accessToken) {
        responseData.token = accessToken;
      }
    } else if (cookieUserData) {
      // Supabase 세션은 없지만 currentUser 쿠키가 있는 경우
      responseData.user = cookieUserData;
      responseData.authenticated = true;
      responseData.note = '세션이 아닌 저장된 사용자 정보를 사용합니다';
    } else {
      responseData.authenticated = false;
      responseData.message = '인증된 세션을 찾을 수 없습니다';
    }

    // CORS 헤더 설정
    const origin = request.headers.get('origin') || '';
    const response = NextResponse.json(responseData);

    console.log(
      '응답 준비:',
      responseData.authenticated ? '인증됨' : '인증되지 않음',
      responseData.user ? '사용자 정보 포함' : '사용자 정보 없음'
    );

    if (origin.startsWith('chrome-extension://')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return response;
  } catch (error) {
    console.error('세션 API 처리 중 오류:', error);

    // 오류 응답
    const response = NextResponse.json(
      {
        authenticated: false,
        error: '세션 처리 중 오류가 발생했습니다',
      },
      { status: 500 }
    );

    // CORS 헤더 유지
    const origin = request.headers.get('origin') || '';
    if (origin.startsWith('chrome-extension://')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  }
}

export async function OPTIONS(request: Request) {
  // CORS 프리플라이트 요청 처리
  const origin = request.headers.get('origin') || '';
  const response = new NextResponse(null, { status: 204 });

  if (origin.startsWith('chrome-extension://')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}
