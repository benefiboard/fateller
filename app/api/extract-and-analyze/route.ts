// app/api/extract-and-analyze/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { YoutubeTranscript } from 'youtube-transcript';

// 타입 정의
interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

interface YTCaptionTrack {
  baseUrl: string;
  name: {
    simpleText: string;
  };
  languageCode: string;
}

interface YTJsonEvent {
  segs?: Array<{ utf8?: string }>;
  dDurationMs?: number;
  tStartMs?: number;
}

// 크롬 실행 경로 (로컬 개발용)
const CHROME_PATH =
  process.env.CHROME_PATH ||
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : process.platform === 'darwin'
    ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    : '/usr/bin/google-chrome');

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

// matchAll 대신 사용할 함수
function getMatches(string: string, regex: RegExp): Array<RegExpExecArray> {
  const matches: Array<RegExpExecArray> = [];
  let match: RegExpExecArray | null;

  // 정규식에 global 플래그가 있는지 확인
  if (!regex.global) {
    regex = new RegExp(regex.source, regex.flags + 'g');
  }

  while ((match = regex.exec(string)) !== null) {
    matches.push(match);
  }

  return matches;
}

// 유튜브 자막 추출 개선 함수
async function fetchYoutubeTranscriptWithPuppeteer(videoId: string): Promise<TranscriptItem[]> {
  let browser = null;

  try {
    console.log(`Puppeteer를 사용하여 유튜브 자막 추출 시작: ${videoId}`);

    // 환경에 따른 브라우저 설정
    if (isVercelProduction()) {
      console.log('Vercel 환경에서 실행 중...');
      const executablePath = await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      );

      browser = await puppeteerCore.launch({
        executablePath,
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-web-security', // 크로스 도메인 요청 허용
          '--disable-features=IsolateOrigins,site-per-process', // 동일 출처 정책 우회
        ],
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      });
    } else {
      console.log('로컬 환경에서 실행 중...');
      browser = await puppeteerCore.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await browser.newPage();

    // 유튜브가 봇을 감지하지 않도록 헤더 설정 개선
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      Referer: 'https://www.google.com/',
    });

    // 추가: 유튜브가 지원하는 자막 언어를 명시적으로 요청
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6',
    });

    // 페이지 쿠키 설정 (지역 설정)
    await page.setCookie({
      name: 'PREF',
      value: 'hl=ko&gl=KR',
      domain: '.youtube.com',
      path: '/',
    });

    // 유튜브 페이지 로드
    console.log(`유튜브 페이지 로드 중: ${videoId}`);

    // 로딩 시간 늘리고 네트워크 대기
    await page.goto(`https://www.youtube.com/watch?v=${videoId}`, {
      waitUntil: 'networkidle2', // 모든 네트워크 연결이 최소 500ms 동안 유휴 상태가 될 때까지 대기
      timeout: 30000, // 30초로 타임아웃 증가
    });

    // waitForTimeout 대신 대체 방법 사용
    await page.evaluate(() => new Promise((r) => setTimeout(r, 2000)));

    // 다양한 언어로 자막 URL 추출 시도
    let captionsData = null;

    // 방법 1: player response에서 직접 추출
    captionsData = await page.evaluate(() => {
      // @ts-ignore - ytInitialPlayerResponse는 유튜브 페이지에서 사용 가능
      const ytResponse = window.ytInitialPlayerResponse;

      if (
        !ytResponse ||
        !ytResponse.captions ||
        !ytResponse.captions.playerCaptionsTracklistRenderer ||
        !ytResponse.captions.playerCaptionsTracklistRenderer.captionTracks ||
        !ytResponse.captions.playerCaptionsTracklistRenderer.captionTracks.length
      ) {
        return null;
      }

      // 모든 자막 트랙 정보 반환
      const tracks = ytResponse.captions.playerCaptionsTracklistRenderer.captionTracks;

      // 자막 트랙 목록 (디버깅용)
      const trackInfo = tracks.map((track: any) => ({
        languageCode: track.languageCode,
        name: track.name?.simpleText || '',
        baseUrl: track.baseUrl,
      }));

      console.log('사용 가능한 자막 트랙:', JSON.stringify(trackInfo));

      // 언어 우선순위: 한국어(ko) > 영어(en) > 첫 번째 사용 가능한 트랙
      const koTrack = tracks.find((track: any) => track.languageCode === 'ko');
      const enTrack = tracks.find((track: any) => track.languageCode === 'en');

      // 우선순위대로 트랙 반환
      return koTrack?.baseUrl || enTrack?.baseUrl || tracks[0].baseUrl;
    });

    // 방법 2: 스크립트 태그에서 추출
    if (!captionsData) {
      console.log('방법 1 실패, 방법 2 시도...');
      captionsData = await page.evaluate(() => {
        // NodeList를 배열로 변환
        const scriptElements = Array.from(document.querySelectorAll('script'));

        for (let i = 0; i < scriptElements.length; i++) {
          const script = scriptElements[i];
          const content = script.textContent || '';

          if (content.includes('captionTracks')) {
            const match = content.match(/"captionTracks":\s*(\[.*?\])/);

            if (match && match[1]) {
              try {
                const tracks = JSON.parse(match[1].replace(/\\"/g, '"'));

                if (tracks && tracks.length > 0) {
                  // 자막 트랙 목록 (디버깅용)
                  console.log('스크립트에서 자막 트랙 찾음:', JSON.stringify(tracks));

                  // 언어 우선순위
                  const koTrack = tracks.find((track: any) => track.languageCode === 'ko');
                  const enTrack = tracks.find((track: any) => track.languageCode === 'en');

                  return koTrack?.baseUrl || enTrack?.baseUrl || tracks[0].baseUrl;
                }
              } catch (e) {
                // JSON 파싱 실패
              }
            }
          }
        }
        return null;
      });
    }

    // 방법 3: 자막 목록 API 호출
    if (!captionsData) {
      console.log('방법 2 실패, 방법 3 시도...');

      // 브라우저 즉시 종료 (API 호출 전)
      console.log('브라우저 종료 중...');
      await browser.close();
      browser = null;

      // 자막 목록 가져오기 URL
      const timedtextUrl = `https://www.youtube.com/api/timedtext?type=list&v=${videoId}`;

      try {
        // 페이지 컨텍스트 바깥에서 fetch 실행
        const timedtextResponse = await fetch(timedtextUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Referer: 'https://www.youtube.com/',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        const timedtextBody = await timedtextResponse.text();
        console.log('자막 목록 API 응답:', timedtextBody);

        // <track> 태그 파싱
        const trackRegex = /<track id="[^"]*" name="([^"]*)" lang_code="([^"]*)"[^>]*\/>/g;
        const tracks = getMatches(timedtextBody, trackRegex);

        if (tracks && tracks.length > 0) {
          // 우선순위에 따른 트랙 선택
          let selectedTrack = null;

          for (const track of tracks) {
            const langCode = track[2];
            const name = track[1];
            console.log(`자막 트랙 발견: ${name} (${langCode})`);

            if (langCode === 'ko') {
              selectedTrack = track;
              break;
            } else if (langCode === 'en' && !selectedTrack) {
              selectedTrack = track;
            } else if (!selectedTrack) {
              selectedTrack = track;
            }
          }

          if (selectedTrack) {
            const langCode = selectedTrack[2];
            captionsData = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=${langCode}`;
          }
        }
      } catch (e) {
        console.error('자막 목록 API 호출 실패:', e);
      }

      // 여전히 실패하면 영어 자막 시도
      if (!captionsData) {
        captionsData = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`;
      }

      // 마지막으로 한국어 자막 시도
      if (!captionsData) {
        captionsData = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=ko`;
      }
    } else if (browser) {
      // 브라우저가 아직 열려있고 방법 1 또는 2가 성공했다면 여기서 종료
      console.log('브라우저 종료 중...');
      await browser.close();
      browser = null;
    }

    if (!captionsData) {
      console.log('자막 데이터를 찾을 수 없습니다');
      throw new Error('자막을 찾을 수 없습니다');
    }

    console.log('자막 URL 추출 성공:', captionsData);

    // 추출한 URL로 자막 데이터 가져오기
    console.log('자막 XML 데이터 가져오는 중...');
    const transcriptResponse = await fetch(captionsData, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: 'https://www.youtube.com/',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    const transcriptBody = await transcriptResponse.text();

    // 응답 전체 로깅 (디버깅용)
    console.log('자막 응답 길이:', transcriptBody.length);
    if (transcriptBody.length < 500) {
      console.log('자막 응답 내용:', transcriptBody);
    } else {
      console.log('자막 응답 일부:', transcriptBody.substring(0, 500) + '...');
    }

    // 자막 파싱 함수
    return parseTranscriptContent(transcriptBody, videoId);
  } catch (error) {
    console.error('Puppeteer로 자막 추출 실패:', error);
    if (browser) await browser.close();
    throw error;
  }
}

// 자막 내용 파싱 함수
function parseTranscriptContent(content: string, videoId: string): TranscriptItem[] {
  // 비어있는 응답 처리
  if (!content || content.trim() === '') {
    console.log('빈 응답 받음, 다른 방법 필요');
    throw new Error('자막 데이터를 파싱할 수 없습니다');
  }

  // XML 형식 파싱 시도
  const RE_XML_TRANSCRIPT = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
  const results = getMatches(content, RE_XML_TRANSCRIPT);

  // 기본 XML 형식 성공
  if (results && results.length > 0) {
    console.log(`기본 XML 형식으로 자막 추출 완료: ${results.length}개 항목`);
    return results.map((result) => ({
      text: result[3]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"'),
      duration: parseFloat(result[2]),
      offset: parseFloat(result[1]),
    }));
  }

  // 대체 XML 형식 시도
  const alternativeRegex = /<text\s+[^>]*>(.*?)<\/text>/g;
  const altResults = getMatches(content, alternativeRegex);

  if (altResults && altResults.length > 0) {
    console.log(`대체 XML 형식으로 자막 추출 완료: ${altResults.length}개 항목`);
    return altResults.map((result) => ({
      text: result[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"'),
      duration: 0,
      offset: 0,
    }));
  }

  // 자막 목록 응답인 경우
  if (content.includes('<transcript_list>')) {
    console.log('자막 목록 반환됨, 첫 번째 자막 시도');

    // <track> 태그 파싱
    const trackRegex = /<track id="[^"]*" name="([^"]*)" lang_code="([^"]*)"[^>]*\/>/g;
    const tracks = getMatches(content, trackRegex);

    if (tracks && tracks.length > 0) {
      // 값을 반환하는 대신 예외를 던져 호출자가 다시 시도하도록 함
      console.log(
        `사용 가능한 자막 트랙 목록이 반환됨. 첫 번째 트랙: ${tracks[0][1]} (${tracks[0][2]})`
      );
      throw new Error('자막 URL이 자막 목록을 반환했습니다. 개별 자막 URL을 사용하세요.');
    }
  }

  // XML 없이 단순 텍스트 형식 시도
  if (content.trim().length > 20 && !content.startsWith('<')) {
    console.log('단순 텍스트 형식으로 처리 시도');
    // 줄바꿈으로 구분된 텍스트로 처리
    const lines = content.split('\n').filter((line) => line.trim().length > 0);
    if (lines.length > 0) {
      return lines.map((line, index) => ({
        text: line.trim(),
        duration: 1,
        offset: index,
      }));
    }
  }

  // JSON 형식 시도
  try {
    const jsonData = JSON.parse(content);
    console.log('JSON 형식 감지됨');

    // YouTube API JSON 응답 형식
    if (jsonData.events && Array.isArray(jsonData.events)) {
      console.log(`JSON 형식으로 자막 추출 완료: ${jsonData.events.length}개 항목`);

      return jsonData.events
        .filter(
          (event: YTJsonEvent) => event.segs && Array.isArray(event.segs) && event.segs.length > 0
        )
        .map((event: YTJsonEvent) => ({
          text: event.segs?.map((seg) => seg.utf8 || '').join('') || '',
          duration: (event.dDurationMs || 0) / 1000,
          offset: (event.tStartMs || 0) / 1000,
        }))
        .filter((item: TranscriptItem) => item.text.trim().length > 0);
    }

    // 자막 텍스트만 있는 간단한 배열
    if (Array.isArray(jsonData)) {
      return jsonData.map((item: any, index: number) => ({
        text: typeof item === 'string' ? item : item.text || '',
        duration: 1,
        offset: index,
      }));
    }
  } catch (e) {
    // JSON 파싱 실패 - 무시하고 계속 진행
  }

  // 마지막 시도: HTML 태그 제거 후 단순 텍스트
  if (content.includes('<') && content.includes('>')) {
    const plainText = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (plainText.length > 100) {
      console.log('HTML 태그 제거 후 텍스트 추출:', plainText.substring(0, 50) + '...');
      // 문장 또는 구두점으로 분리
      const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
      return sentences.map((sentence, index) => ({
        text: sentence.trim(),
        duration: 1,
        offset: index,
      }));
    }
  }

  // 다시 시도, 다른 언어로 자막 가져오기
  if (videoId) {
    console.log('모든 파싱 시도 실패, 마지막 수단으로 언어 없이 시도');
    throw new Error('자막 파싱 실패, 다른 언어로 다시 시도 필요');
  }

  // 모든 시도 실패
  throw new Error('자막 데이터를 파싱할 수 없습니다');
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

      let transcript: TranscriptItem[] | null = null;
      let errorMessage = '';

      // 로컬 환경인 경우 먼저 라이브러리로 시도
      if (!isVercelProduction()) {
        try {
          console.log('YoutubeTranscript 라이브러리로 자막 추출 시도');
          const libTranscript = await YoutubeTranscript.fetchTranscript(videoId);
          transcript = libTranscript.map((item) => ({
            text: item.text || '',
            duration: item.duration || 0,
            offset: item.offset || 0,
          }));
          console.log('라이브러리로 자막 추출 성공');
        } catch (error: any) {
          console.log('라이브러리 추출 실패, 오류:', error.message);
          errorMessage = error.message;
          transcript = null;
        }
      } else {
        // Vercel 환경에서는 라이브러리 시도 건너뛰기
        console.log('Vercel 환경 감지, 라이브러리 시도 건너뛰고 Puppeteer 직접 사용');
      }

      // 라이브러리 실패 또는 Vercel 환경인 경우 바로 Puppeteer로 시도
      if (!transcript || transcript.length === 0) {
        try {
          console.log('Puppeteer로 자막 추출 시도');
          transcript = await fetchYoutubeTranscriptWithPuppeteer(videoId);
          console.log('Puppeteer로 자막 추출 성공');
        } catch (puppeteerError: any) {
          console.error('Puppeteer로 자막 추출 실패:', puppeteerError);

          // 모든 시도가 실패한 경우 오류 메시지만 반환
          return NextResponse.json(
            {
              error:
                '이 영상에서 자막을 가져올 수 없습니다. 유튜브 동영상에 자막이 없거나 자막이 비공개 설정되었을 수 있습니다.',
            },
            { status: 400 }
          );
        }
      }

      // 자막이 성공적으로 추출된 경우
      if (transcript && transcript.length > 0) {
        // 자막 텍스트 결합
        const transcriptText = transcript
          .map((item) => item.text || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return NextResponse.json({
          content: transcriptText,
          sourceUrl: text,
          isExtracted: true,
          type: 'youtube',
        });
      } else {
        return NextResponse.json(
          {
            error: '이 영상에서 자막을 가져올 수 없습니다. 자막이 없거나 접근할 수 없습니다.',
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

// 일반 url 굿굿// app/api/extract-and-analyze/route.ts
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

// 오리지널오리지널  // app/api/extract-and-analyze/route.ts
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
