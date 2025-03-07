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

// 유튜브 메타데이터(제목, 썸네일) 가져오기 함수 - OEmbed API 사용
async function getYoutubeMetadata(
  videoId: string
): Promise<{ title: string; thumbnailUrl: string }> {
  console.log(
    `[${new Date().toISOString()}] 유튜브 메타데이터 가져오기 시작: ${videoId} (OEmbed API 사용)`
  );
  const startTime = Date.now();

  try {
    // OEmbed API URL 구성
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    console.log(`[${new Date().toISOString()}] OEmbed API 요청: ${oembedUrl}`);

    // OEmbed API 호출
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error(`OEmbed API 오류: ${response.status} ${response.statusText}`);
    }

    // 응답 JSON 파싱
    const oembedData = await response.json();
    console.log(
      `[${new Date().toISOString()}] OEmbed 응답 성공:`,
      JSON.stringify(oembedData, null, 2).substring(0, 200) + '...'
    );

    // 제목 추출
    const title = oembedData.title || '제목 없음';

    // 고화질 썸네일 URL 구성 (OEmbed는 썸네일 URL을 제공하지 않으므로 ID로 구성)
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const totalTime = Date.now() - startTime;
    console.log(
      `[${new Date().toISOString()}] OEmbed API 메타데이터 가져오기 성공 (총 ${totalTime}ms)`
    );
    console.log(`[${new Date().toISOString()}] 제목: "${title}", 썸네일: "${thumbnailUrl}"`);

    return { title, thumbnailUrl };
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] OEmbed API 오류:`, error);

    try {
      // OEmbed 실패 시 HTML 메타태그 추출 시도
      console.log(`[${new Date().toISOString()}] OEmbed 실패, HTML 메타태그 시도`);
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await fetch(videoUrl);
      const html = await response.text();

      // 정규식으로 제목 추출
      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      let title = '제목을 가져올 수 없음';

      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(' - YouTube', '');
        console.log(`[${new Date().toISOString()}] HTML에서 제목 추출 성공: "${title}"`);
      }

      const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      return { title, thumbnailUrl };
    } catch (backupError) {
      console.error(`[${new Date().toISOString()}] 백업 메타데이터 추출 오류:`, backupError);

      // 모든 방법 실패 시 기본값 반환
      const defaultTitle = '제목을 가져올 수 없음';
      const defaultThumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      console.log(
        `[${new Date().toISOString()}] 기본값 반환: 제목="${defaultTitle}", 썸네일="${defaultThumbnailUrl}"`
      );

      return {
        title: defaultTitle,
        thumbnailUrl: defaultThumbnailUrl,
      };
    }
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

// 네이버 블로그 특화 처리 함수
async function extractNaverBlogContent(
  url: string
): Promise<{ content: string; title: string; imageUrl: string }> {
  console.log(`[${new Date().toISOString()}] 네이버 블로그 처리 시작: ${url}`);
  let browser = null;

  try {
    // 환경에 따른 브라우저 시작
    if (isVercelProduction()) {
      console.log('Vercel 환경에서 실행 중...');
      const executablePath = await chromium.executablePath(
        'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
      );

      browser = await puppeteerCore.launch({
        executablePath,
        args: [...chromium.args, '--disable-features=site-per-process'], // iframe 접근을 위해 필요
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      });
    } else {
      console.log('로컬 환경에서 실행 중...', CHROME_PATH);
      browser = await puppeteerCore.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-features=site-per-process'], // iframe 접근을 위해 필요
      });
    }

    const page = await browser.newPage();

    // 네이버 블로그는 모바일 버전이 더 추출하기 쉬운 경우가 많음
    // 모바일 User-Agent 설정
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    );

    console.log(`[${new Date().toISOString()}] 네이버 블로그 페이지 로딩 시작`);

    // 페이지 로드 (완전히 로드될 때까지 기다림)
    await page.goto(url, {
      waitUntil: 'networkidle2', // 최소 500ms 동안 네트워크 요청이 2개 이하일 때 로드 완료로 간주
      timeout: 30000,
    });

    console.log(`[${new Date().toISOString()}] 네이버 블로그 페이지 로드 완료`);

    // 페이지 제목 추출
    const pageTitle = await page.title();
    console.log(`[${new Date().toISOString()}] 네이버 블로그 제목: ${pageTitle}`);

    // 메인 이미지 URL 추출
    const mainImageUrl = await extractMainImage(page);
    console.log(
      `[${new Date().toISOString()}] 네이버 블로그 메인 이미지: ${mainImageUrl || '없음'}`
    );

    // 블로그 본문 iframe 탐지
    console.log(`[${new Date().toISOString()}] 네이버 블로그 iframe 탐색 중...`);
    const iframeHandle = await page.$('iframe#mainFrame, iframe#screenFrame');

    let content = '';

    if (iframeHandle) {
      console.log(
        `[${new Date().toISOString()}] 네이버 블로그 iframe 발견, iframe 내부 컨텐츠 추출 시도`
      );

      // iframe 내부 접근
      const frame = await iframeHandle.contentFrame();

      if (frame) {
        // iframe이 완전히 로드될 때까지 추가 대기
        await frame.waitForFunction(() => document.readyState === 'complete');
        console.log(`[${new Date().toISOString()}] iframe 내부 로드 완료`);

        // 포스트 섹션을 찾고 컨텐츠 추출 시도
        // 네이버 블로그는 여러 선택자를 가질 수 있으므로 다양한 패턴 시도
        content = await frame.evaluate(() => {
          // 가능한 본문 컨텐츠 선택자들
          const contentSelectors = [
            // PC 버전
            '.se-main-container', // 스마트에디터 2
            '.se_component_wrap', // 구버전 스마트에디터
            '.post-view', // 일부 블로그 템플릿
            '.post_article', // 또 다른 템플릿
            '#postViewArea', // 레거시 템플릿
            '.blog_article', // 레거시 템플릿

            // 모바일 버전
            '.se_doc_viewer',
            '.post_ct',
            '#viewTypeSelector',
            '.post-content',
            '.se_doc_viewer_content',
            '.se_view_wrap',
          ];

          // 추출 시도
          for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent && element.textContent.trim().length > 200) {
              // HTMLElement로 타입 변환하여 innerText 속성에 접근
              return (element as HTMLElement).innerText || element.textContent;
            }
          }

          // 선택자로 찾지 못한 경우 모든 텍스트 노드 수집 시도
          const getAllTextNodes = (element: any) => {
            if (!element) return '';

            // 숨김 요소 제외
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') {
              return '';
            }

            // 텍스트 컨텐츠가 있으면 반환
            if (
              element.tagName === 'P' ||
              element.tagName === 'DIV' ||
              element.tagName === 'SPAN' ||
              element.tagName === 'H1' ||
              element.tagName === 'H2' ||
              element.tagName === 'H3' ||
              element.tagName === 'H4' ||
              element.tagName === 'LI'
            ) {
              if (element.textContent && element.textContent.trim().length > 20) {
                return element.textContent + '\n';
              }
            }

            // 자식 요소 재귀적으로 탐색
            let result = '';
            if (element.children) {
              for (let i = 0; i < element.children.length; i++) {
                result += getAllTextNodes(element.children[i]);
              }
            }

            return result;
          };

          // 전체 문서에서 텍스트 노드 추출
          return getAllTextNodes(document.body);
        });
      }
    }

    // iframe에서 컨텐츠를 추출하지 못한 경우 메인 페이지에서 시도
    if (!content || content.trim().length < 200) {
      console.log(`[${new Date().toISOString()}] iframe 추출 실패, 메인 페이지에서 직접 추출 시도`);

      content = await page.evaluate(() => {
        // 메인 페이지에서 가능한 컨텐츠 선택자
        const contentSelectors = [
          '#content',
          '.blog_content',
          '#blog-content',
          '.entry-content',
          '.post-content',
        ];

        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent && element.textContent.trim().length > 200) {
            // HTMLElement로 타입 변환하여 innerText 속성에 접근
            return (element as HTMLElement).innerText || element.textContent;
          }
        }

        // 메인 페이지의 모든 텍스트 노드 수집
        const getAllTextNodes = (element: any) => {
          if (!element) return '';

          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return '';
          }

          if (
            element.tagName === 'P' ||
            element.tagName === 'DIV' ||
            element.tagName === 'SPAN' ||
            element.tagName === 'H1' ||
            element.tagName === 'H2' ||
            element.tagName === 'H3' ||
            element.tagName === 'H4' ||
            element.tagName === 'LI'
          ) {
            if (element.textContent && element.textContent.trim().length > 20) {
              return element.textContent + '\n';
            }
          }

          let result = '';
          if (element.children) {
            for (let i = 0; i < element.children.length; i++) {
              result += getAllTextNodes(element.children[i]);
            }
          }

          return result;
        };

        return getAllTextNodes(document.body);
      });
    }

    // 브라우저 종료
    await browser.close();
    browser = null;

    // 컨텐츠 정제
    if (content) {
      content = content
        .replace(/\n{3,}/g, '\n\n') // 여러 줄바꿈 제거
        .replace(/[ \t]+/g, ' ') // 여러 공백 제거
        .split('\n')
        .map((line) => line.trim()) // 각 라인 앞뒤 공백 제거
        .filter((line) => line) // 빈 라인 제거
        .join('\n')
        .trim();
    }

    // 충분한 컨텐츠가 추출되었는지 확인
    if (!content || content.trim().length < 200) {
      throw new Error('네이버 블로그 컨텐츠를 충분히 추출할 수 없습니다.');
    }

    console.log(
      `[${new Date().toISOString()}] 네이버 블로그 컨텐츠 추출 성공 (${content.length}자)`
    );

    return {
      content,
      title: pageTitle.replace(' : 네이버 블로그', ''),
      imageUrl: mainImageUrl || '',
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 네이버 블로그 처리 오류:`, error);

    // 브라우저가 열려있으면 종료
    if (browser) {
      await browser.close();
    }

    throw error;
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

    // 네이버 블로그 체크 및 처리
    if (isUrl && /blog\.naver\.com/i.test(text)) {
      try {
        console.log(`[${new Date().toISOString()}] 네이버 블로그 URL 감지: ${text}`);
        const { content, title, imageUrl } = await extractNaverBlogContent(text);

        return NextResponse.json({
          content,
          sourceUrl: text,
          title,
          imageUrl,
          isExtracted: true,
          type: 'naverblog',
        });
      } catch (error: any) {
        console.error(`[${new Date().toISOString()}] 네이버 블로그 처리 실패:`, error);
        return NextResponse.json(
          {
            error: `네이버 블로그 처리 중 오류: ${error.message || '알 수 없는 오류'}`,
          },
          { status: 400 }
        );
      }
    }

    // 유튜브 URL 확인
    if (isYoutubeUrl(text)) {
      const videoId = extractYoutubeId(text);
      if (!videoId) {
        return NextResponse.json({ error: '유효한 유튜브 URL이 아닙니다' }, { status: 400 });
      }

      try {
        console.log(`[${new Date().toISOString()}] 유튜브 처리 시작: ${videoId}`);
        const totalStartTime = Date.now();

        // 병렬 요청 시작 시간 기록
        console.log(`[${new Date().toISOString()}] 자막 및 메타데이터 병렬 요청 시작`);
        const parallelStartTime = Date.now();

        // 병렬로 자막과 메타데이터 가져오기
        const [transcriptText, metadata] = await Promise.all([
          fetchYoutubeTranscriptWithInnertube(videoId),
          getYoutubeMetadata(videoId),
        ]);

        console.log(
          `[${new Date().toISOString()}] 병렬 요청 완료 (${Date.now() - parallelStartTime}ms)`
        );
        console.log(`[${new Date().toISOString()}] 총 처리 시간: ${Date.now() - totalStartTime}ms`);

        // 결과 요약 더 자세히 기록
        console.log('유튜브 처리 결과 요약:');
        console.log('----------------------------');
        console.log('비디오 ID:', videoId);
        console.log('제목 (길이):', metadata.title, `(${metadata.title.length}자)`);
        console.log('썸네일 URL:', metadata.thumbnailUrl);
        console.log('썸네일 기본 URL 여부:', metadata.thumbnailUrl.indexOf('?') === -1);
        console.log('자막 길이:', transcriptText.length, '자');
        console.log('자막 일부:', transcriptText.substring(0, 100) + '...');
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
