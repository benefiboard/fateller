// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabse/server';

export async function GET(request: Request) {
  try {
    console.log('세션 API 호출됨');
    const cookieStore = cookies();

    // 모든 쿠키 로깅 (디버깅용)
    console.log(
      '요청에 포함된 쿠키들:',
      cookieStore.getAll().map((c) => c.name)
    );

    // 헤더에서 인증 토큰 가져오기 (익스텐션에서 헤더로 전송할 수 있음)
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.replace('Bearer ', '');

    // 쿠키에서 액세스 토큰 가져오기
    const cookieToken = cookieStore.get('access_token')?.value;
    const currentUserCookie = cookieStore.get('currentUser')?.value;

    // 헤더 또는 쿠키에서 토큰 사용
    const accessToken = headerToken || cookieToken;

    console.log(
      '인증 토큰 확인:',
      accessToken ? `토큰 존재 (${accessToken.substring(0, 5)}...)` : '토큰 없음',
      '헤더에서:',
      !!headerToken,
      '쿠키에서:',
      !!cookieToken
    );

    if (!accessToken) {
      return NextResponse.json(
        { authenticated: false, error: '인증 토큰을 찾을 수 없습니다' },
        { status: 401 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // 토큰 검증
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      console.error('토큰 검증 오류:', error.message);
      return NextResponse.json({ authenticated: false, error: error.message }, { status: 401 });
    }

    if (!data.user) {
      console.error('사용자 정보 없음');
      return NextResponse.json(
        { authenticated: false, error: '유효하지 않은 사용자' },
        { status: 401 }
      );
    }

    console.log('인증 성공:', data.user.id);

    // 사용자 정보 준비
    let user = data.user;

    // 사용자 데이터 쿠키가 있으면 사용
    if (currentUserCookie) {
      try {
        user = JSON.parse(currentUserCookie);
      } catch (e) {
        console.error('사용자 쿠키 파싱 오류:', e);
      }
    } else {
      // 데이터베이스에서 사용자 정보 가져오기
      const { data: userData, error: userError } = await supabase
        .from('userdata')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.warn('사용자 데이터 조회 오류:', userError.message);
      }

      if (userData) {
        user = userData;
      }
    }

    // CORS 헤더 설정
    const response = NextResponse.json({
      authenticated: true,
      user,
      token: accessToken,
    });

    const origin = request.headers.get('origin');
    if (origin) {
      console.log('요청 출처:', origin);
      // 모든 출처 허용 (개발 중에만 사용하세요!)
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  } catch (error: any) {
    console.error('세션 조회 오류:', error?.message || error);
    return NextResponse.json(
      {
        authenticated: false,
        error: '세션 조회 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: Request) {
  // CORS 프리플라이트 요청 처리
  const origin = request.headers.get('origin');

  const response = new NextResponse(null, { status: 204 });
  if (origin) {
    // 모든 출처 허용 (개발 중에만 사용하세요!)
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}
