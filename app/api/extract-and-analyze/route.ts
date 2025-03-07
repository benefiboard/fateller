// app/api/extract-and-analyze/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { Innertube } from 'youtubei.js';

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

// youtubei.js를 사용한 자막 추출 함수
async function fetchYoutubeTranscriptWithInnertube(videoId: string): Promise<string> {
  try {
    console.log('Innertube를 사용하여 자막 추출 시작...');

    // Innertube 인스턴스 생성
    const yt = await Innertube.create({ generate_session_locally: true });

    // 비디오 정보 가져오기
    const videoInfo = await yt.getInfo(videoId);

    try {
      // 자막 정보 가져오기
      const transcriptInfo = await videoInfo.getTranscript();

      // 안전하게 속성에 접근하기 위한 옵셔널 체이닝 사용
      const transcript = transcriptInfo?.transcript?.content?.body?.initial_segments || [];

      if (!transcript || transcript.length === 0) {
        throw new Error('자막 세그먼트를 찾을 수 없습니다');
      }

      console.log(`자막 추출 성공: ${transcript.length}개 세그먼트`);

      // 각 세그먼트의 text 부분만 추출해서 연결
      const fullText = transcript
        .map((segment: any) => {
          // 여러 형태의 자막 데이터 구조 처리
          if (segment.snippet && segment.snippet.text) {
            return segment.snippet.text;
          } else if (segment.text) {
            return segment.text;
          } else if (segment.snippet && typeof segment.snippet === 'object') {
            // 중첩된 객체 구조 처리
            return segment.snippet.text || '';
          }
          return '';
        })
        .filter((text: string) => text.trim() !== '') // 빈 문자열 제거
        .join(' '); // 공백으로 연결

      if (!fullText || fullText.trim().length === 0) {
        throw new Error('추출된 자막 텍스트가 없습니다');
      }

      return fullText;
    } catch (transcriptError: any) {
      console.error('자막 추출 오류:', transcriptError);
      // 자막을 가져오지 못한 경우 오류 메시지 던지기
      throw new Error('이 동영상에서 자막을 가져올 수 없습니다: ' + transcriptError.message);
    }
  } catch (error: any) {
    console.error('유튜브 자막 추출 오류:', error);
    throw new Error(`유튜브 자막 추출 실패: ${error.message}`);
  }
}

// 유튜브 메타데이터(제목, 썸네일) 가져오기 함수 추가
async function getYoutubeMetadata(
  videoId: string
): Promise<{ title: string; thumbnailUrl: string }> {
  try {
    console.log('유튜브 메타데이터 가져오기 시작...');

    // Innertube 인스턴스 생성
    const yt = await Innertube.create({ generate_session_locally: true });

    // 비디오 정보 가져오기
    const videoInfo = await yt.getInfo(videoId);
    //console.log('유튜브 비디오 정보:', videoInfo);

    // 제목 가져오기
    const title = videoInfo.basic_info.title || '제목 없음';

    // 썸네일 URL 가져오기 (가장 높은 해상도 선택)
    const thumbnails = videoInfo.basic_info.thumbnail || [];
    let thumbnailUrl = '';

    if (thumbnails.length > 0) {
      // 썸네일이 여러 개 있을 경우 마지막 항목이 일반적으로 가장 높은 해상도
      thumbnailUrl = thumbnails[thumbnails.length - 1].url;
    } else {
      // 기본 유튜브 썸네일 URL 형식 사용
      thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }

    // 콘솔에 유튜브 메타데이터 출력
    console.log('유튜브 제목:', title);
    console.log('유튜브 썸네일 URL:', thumbnailUrl);

    console.log('유튜브 메타데이터 가져오기 성공');
    return { title, thumbnailUrl };
  } catch (error: any) {
    console.error('유튜브 메타데이터 가져오기 오류:', error);
    // 기본값 반환
    const defaultTitle = '제목을 가져올 수 없음';
    const defaultThumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    console.log('유튜브 제목(기본값):', defaultTitle);
    console.log('유튜브 썸네일 URL(기본값):', defaultThumbnailUrl);

    return {
      title: defaultTitle,
      thumbnailUrl: defaultThumbnailUrl,
    };
  }
}

// 웹페이지 이미지 추출 함수 추가
async function extractMainImage(page: any): Promise<string> {
  try {
    // OpenGraph 이미지 추출 시도
    const ogImage = await page.evaluate(() => {
      const ogImageMeta = document.querySelector('meta[property="og:image"]');
      return ogImageMeta ? ogImageMeta.getAttribute('content') : null;
    });

    if (ogImage) {
      console.log('OpenGraph 이미지 찾음:', ogImage);
      return ogImage;
    }

    // Twitter 카드 이미지 추출 시도
    const twitterImage = await page.evaluate(() => {
      const twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
      return twitterImageMeta ? twitterImageMeta.getAttribute('content') : null;
    });

    if (twitterImage) {
      console.log('Twitter 카드 이미지 찾음:', twitterImage);
      return twitterImage;
    }

    // 큰 이미지 찾기
    const largeImage = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      // 크기 속성이 있는 큰 이미지 찾기
      for (const img of images) {
        const width = parseInt(img.getAttribute('width') || '0');
        const height = parseInt(img.getAttribute('height') || '0');
        if (width >= 200 && height >= 200) {
          return img.src;
        }
      }

      // 크기 속성이 없는 경우 computed style 확인
      for (const img of images) {
        const rect = img.getBoundingClientRect();
        if (rect.width >= 200 && rect.height >= 200) {
          return img.src;
        }
      }

      // 첫 번째 이미지 반환 (다른 조건이 없는 경우)
      return images.length > 0 ? images[0].src : null;
    });

    if (largeImage) {
      console.log('페이지 내 큰 이미지 찾음:', largeImage);
      return largeImage;
    }

    console.log('이미지를 찾을 수 없음');
    return '';
  } catch (error) {
    console.error('이미지 추출 오류:', error);
    return '';
  }
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

      try {
        // 병렬로 자막과 메타데이터 가져오기
        const [transcriptText, metadata] = await Promise.all([
          fetchYoutubeTranscriptWithInnertube(videoId),
          getYoutubeMetadata(videoId),
        ]);

        console.log('유튜브 처리 결과 요약:');
        console.log('----------------------------');
        console.log('비디오 ID:', videoId);
        console.log('제목:', metadata.title);
        console.log('썸네일 URL:', metadata.thumbnailUrl);
        console.log('자막 길이:', transcriptText.length, '자');
        console.log('----------------------------');

        // 자막 추출 성공 시 반환
        return NextResponse.json({
          content: transcriptText,
          sourceUrl: text,
          isExtracted: true,
          type: 'youtube',
          title: metadata.title,
          imageUrl: metadata.thumbnailUrl,
          thumbnailUrl: metadata.thumbnailUrl,
        });
      } catch (error: any) {
        // 자막 추출 실패 시 오류 반환
        return NextResponse.json(
          {
            error: `이 영상에서 자막을 가져올 수 없습니다: ${error.message || '알 수 없는 오류'}`,
          },
          { status: 400 }
        );
      }
    }

    // 일반 웹페이지 콘텐츠 추출 (최적화: HTML 추출 후 즉시 브라우저 종료)
    let browser = null;
    let html = '';
    let mainImageUrl = '';

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

      // 이미지는 가져올 수 있도록 리소스 요청 선택적 차단
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['font', 'media', 'stylesheet'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // 페이지 로드
      await page.goto(text, { waitUntil: 'domcontentloaded', timeout: 25000 });

      // 페이지 제목 가져오기
      const pageTitle = await page.title();
      console.log('웹페이지 제목(브라우저):', pageTitle);

      // 메인 이미지 추출
      mainImageUrl = await extractMainImage(page);

      // 상대 경로 URL을 절대 경로로 변환
      if (mainImageUrl && !mainImageUrl.startsWith('http')) {
        const pageUrl = new URL(text);
        if (mainImageUrl.startsWith('/')) {
          mainImageUrl = `${pageUrl.protocol}//${pageUrl.host}${mainImageUrl}`;
        } else {
          mainImageUrl = `${pageUrl.protocol}//${pageUrl.host}/${mainImageUrl}`;
        }
        console.log('변환된 이미지 URL:', mainImageUrl);
      }

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

      // 제목 출력
      console.log('웹페이지 제목(Readability):', article.title || '제목 없음');

      // 추출된 텍스트 정제
      const extractedContent = article.textContent
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim();

      // 이미지 URL이 없는 경우 HTML에서 추가로 검색
      if (!mainImageUrl) {
        // og:image 메타 태그에서 이미지 URL 추출 시도
        const ogImageMatch = html.match(
          /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
        );
        if (ogImageMatch && ogImageMatch[1]) {
          mainImageUrl = ogImageMatch[1];
          console.log('HTML에서 추출한 OG 이미지:', mainImageUrl);
        } else {
          // twitter:image 메타 태그에서 이미지 URL 추출 시도
          const twitterImageMatch = html.match(
            /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i
          );
          if (twitterImageMatch && twitterImageMatch[1]) {
            mainImageUrl = twitterImageMatch[1];
            console.log('HTML에서 추출한 Twitter 이미지:', mainImageUrl);
          }
        }
      }

      console.log('웹페이지 처리 결과 요약:');
      console.log('----------------------------');
      console.log('URL:', text);
      console.log('제목:', article.title || '제목 없음');
      console.log('이미지 URL:', mainImageUrl || '이미지 없음');
      console.log('콘텐츠 길이:', extractedContent.length, '자');
      console.log('----------------------------');

      // 추출 성공 응답
      return NextResponse.json({
        content: extractedContent,
        sourceUrl: text,
        title: article.title || '',
        imageUrl: mainImageUrl || '',
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
