// app/api/memos/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabse/server';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const supabase = await createSupabaseServerClient();

    // 헤더에서 인증 토큰 가져오기
    const authHeader = request.headers.get('Authorization');
    const tokenFromHeader = authHeader?.replace('Bearer ', '');

    // 쿠키에서 토큰 가져오기
    const tokenFromCookie = cookieStore.get('access_token')?.value;

    // 헤더 또는 쿠키의 토큰 사용
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return NextResponse.json({ error: '인증 토큰이 없습니다' }, { status: 401 });
    }

    // 토큰 검증으로 사용자 정보 가져오기
    const { data: userData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !userData?.user) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 });
    }

    const user_id = userData.user.id;

    // 요청 본문 파싱
    const requestData = await request.json();

    // AI 분석 결과
    const aiAnalysisResult = requestData.aiAnalysisResult;

    if (!aiAnalysisResult || !aiAnalysisResult.title) {
      return NextResponse.json(
        { error: 'AI 분석 결과가 없거나 유효하지 않습니다' },
        { status: 400 }
      );
    }

    // 메모 데이터 구성
    const memoData = {
      user_id: user_id,
      title: aiAnalysisResult.title,
      tweet_main: aiAnalysisResult.tweet_main,
      hashtags: aiAnalysisResult.hashtags || [],
      thread: aiAnalysisResult.thread || [],
      original_title: requestData.originalTitle || '',
      original_image: requestData.originalImage || '',
      original_text: requestData.text || '',
      original_url: requestData.isUrl ? requestData.sourceUrl : '',
      category: aiAnalysisResult.labeling?.category || '미분류',
      keywords: aiAnalysisResult.labeling?.keywords || [],
      key_sentence: aiAnalysisResult.labeling?.key_sentence || '',
      purpose: requestData.purpose || '일반',
      source_id: requestData.sourceId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes: 0,
      retweets: 0,
      replies: 0,
      has_embedding: false,
    };

    // 메모 저장
    const { data: newMemo, error: insertError } = await supabase
      .from('memos')
      .insert(memoData)
      .select();

    if (insertError) {
      console.error('메모 저장 오류:', insertError);
      return NextResponse.json(
        { error: `메모 저장 오류: ${insertError.message}` },
        { status: 500 }
      );
    }

    // 크레딧 정보 가져오기
    let creditsRemaining = 10; // 기본값

    try {
      // 크레딧 정보 가져오기
      const { data: creditData } = await supabase.rpc('get_user_credits', {
        uid: user_id,
      });

      if (creditData) {
        creditsRemaining = creditData;
      }
    } catch (creditError) {
      console.error('크레딧 정보 조회 오류:', creditError);
    }

    // 응답 생성
    const response = NextResponse.json({
      id: newMemo[0].id,
      title: newMemo[0].title,
      message: '메모가 성공적으로 저장되었습니다',
      credits: {
        remaining: creditsRemaining,
      },
    });

    // CORS 헤더 설정
    const origin = request.headers.get('origin');
    if (origin?.startsWith('chrome-extension://')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return response;
  } catch (error: any) {
    console.error('메모 생성 오류:', error);
    return NextResponse.json(
      { error: `메모 생성 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
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
