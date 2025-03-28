// app/api/auth/validate-session/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabse/server';

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 헤더에서 인증 토큰 가져오기
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 없습니다' }, { status: 401 });
    }

    // getSession() 대신 getUser() 사용 (Supabase 권장 방식)
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error('인증 오류:', error?.message);
      return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 });
    }

    // 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from('userdata')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('사용자 데이터 조회 오류:', userError);
    }

    // CORS 헤더 설정
    const response = NextResponse.json(userData || data.user);
    const origin = request.headers.get('origin');
    if (origin?.startsWith('chrome-extension://')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return response;
  } catch (error) {
    console.error('세션 검증 오류:', error);
    return NextResponse.json({ error: '세션 검증 중 오류가 발생했습니다' }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  // CORS 프리플라이트 요청 처리
  const origin = request.headers.get('origin');

  const response = new NextResponse(null, { status: 204 });
  if (origin?.startsWith('chrome-extension://')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}
