// app/api/extract-and-analyze/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { YoutubeTranscript } from 'youtube-transcript';

// 크롬 실행 경로 (로컬 개발용)
const CHROME_PATH =
  process.env.CHROME_PATH ||
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/google-chrome');

// YouTube API Key (Vercel 환경변수에 설정 필요)
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

// 환경 확인 함수
const isVercelProduction = () => {
  return process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production';
};

// 유튜브 URL 확인 함수
function isYoutubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(url);
}

// 유튜브 비디오 ID 추출 함수
function extractYoutubeId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7]?.length === 11 ? match[7] : null;
}

// 공식 YouTube API를 사용하여 자막 가져오기 (Vercel 환경용)
// 개선된 YouTube API 자막 추출 함수
async function fetchYoutubeTranscriptWithAPI(videoId: string): Promise<string> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API 키가 설정되지 않았습니다. 환경 변수를 확인하세요.');
  }

  try {
    console.log('YouTube API로 자막 목록 가져오기 시작...');

    // 1. 자막 목록 가져오기
    const captionsListResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    if (!captionsListResponse.ok) {
      const errorData = await captionsListResponse.json();
      console.error('YouTube API 오류:', errorData);
      throw new Error(`YouTube API 오류: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const captionsData = await captionsListResponse.json();

    if (!captionsData.items || captionsData.items.length === 0) {
      console.log('자막이 없거나 접근할 수 없습니다.');
      throw new Error('이 동영상에는 자막이 없거나 접근할 수 없습니다.');
    }

    console.log(`자막 목록 가져오기 성공: ${captionsData.items.length}개 발견`);

    // 2. 자막 언어 우선순위에 따라 선택 (한국어 > 영어 > 첫 번째 항목)
    let selectedCaption = null;

    // 언어 코드로 자막 찾기
    for (const lang of ['ko', 'en']) {
      const caption = captionsData.items.find((item: any) => item.snippet.language === lang);
      if (caption) {
        selectedCaption = caption;
        console.log(`${lang} 언어 자막 선택됨`);
        break;
      }
    }

    // 언어를 찾지 못한 경우 첫 번째 항목 사용
    if (!selectedCaption && captionsData.items.length > 0) {
      selectedCaption = captionsData.items[0];
      console.log(`첫 번째 자막 선택됨: ${selectedCaption.snippet.language}`);
    }

    if (!selectedCaption) {
      throw new Error('자막을 선택할 수 없습니다.');
    }

    // 3. 영상 정보 가져오기
    const videoInfoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );

    const videoInfo = await videoInfoResponse.json();

    if (!videoInfo.items || videoInfo.items.length === 0) {
      throw new Error('비디오 정보를 찾을 수 없습니다.');
    }

    // 4. TimedText API로 자막 가져오기 (공개 자막인 경우)
    const lang = selectedCaption.snippet.language;
    const timedTextUrl = `https://www.youtube.com/api/timedtext?lang=${lang}&v=${videoId}`;

    console.log(`TimedText API URL: ${timedTextUrl}`);
    const transcriptResponse = await fetch(timedTextUrl);
    const transcriptXml = await transcriptResponse.text();

    // 응답 내용 로깅 (디버깅용)
    console.log('TimedText API 응답 길이:', transcriptXml.length);
    console.log('TimedText API 응답 일부:', transcriptXml.substring(0, 200));

    // 5. XML 파싱 - 개선된 방식
    let transcriptLines: string[] = [];

    // 방법 1: 정규 표현식으로 추출
    const textRegex = /<text[^>]*>(.*?)<\/text>/g;
    let match;

    while ((match = textRegex.exec(transcriptXml)) !== null) {
      // HTML 엔티티 디코딩
      let text = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();

      if (text) {
        transcriptLines.push(text);
      }
    }

    // 방법 1이 실패하면 방법 2: DOMParser 사용
    if (transcriptLines.length === 0 && transcriptXml.length > 0) {
      console.log('정규식 방법 실패, DOMParser 시도...');

      try {
        // 서버 환경에서는 JSDOM 사용
        const dom = new JSDOM(transcriptXml);
        const textElements = dom.window.document.querySelectorAll('text');

        for (let i = 0; i < textElements.length; i++) {
          const text = textElements[i].textContent?.trim();
          if (text) {
            transcriptLines.push(text);
          }
        }
      } catch (parseError) {
        console.error('JSDOM 파싱 실패:', parseError);
      }
    }

    // 방법 3: 특수 케이스 - 자막이 다른 형식일 수 있음
    if (transcriptLines.length === 0 && transcriptXml.includes('<transcript_list>')) {
      console.log('자막 목록 형식 감지, 개별 자막 URL 추출 시도...');

      // 사용 가능한 첫 번째 자막 트랙 URL 추출
      const trackRegex = /<track[^>]*lang_code="([^"]*)"[^>]*>/g;
      let trackMatch;
      let langCode = null;

      while ((trackMatch = trackRegex.exec(transcriptXml)) !== null) {
        langCode = trackMatch[1];
        if (langCode) break;
      }

      if (langCode) {
        console.log(`개별 자막 트랙 찾음: ${langCode}`);
        // 찾은 언어로 다시 시도
        const newTimedTextUrl = `https://www.youtube.com/api/timedtext?lang=${langCode}&v=${videoId}`;

        const newResponse = await fetch(newTimedTextUrl);
        const newXml = await newResponse.text();

        console.log(`새 자막 URL 응답 길이:`, newXml.length);

        // 새 XML에서 자막 추출 재시도
        const newTextRegex = /<text[^>]*>(.*?)<\/text>/g;
        let newMatch;

        while ((newMatch = newTextRegex.exec(newXml)) !== null) {
          const text = newMatch[1]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
          if (text) {
            transcriptLines.push(text);
          }
        }
      }
    }

    // 자막이 여전히 없으면, 영상 제목과 설명으로 대체
    if (transcriptLines.length === 0) {
      console.log('자막을 추출할 수 없어 영상 정보로 대체합니다.');

      const title = videoInfo.items[0].snippet.title || '';
      const description = videoInfo.items[0].snippet.description || '';

      const infoText = `${title}\n\n${description}`.trim();

      if (infoText.length > 0) {
        console.log('영상 정보를 사용하여 대체 콘텐츠 생성');
        return infoText;
      }

      throw new Error('자막과 영상 정보 모두 추출할 수 없습니다.');
    }

    console.log(`자막 추출 성공: ${transcriptLines.length}개 라인`);

    // 6. 자막 텍스트 결합
    return transcriptLines.join(' ').replace(/\s+/g, ' ').trim();
  } catch (error: any) {
    console.error('YouTube API 오류:', error);
    throw new Error(`YouTube API를 통한 자막 추출 실패: ${error.message}`);
  }
}

// TimedText XML 파싱 함수
function parseTimedTextXml(xml: string): string[] {
  const lines: string[] = [];

  // 정규식으로 text 태그 추출
  const textRegex = /<text[^>]*>(.*?)<\/text>/g;
  let match;

  while ((match = textRegex.exec(xml)) !== null) {
    // HTML 엔티티 디코딩
    let text = match[1]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();

    if (text) {
      lines.push(text);
    }
  }

  return lines;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (!text) {
    return NextResponse.json({ error: '텍스트가 필요합니다' }, { status: 400 });
  }

  try {
    // URL 여부 확인
    let isUrl = false;
    try {
      new URL(text);
      isUrl = text.trim().indexOf('\n') === -1 && /^https?:\/\//i.test(text.trim());
    } catch (e) {
      isUrl = false;
    }

    // URL이 아니면 그대로 반환 (클라이언트에서 labeling API 호출)
    if (!isUrl) {
      return NextResponse.json({
        content: text,
        isExtracted: false,
      });
    }

    // 네이버 블로그 체크
    if (isUrl && /blog\.naver\.com/i.test(text)) {
      return NextResponse.json(
        {
          error: '네이버 블로그는 지원되지 않습니다. 내용을 직접 복사하여 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 유튜브 URL 확인
    if (isYoutubeUrl(text)) {
      const videoId = extractYoutubeId(text);
      if (!videoId) {
        return NextResponse.json({ error: '유효한 유튜브 URL이 아닙니다' }, { status: 400 });
      }

      let transcriptText = '';
      let error = null;

      // 환경에 따라 다른 방식으로 자막 추출
      if (isVercelProduction()) {
        // Vercel 환경: 공식 YouTube API 사용
        try {
          console.log('Vercel 환경 감지, YouTube API 사용');
          transcriptText = await fetchYoutubeTranscriptWithAPI(videoId);
          console.log('YouTube API로 자막 추출 성공');
        } catch (apiError: any) {
          error = apiError;
          console.error('YouTube API 자막 추출 실패:', apiError.message);
        }
      } else {
        // 로컬 환경: YoutubeTranscript 라이브러리 사용
        try {
          console.log('로컬 환경, YoutubeTranscript 라이브러리 사용');
          const transcript = await YoutubeTranscript.fetchTranscript(videoId);

          if (!transcript || transcript.length === 0) {
            throw new Error('자막을 가져올 수 없습니다');
          }

          // 자막 텍스트 결합
          transcriptText = transcript
            .map((item) => item.text)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          console.log('YoutubeTranscript 라이브러리로 자막 추출 성공');
        } catch (libError: any) {
          error = libError;
          console.error('YoutubeTranscript 라이브러리 자막 추출 실패:', libError.message);
        }
      }

      // 자막 추출 성공 시 반환
      if (transcriptText) {
        return NextResponse.json({
          content: transcriptText,
          sourceUrl: text,
          isExtracted: true,
          type: 'youtube',
        });
      } else {
        // 자막 추출 실패 시 오류 반환
        return NextResponse.json(
          {
            error: `이 영상에서 자막을 가져올 수 없습니다: ${error?.message || '알 수 없는 오류'}`,
          },
          { status: 400 }
        );
      }
    }

    // 일반 웹페이지 콘텐츠 추출 (최적화: HTML 추출 후 즉시 브라우저 종료)
    let browser = null;
    let html = '';

    try {
      // 환경에 따른 브라우저 시작
      if (isVercelProduction()) {
        console.log('Vercel 환경에서 실행 중...');
        const executablePath = await chromium.executablePath(
          'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
        );

        browser = await puppeteerCore.launch({
          executablePath,
          args: chromium.args,
          headless: chromium.headless,
          defaultViewport: chromium.defaultViewport,
        });
      } else {
        console.log('로컬 환경에서 실행 중...', CHROME_PATH);
        browser = await puppeteerCore.launch({
          executablePath: CHROME_PATH,
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      }

      const page = await browser.newPage();

      // 리소스 차단하여 속도 향상
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'font', 'media', 'stylesheet'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // 페이지 로드
      await page.goto(text, { waitUntil: 'domcontentloaded', timeout: 25000 });

      // HTML 콘텐츠 가져오기
      html = await page.content();

      // 중요: HTML을 얻은 즉시 브라우저 종료
      await browser.close();
      browser = null;
    } catch (error: any) {
      // 브라우저 관련 오류 처리
      if (browser) {
        await browser.close();
        browser = null;
      }

      console.error('웹페이지 로딩 오류:', error);
      return NextResponse.json(
        { error: error.message || '웹페이지를 로드할 수 없습니다' },
        { status: 500 }
      );
    }

    // 브라우저 없이 Readability로 콘텐츠 추출
    try {
      const dom = new JSDOM(html, { url: text });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article || !article.textContent || article.textContent.length < 100) {
        throw new Error('콘텐츠를 충분히 추출할 수 없습니다. 직접 내용을 입력해주세요.');
      }

      // 추출된 텍스트 정제
      const extractedContent = article.textContent
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim();

      // 추출 성공 응답
      return NextResponse.json({
        content: extractedContent,
        sourceUrl: text,
        title: article.title || '',
        isExtracted: true,
        type: 'webpage',
      });
    } catch (error: any) {
      console.error('콘텐츠 추출 오류:', error);
      return NextResponse.json(
        { error: error.message || '웹페이지 처리 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('처리 오류:', error);
    return NextResponse.json(
      {
        error: error.message || '처리 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

// //일반 url 굿굿// app/api/extract-and-analyze/route.ts
// import { NextResponse, type NextRequest } from 'next/server';
// import puppeteerCore from 'puppeteer-core';
// import chromium from '@sparticuz/chromium-min';
// import { Readability } from '@mozilla/readability';
// import { JSDOM } from 'jsdom';
// import { YoutubeTranscript } from 'youtube-transcript';

// // 크롬 실행 경로 (로컬 개발용)
// const CHROME_PATH =
//   process.env.CHROME_PATH ||
//   (process.platform === 'win32'
//     ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
//     : process.platform === 'darwin'
//     ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
//     : '/usr/bin/google-chrome');

// // 환경 확인 함수
// const isVercelProduction = () => {
//   return process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production';
// };

// // 유튜브 URL 확인 함수
// function isYoutubeUrl(url: string): boolean {
//   return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(url);
// }

// // 유튜브 비디오 ID 추출 함수
// function extractYoutubeId(url: string): string | null {
//   const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[7]?.length === 11 ? match[7] : null;
// }

// export const dynamic = 'force-dynamic';
// export const maxDuration = 60;

// export async function POST(request: NextRequest) {
//   const { text } = await request.json();

//   if (!text) {
//     return NextResponse.json({ error: '텍스트가 필요합니다' }, { status: 400 });
//   }

//   try {
//     // URL 여부 확인
//     let isUrl = false;
//     try {
//       new URL(text);
//       isUrl = text.trim().indexOf('\n') === -1 && /^https?:\/\//i.test(text.trim());
//     } catch (e) {
//       isUrl = false;
//     }

//     // URL이 아니면 그대로 반환 (클라이언트에서 labeling API 호출)
//     if (!isUrl) {
//       return NextResponse.json({
//         content: text,
//         isExtracted: false,
//       });
//     }

//     // 네이버 블로그 체크
//     if (isUrl && /blog\.naver\.com/i.test(text)) {
//       return NextResponse.json(
//         {
//           error: '네이버 블로그는 지원되지 않습니다. 내용을 직접 복사하여 입력해주세요.',
//         },
//         { status: 400 }
//       );
//     }

//     // 유튜브 URL 확인
//     if (isYoutubeUrl(text)) {
//       const videoId = extractYoutubeId(text);
//       if (!videoId) {
//         return NextResponse.json({ error: '유효한 유튜브 URL이 아닙니다' }, { status: 400 });
//       }

//       try {
//         // youtube-transcript-api를 사용하여 자막 가져오기
//         const transcript = await YoutubeTranscript.fetchTranscript(videoId);

//         if (!transcript || transcript.length === 0) {
//           throw new Error('자막을 가져올 수 없습니다');
//         }

//         // 자막 텍스트 결합
//         const transcriptText = transcript
//           .map((item) => item.text)
//           .join(' ')
//           .replace(/\s+/g, ' ')
//           .trim();

//         return NextResponse.json({
//           content: transcriptText,
//           sourceUrl: text,
//           isExtracted: true,
//           type: 'youtube',
//         });
//       } catch (error: any) {
//         return NextResponse.json(
//           {
//             error: '이 영상에서 자막을 가져올 수 없습니다: ' + error.message,
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // 일반 웹페이지 콘텐츠 추출 (최적화: HTML 추출 후 즉시 브라우저 종료)
//     let browser = null;
//     let html = '';

//     try {
//       // 환경에 따른 브라우저 시작
//       if (isVercelProduction()) {
//         console.log('Vercel 환경에서 실행 중...');
//         const executablePath = await chromium.executablePath(
//           'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
//         );

//         browser = await puppeteerCore.launch({
//           executablePath,
//           args: chromium.args,
//           headless: chromium.headless,
//           defaultViewport: chromium.defaultViewport,
//         });
//       } else {
//         console.log('로컬 환경에서 실행 중...', CHROME_PATH);
//         browser = await puppeteerCore.launch({
//           executablePath: CHROME_PATH,
//           headless: true,
//           args: ['--no-sandbox', '--disable-setuid-sandbox'],
//         });
//       }

//       const page = await browser.newPage();

//       // 리소스 차단하여 속도 향상
//       await page.setRequestInterception(true);
//       page.on('request', (req) => {
//         const resourceType = req.resourceType();
//         if (['image', 'font', 'media', 'stylesheet'].includes(resourceType)) {
//           req.abort();
//         } else {
//           req.continue();
//         }
//       });

//       // 페이지 로드
//       await page.goto(text, { waitUntil: 'domcontentloaded', timeout: 25000 });

//       // HTML 콘텐츠 가져오기
//       html = await page.content();

//       // 중요: HTML을 얻은 즉시 브라우저 종료
//       await browser.close();
//       browser = null;
//     } catch (error: any) {
//       // 브라우저 관련 오류 처리
//       if (browser) {
//         await browser.close();
//         browser = null;
//       }

//       console.error('웹페이지 로딩 오류:', error);
//       return NextResponse.json(
//         { error: error.message || '웹페이지를 로드할 수 없습니다' },
//         { status: 500 }
//       );
//     }

//     // 브라우저 없이 Readability로 콘텐츠 추출
//     try {
//       const dom = new JSDOM(html, { url: text });
//       const reader = new Readability(dom.window.document);
//       const article = reader.parse();

//       if (!article || !article.textContent || article.textContent.length < 100) {
//         throw new Error('콘텐츠를 충분히 추출할 수 없습니다. 직접 내용을 입력해주세요.');
//       }

//       // 추출된 텍스트 정제
//       const extractedContent = article.textContent
//         .replace(/\n{3,}/g, '\n\n')
//         .replace(/[ \t]+/g, ' ')
//         .split('\n')
//         .map((line) => line.trim())
//         .join('\n')
//         .trim();

//       // 추출 성공 응답
//       return NextResponse.json({
//         content: extractedContent,
//         sourceUrl: text,
//         title: article.title || '',
//         isExtracted: true,
//         type: 'webpage',
//       });
//     } catch (error: any) {
//       console.error('콘텐츠 추출 오류:', error);
//       return NextResponse.json(
//         { error: error.message || '웹페이지 처리 중 오류가 발생했습니다' },
//         { status: 500 }
//       );
//     }
//   } catch (error: any) {
//     console.error('처리 오류:', error);
//     return NextResponse.json(
//       {
//         error: error.message || '처리 중 오류가 발생했습니다',
//       },
//       { status: 500 }
//     );
//   }
// }

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

// //오리지널오리지널  // app/api/extract-and-analyze/route.ts
// import { NextResponse } from 'next/server';
// import puppeteer from 'puppeteer-core';
// import { Readability } from '@mozilla/readability';
// import { JSDOM } from 'jsdom';
// import { YoutubeTranscript } from 'youtube-transcript';

// // 크롬 실행 경로 (로컬 개발용)
// const CHROME_PATH =
//   process.env.CHROME_PATH ||
//   (process.platform === 'win32'
//     ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
//     : '/usr/bin/google-chrome');

// // 유튜브 URL 확인 함수
// function isYoutubeUrl(url: string): boolean {
//   return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(url);
// }

// // 유튜브 비디오 ID 추출 함수
// function extractYoutubeId(url: string): string | null {
//   const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[7]?.length === 11 ? match[7] : null;
// }

// export async function POST(request: Request) {
//   const { text } = await request.json();

//   if (!text) {
//     return NextResponse.json({ error: '텍스트가 필요합니다' }, { status: 400 });
//   }

//   try {
//     // URL 여부 확인
//     let isUrl = false;
//     try {
//       new URL(text);
//       isUrl = text.trim().indexOf('\n') === -1 && /^https?:\/\//i.test(text.trim());
//     } catch (e) {
//       isUrl = false;
//     }

//     // URL이 아니면 그대로 반환 (클라이언트에서 labeling API 호출)
//     if (!isUrl) {
//       return NextResponse.json({
//         content: text,
//         isExtracted: false,
//       });
//     }

//     // 네이버 블로그 체크
//     if (isUrl && /blog\.naver\.com/i.test(text)) {
//       return NextResponse.json(
//         {
//           error: '네이버 블로그는 지원되지 않습니다. 내용을 직접 복사하여 입력해주세요.',
//         },
//         { status: 400 }
//       );
//     }

//     // 유튜브 URL 확인
//     if (isYoutubeUrl(text)) {
//       const videoId = extractYoutubeId(text);
//       if (!videoId) {
//         return NextResponse.json({ error: '유효한 유튜브 URL이 아닙니다' }, { status: 400 });
//       }

//       try {
//         // youtube-transcript-api를 사용하여 자막 가져오기
//         const transcript = await YoutubeTranscript.fetchTranscript(videoId);

//         if (!transcript || transcript.length === 0) {
//           throw new Error('자막을 가져올 수 없습니다');
//         }

//         // 자막 텍스트 결합
//         const transcriptText = transcript
//           .map((item) => item.text)
//           .join(' ')
//           .replace(/\s+/g, ' ')
//           .trim();

//         return NextResponse.json({
//           content: transcriptText,
//           sourceUrl: text,
//           isExtracted: true,
//           type: 'youtube',
//         });
//       } catch (error: any) {
//         return NextResponse.json(
//           {
//             error: '이 영상에서 자막을 가져올 수 없습니다: ' + error.message,
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // 일반 웹페이지 콘텐츠 추출 (기존 코드 유지)
//     let browser = null;
//     try {
//       browser = await puppeteer.launch({
//         executablePath: CHROME_PATH,
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox'],
//       });

//       const page = await browser.newPage();

//       // 리소스 차단하여 속도 향상
//       await page.setRequestInterception(true);
//       page.on('request', (req) => {
//         const resourceType = req.resourceType();
//         if (['image', 'font', 'media', 'stylesheet'].includes(resourceType)) {
//           req.abort();
//         } else {
//           req.continue();
//         }
//       });

//       // 페이지 로드
//       await page.goto(text, { waitUntil: 'domcontentloaded', timeout: 15000 });

//       // HTML 가져오기
//       const html = await page.content();

//       // Readability로 콘텐츠 추출
//       const dom = new JSDOM(html, { url: text });
//       const reader = new Readability(dom.window.document);
//       const article = reader.parse();

//       if (!article || !article.textContent || article.textContent.length < 100) {
//         throw new Error('콘텐츠를 충분히 추출할 수 없습니다. 직접 내용을 입력해주세요.');
//       }

//       // 추출된 텍스트 정제
//       const extractedContent = article.textContent
//         .replace(/\n{3,}/g, '\n\n')
//         .replace(/[ \t]+/g, ' ')
//         .split('\n')
//         .map((line) => line.trim())
//         .join('\n')
//         .trim();

//       // 추출 성공 응답
//       return NextResponse.json({
//         content: extractedContent,
//         sourceUrl: text,
//         title: article.title || '',
//         isExtracted: true,
//         type: 'webpage',
//       });
//     } finally {
//       if (browser) await browser.close();
//     }
//   } catch (error: any) {
//     console.error('처리 오류:', error);
//     return NextResponse.json(
//       {
//         error: error.message || '처리 중 오류가 발생했습니다',
//       },
//       { status: 500 }
//     );
//   }
// }

//////////////////////////////////////////////////////////////////////////////////

// // app/api/extract-and-analyze/route.ts
// import { NextResponse } from 'next/server';
// import puppeteer from 'puppeteer-core';
// import { Readability } from '@mozilla/readability';
// import { JSDOM } from 'jsdom';
// import { YoutubeTranscript } from 'youtube-transcript';
// import axios from 'axios'; // 추가 필요한 의존성

// // 크롬 실행 경로 (로컬 개발용)
// const CHROME_PATH =
//   process.env.CHROME_PATH ||
//   (process.platform === 'win32'
//     ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
//     : '/usr/bin/google-chrome');

// // 유튜브 URL 확인 함수
// function isYoutubeUrl(url: string): boolean {
//   return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(url);
// }

// // 유튜브 비디오 ID 추출 함수
// function extractYoutubeId(url: string): string | null {
//   const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[7]?.length === 11 ? match[7] : null;
// }

// // InnerTube API를 통한 유튜브 자막 추출 (puppeteer 없이도 작동)
// async function fetchYoutubeInfoWithAPI(videoId: string) {
//   try {
//     // 1. YouTube InnerTube API로 비디오 정보 가져오기 시도
//     const response = await axios.post(
//       'https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8',
//       {
//         videoId: videoId,
//         context: {
//           client: {
//             clientName: 'WEB',
//             clientVersion: '2.20210721.00.00',
//           },
//         },
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           'User-Agent':
//             'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
//         },
//       }
//     );

//     const data = response.data;

//     // 자막 트랙 정보 추출
//     let captionTracks = [];
//     try {
//       captionTracks = data.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
//     } catch (e) {
//       console.log('No caption tracks found');
//     }

//     // 비디오 기본 정보 추출
//     const videoDetails = {
//       title: data.videoDetails?.title || '',
//       description: data.videoDetails?.shortDescription || '',
//       lengthSeconds: data.videoDetails?.lengthSeconds || 0,
//       author: data.videoDetails?.author || '',
//     };

//     // 사용 가능한 자막 트랙이 있으면 첫 번째 트랙의 자막 가져오기
//     if (captionTracks.length > 0) {
//       const firstTrack = captionTracks[0];
//       const captionUrl = firstTrack.baseUrl;

//       // baseUrl에서 자막 XML 가져오기
//       const captionResponse = await axios.get(captionUrl);
//       const captionXml = captionResponse.data;

//       // XML 파싱 및 텍스트 추출
//       const dom = new JSDOM(captionXml);
//       const textElements = dom.window.document.querySelectorAll('text');

//       let transcriptText = '';
//       textElements.forEach((element) => {
//         transcriptText += element.textContent + ' ';
//       });

//       // 불필요한 공백 제거 및 정리
//       transcriptText = transcriptText.replace(/\s+/g, ' ').trim();

//       return {
//         success: true,
//         transcript: transcriptText,
//         videoDetails,
//       };
//     }

//     // 자막이 없는 경우 비디오 정보만 반환
//     return {
//       success: false,
//       transcript: '',
//       videoDetails,
//     };
//   } catch (error) {
//     console.error('YouTube API 정보 가져오기 실패:', error);
//     return {
//       success: false,
//       transcript: '',
//       videoDetails: {
//         title: '',
//         description: '',
//         lengthSeconds: 0,
//         author: '',
//       },
//     };
//   }
// }

// // 유튜브 자막 가져오기 (라이브러리를 통한 방법)
// async function fetchYoutubeTranscriptWithLibrary(videoId: string) {
//   try {
//     // 라이브러리를 통한 방법 시도
//     const transcript = await YoutubeTranscript.fetchTranscript(videoId);

//     if (transcript && transcript.length > 0) {
//       // 자막 텍스트 결합
//       const transcriptText = transcript
//         .map((item) => item.text)
//         .join(' ')
//         .replace(/\s+/g, ' ')
//         .trim();

//       return {
//         success: true,
//         transcript: transcriptText,
//       };
//     }

//     return {
//       success: false,
//       transcript: '',
//     };
//   } catch (error: unknown) {
//     // TypeScript 에러 수정: unknown 타입 처리
//     const errorMessage = error instanceof Error ? error.message : String(error);

//     console.log(`라이브러리를 통한 자막 가져오기 실패: ${errorMessage}`);
//     return {
//       success: false,
//       transcript: '',
//     };
//   }
// }

// export async function POST(request: Request) {
//   const { text } = await request.json();

//   if (!text) {
//     return NextResponse.json({ error: '텍스트가 필요합니다' }, { status: 400 });
//   }

//   try {
//     // URL 여부 확인
//     let isUrl = false;
//     try {
//       new URL(text);
//       isUrl = text.trim().indexOf('\n') === -1 && /^https?:\/\//i.test(text.trim());
//     } catch (e) {
//       isUrl = false;
//     }

//     // URL이 아니면 그대로 반환 (클라이언트에서 labeling API 호출)
//     if (!isUrl) {
//       return NextResponse.json({
//         content: text,
//         isExtracted: false,
//       });
//     }

//     // 네이버 블로그 체크
//     if (isUrl && /blog\.naver\.com/i.test(text)) {
//       return NextResponse.json(
//         {
//           error: '네이버 블로그는 지원되지 않습니다. 내용을 직접 복사하여 입력해주세요.',
//         },
//         { status: 400 }
//       );
//     }

//     // 유튜브 URL 확인 및 처리
//     if (isYoutubeUrl(text)) {
//       const videoId = extractYoutubeId(text);
//       if (!videoId) {
//         return NextResponse.json({ error: '유효한 유튜브 URL이 아닙니다' }, { status: 400 });
//       }

//       // 방법 1: 라이브러리를 통한 자막 가져오기 시도
//       const libraryResult = await fetchYoutubeTranscriptWithLibrary(videoId);

//       if (libraryResult.success) {
//         return NextResponse.json({
//           content: libraryResult.transcript,
//           sourceUrl: text,
//           isExtracted: true,
//           type: 'youtube',
//         });
//       }

//       // 방법 2: InnerTube API를 통한 자막 가져오기 시도
//       const apiResult = await fetchYoutubeInfoWithAPI(videoId);

//       if (apiResult.success && apiResult.transcript) {
//         return NextResponse.json({
//           content: apiResult.transcript,
//           sourceUrl: text,
//           isExtracted: true,
//           type: 'youtube',
//           videoDetails: apiResult.videoDetails,
//         });
//       } else if (apiResult.videoDetails.title || apiResult.videoDetails.description) {
//         // 자막은 없지만 비디오 정보는 있는 경우
//         const content =
//           `${apiResult.videoDetails.title}\n\n${apiResult.videoDetails.description}`.trim();

//         if (content.length > 50) {
//           return NextResponse.json({
//             content: content,
//             sourceUrl: text,
//             isExtracted: true,
//             type: 'youtube',
//             note: '자막을 가져올 수 없어 영상 제목과 설명을 제공합니다.',
//             videoDetails: apiResult.videoDetails,
//           });
//         }
//       }

//       // 방법 3: 마지막 수단으로 Puppeteer로 시도
//       let browser = null;
//       try {
//         // Chrome 브라우저를 찾을 수 없을 가능성에 대비하여 예외 처리
//         let puppeteerOptions = {};

//         // Vercel 환경에서는 chrome-aws-lambda를 사용하는 것이 좋지만,
//         // 지금은 간단히 크롬 PATH로 시도합니다
//         try {
//           puppeteerOptions = {
//             executablePath: CHROME_PATH,
//             headless: true,
//             args: ['--no-sandbox', '--disable-setuid-sandbox'],
//           };

//           browser = await puppeteer.launch(puppeteerOptions);
//           const page = await browser.newPage();

//           // 타임아웃 연장
//           await page.setDefaultNavigationTimeout(30000);

//           // 유튜브 페이지 로드
//           await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
//             waitUntil: 'domcontentloaded',
//           });

//           // 페이지에서 제목과 설명 추출
//           const videoInfo = await page.evaluate(() => {
//             const title = document.querySelector('h1.title')?.textContent || '';
//             const description = document.querySelector('div#description-text')?.textContent || '';
//             return { title, description };
//           });

//           if (videoInfo.title || videoInfo.description) {
//             const content = `${videoInfo.title}\n\n${videoInfo.description}`.trim();

//             if (content.length > 50) {
//               return NextResponse.json({
//                 content: content,
//                 sourceUrl: text,
//                 isExtracted: true,
//                 type: 'youtube',
//                 note: '자막을 가져올 수 없어 영상 제목과 설명을 제공합니다.',
//               });
//             }
//           }
//         } catch (puppeteerError) {
//           console.error('Puppeteer 시도 실패:', puppeteerError);
//         }
//       } finally {
//         if (browser) await browser.close();
//       }

//       // 모든 방법이 실패한 경우
//       return NextResponse.json(
//         {
//           error:
//             '이 영상에서 자막이나 정보를 가져올 수 없습니다. 영상 내용을 수동으로 입력해주세요.',
//         },
//         { status: 400 }
//       );
//     }

//     // 일반 웹페이지 콘텐츠 추출 (기존 코드 유지)
//     let browser = null;
//     try {
//       browser = await puppeteer.launch({
//         executablePath: CHROME_PATH,
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox'],
//       });

//       const page = await browser.newPage();

//       // 리소스 차단하여 속도 향상
//       await page.setRequestInterception(true);
//       page.on('request', (req) => {
//         const resourceType = req.resourceType();
//         if (['image', 'font', 'media', 'stylesheet'].includes(resourceType)) {
//           req.abort();
//         } else {
//           req.continue();
//         }
//       });

//       // 페이지 로드
//       await page.goto(text, { waitUntil: 'domcontentloaded', timeout: 15000 });

//       // HTML 가져오기
//       const html = await page.content();

//       // Readability로 콘텐츠 추출
//       const dom = new JSDOM(html, { url: text });
//       const reader = new Readability(dom.window.document);
//       const article = reader.parse();

//       if (!article || !article.textContent || article.textContent.length < 100) {
//         throw new Error('콘텐츠를 충분히 추출할 수 없습니다. 직접 내용을 입력해주세요.');
//       }

//       // 추출된 텍스트 정제
//       const extractedContent = article.textContent
//         .replace(/\n{3,}/g, '\n\n')
//         .replace(/[ \t]+/g, ' ')
//         .split('\n')
//         .map((line) => line.trim())
//         .join('\n')
//         .trim();

//       // 추출 성공 응답
//       return NextResponse.json({
//         content: extractedContent,
//         sourceUrl: text,
//         title: article.title || '',
//         isExtracted: true,
//         type: 'webpage',
//       });
//     } finally {
//       if (browser) await browser.close();
//     }
//   } catch (error: any) {
//     console.error('처리 오류:', error);
//     return NextResponse.json(
//       {
//         error: error.message || '처리 중 오류가 발생했습니다',
//       },
//       { status: 500 }
//     );
//   }
// }
