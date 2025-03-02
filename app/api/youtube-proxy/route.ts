import { NextResponse, type NextRequest } from 'next/server';

// CORS 헤더 설정을 위한 헬퍼 함수
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// OPTIONS 요청 처리 (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const youtubeUrl = searchParams.get('url');

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL이 필요합니다' },
        { status: 400, headers: corsHeaders() }
      );
    }

    console.log(`프록시 요청: ${youtubeUrl}`);

    // YouTube로 요청 전송
    const response = await fetch(youtubeUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        Origin: 'https://www.youtube.com',
        Referer: 'https://www.youtube.com/',
      },
    });

    // YouTube 응답 내용 가져오기
    const contentType = response.headers.get('Content-Type') || 'text/plain';
    const data = await response.text();

    console.log(
      `응답 코드: ${response.status}, 콘텐츠 타입: ${contentType}, 데이터 길이: ${data.length}`
    );

    // 응답 반환
    return new NextResponse(data, {
      status: response.status,
      headers: {
        ...corsHeaders(),
        'Content-Type': contentType,
      },
    });
  } catch (error: any) {
    console.error('프록시 오류:', error);
    return NextResponse.json(
      { error: error.message || '프록시 요청 처리 중 오류가 발생했습니다' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
