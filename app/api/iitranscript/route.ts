// app/api/iitranscript/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';

export async function GET(request: NextRequest) {
  try {
    const videoId = request.nextUrl.searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: '비디오 ID가 필요합니다' }, { status: 400 });
    }

    // Innertube 인스턴스 생성
    const yt = await Innertube.create({ generate_session_locally: true });

    // 비디오 정보 가져오기
    const videoInfo = await yt.getInfo(videoId);

    try {
      // 자막 정보 가져오기
      const transcriptInfo = await videoInfo.getTranscript();

      // 안전하게 속성에 접근하기 위한 옵셔널 체이닝 사용
      const transcript = transcriptInfo?.transcript?.content?.body?.initial_segments || [];

      // 원본 데이터 반환
      return NextResponse.json({
        videoTitle: videoInfo.basic_info.title,
        selectedLanguage: transcriptInfo?.selectedLanguage || 'unknown',
        transcript: transcript,
      });
    } catch (transcriptError) {
      console.error('Transcript error:', transcriptError);

      // 자막을 가져오지 못한 경우
      return NextResponse.json(
        {
          videoTitle: videoInfo.basic_info.title,
          error: '이 동영상에서 자막을 가져올 수 없습니다',
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '동영상 정보를 가져올 수 없습니다' }, { status: 500 });
  }
}
