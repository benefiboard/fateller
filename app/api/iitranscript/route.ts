// // app/api/iitranscript/route.ts
// import { Innertube } from 'youtubei.js';
// import { NextResponse } from 'next/server';

// export async function GET(request: Request) {
//   // 쿼리 파라미터 가져오기
//   const { searchParams } = new URL(request.url);
//   const videoId = searchParams.get('videoId');
//   const language = searchParams.get('language');

//   if (!videoId) {
//     return NextResponse.json({ error: '비디오 ID가 필요합니다' }, { status: 400 });
//   }

//   try {
//     // YouTube 클라이언트 초기화
//     const yt = await Innertube.create({
//       generate_session_locally: true,
//     });

//     // 비디오 정보 가져오기 시도
//     try {
//       const videoInfo = await yt.getInfo(videoId);

//       // 기본 트랜스크립트 가져오기 시도
//       try {
//         const defaultTranscriptInfo = await videoInfo.getTranscript();

//         // 언어가 지정된 경우, 해당 트랜스크립트 가져오기 시도
//         if (language && language.trim() !== '') {
//           try {
//             const targetTranscriptInfo = await defaultTranscriptInfo.selectLanguage(language);

//             return NextResponse.json({
//               videoTitle: videoInfo.basic_info.title,
//               language: targetTranscriptInfo.selectedLanguage,
//               segments: targetTranscriptInfo.transcript.content.body.initial_segments,
//               availableLanguages: defaultTranscriptInfo.languages,
//             });
//           } catch (langError) {
//             console.error(
//               `${language} 트랜스크립트를 가져오지 못했습니다. 기본값으로 대체합니다:`,
//               langError
//             );

//             // 지정된 언어를 사용할 수 없는 경우 기본 트랜스크립트로 대체
//             return NextResponse.json({
//               videoTitle: videoInfo.basic_info.title,
//               language: defaultTranscriptInfo.selectedLanguage,
//               segments: defaultTranscriptInfo.transcript.content.body.initial_segments,
//               availableLanguages: defaultTranscriptInfo.languages,
//               warning: `${language} 트랜스크립트를 사용할 수 없습니다. 기본 트랜스크립트를 대신 제공합니다.`,
//             });
//           }
//         }

//         // 기본 트랜스크립트 반환
//         return NextResponse.json({
//           videoTitle: videoInfo.basic_info.title,
//           language: defaultTranscriptInfo.selectedLanguage,
//           segments: defaultTranscriptInfo.transcript.content.body.initial_segments,
//           availableLanguages: defaultTranscriptInfo.languages,
//         });
//       } catch (transcriptError) {
//         console.error('트랜스크립트를 가져오지 못했습니다:', transcriptError);
//         return NextResponse.json(
//           {
//             error: '트랜스크립트를 가져오지 못했습니다',
//             message: '이 비디오에는 트랜스크립트가 없거나 액세스할 수 없습니다.',
//             details: transcriptError.message,
//           },
//           { status: 404 }
//         );
//       }
//     } catch (videoError) {
//       console.error('비디오 정보를 가져오지 못했습니다:', videoError);

//       // 로그에 보이는 오류에 기반한 특별한 처리
//       if (
//         videoError.info &&
//         videoError.info.title &&
//         videoError.info.title.content === 'Course progress'
//       ) {
//         return NextResponse.json(
//           {
//             error: '지원되지 않는 비디오 유형',
//             message: '이 ID는 일반 비디오가 아닌 YouTube 코스를 참조하는 것 같습니다.',
//             details: '코스 콘텐츠는 현재 지원되지 않습니다.',
//           },
//           { status: 400 }
//         );
//       }

//       return NextResponse.json(
//         {
//           error: '비디오 정보를 가져오지 못했습니다',
//           message: '비디오 ID가 올바르지 않거나 비디오가 더 이상 존재하지 않을 수 있습니다.',
//           details: videoError.message,
//         },
//         { status: 404 }
//       );
//     }
//   } catch (error) {
//     console.error('트랜스크립트 가져오기 오류:', error);
//     return NextResponse.json(
//       {
//         error: '트랜스크립트 가져오기 실패',
//         message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
//       },
//       { status: 500 }
//     );
//   }
// }

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

    // 자막 정보 가져오기
    const transcriptInfo = await videoInfo.getTranscript();

    // 자막 데이터 반환
    return NextResponse.json({
      videoTitle: videoInfo.basic_info.title,
      selectedLanguage: transcriptInfo.selectedLanguage,
      transcript: transcriptInfo.transcript.content.body.initial_segments,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '자막을 가져올 수 없습니다' }, { status: 500 });
  }
}
