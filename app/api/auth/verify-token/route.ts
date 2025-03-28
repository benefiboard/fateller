import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabse/server';

export async function POST(request: Request) {
  try {
    // 요청 본문에서 토큰 가져오기
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: '토큰이 제공되지 않았습니다' }, { status: 400 });
    }

    // Supabase 클라이언트 생성
    const supabase = await createSupabaseServerClient();

    // 세션 검증 (주의: 토큰을 직접 검증하는 API가 아닌 현재 세션을 설정하는 방식)
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 });
    }

    // 사용자 상세 정보 가져오기 (userdata 테이블에서)
    const { data: userData, error: userError } = await supabase
      .from('userdata')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('사용자 데이터 조회 오류:', userError);
    }

    // 응답 생성
    const response = NextResponse.json({
      authenticated: true,
      user: userData || data.user,
    });

    // CORS 헤더 추가 (크롬 익스텐션 지원)
    const origin = request.headers.get('origin') || '';
    if (origin.startsWith('chrome-extension://')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    return response;
  } catch (error: any) {
    console.error('토큰 검증 오류:', error);
    return NextResponse.json({ error: '토큰 검증 중 오류가 발생했습니다' }, { status: 500 });
  }
}

// OPTIONS 요청 처리 (CORS preflight 요청)
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || '';

  const response = new NextResponse(null, { status: 204 });

  if (origin.startsWith('chrome-extension://')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}
