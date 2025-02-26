import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

// 크롬 실행 경로 (로컬 개발용)
const CHROME_PATH =
  process.env.CHROME_PATH ||
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : '/usr/bin/google-chrome');

export async function POST(request: Request) {
  const body = await request.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ error: 'URL이 필요합니다' }, { status: 400 });
  }

  // 네이버 블로그 감지
  if (url.includes('blog.naver.com')) {
    return NextResponse.json(
      {
        error: '네이버 블로그는 현재 지원되지 않습니다',
        unsupportedSite: true,
      },
      { status: 400 }
    );
  }

  let browser = null;

  try {
    // Puppeteer 브라우저 시작
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // 모바일 장치 에뮬레이션 (일부 사이트에서 더 잘 작동)
    await page.emulate({
      viewport: {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        isLandscape: false,
      },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    });

    // 유저 에이전트 설정
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    // 쿠키 수락 자동화 (많은 사이트에서 필요)
    await page.setCookie({
      name: 'cookieconsent_status',
      value: 'dismiss',
      domain: new URL(url).hostname,
    });

    // 불필요한 리소스 차단하여 속도 향상
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      // 이미지, 폰트, 미디어 등 차단
      if (['image', 'font', 'media', 'stylesheet'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 페이지 로드 및 렌더링 대기 (타임아웃 단축)
    await page.goto(url, {
      waitUntil: 'domcontentloaded', // networkidle2보다 더 빠름
      timeout: 15000,
    });

    // 일부 사이트는 스크롤이 필요함 (속도 최적화)
    await autoScroll(page, 3); // 최대 3번만 스크롤

    // 사이트별 특수 처리
    const hostname = new URL(url).hostname;

    if (hostname.includes('brunch.co.kr')) {
      // 브런치 특수 처리
      try {
        // 로그인 팝업이 있으면 닫기 버튼 클릭
        const closeButton = await page.$('.btn_close');
        if (closeButton) {
          await closeButton.click();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (e) {
        console.log('브런치 팝업 처리 오류', e);
      }
    }

    // 페이지 콘텐츠 가져오기
    const html = await page.content();

    // Readability로 콘텐츠 추출
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    // 페이지 타이틀과 메타 정보 추출
    const title = await page.title();
    const metaDescription = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]');
      return meta ? meta.getAttribute('content') : '';
    });

    // 직접 HTML에서 주요 콘텐츠 추출 시도
    const directExtractedContent = await page.evaluate(() => {
      // 일반적인 콘텐츠 컨테이너 선택자
      const contentSelectors = [
        'article',
        '.article',
        '.post',
        '.content',
        '.post-content',
        '.entry-content',
        '.story',
        '.post__content',
        '.article__content',
        '#article',
        '#content',
        '#post-content',
      ];

      for (const selector of contentSelectors) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          return element.innerText;
        }
      }

      // 특별한 사이트 선택자
      // 브런치
      if (document.querySelector('.wrap_body .wrap_content')) {
        return (document.querySelector('.wrap_body .wrap_content') as HTMLElement).innerText;
      }

      // 티스토리
      if (document.querySelector('.tt_article_useless_p_margin')) {
        return (document.querySelector('.tt_article_useless_p_margin') as HTMLElement).innerText;
      }

      // 네이버 블로그
      if (document.querySelector('.se-main-container')) {
        return (document.querySelector('.se-main-container') as HTMLElement).innerText;
      }

      return '';
    });

    // 콘텐츠 정제
    const cleanedReadabilityContent = cleanText(article?.textContent || '');
    const cleanedDirectContent = cleanText(directExtractedContent || '');

    return NextResponse.json({
      url,
      title: article?.title || title || '제목 추출 실패',
      metaDescription,
      readabilityContent: cleanedReadabilityContent || '콘텐츠 추출 실패 (Readability)',
      directExtractedContent: cleanedDirectContent || '직접 추출 실패',
      contentLength: {
        readability: cleanedReadabilityContent.length,
        directExtracted: cleanedDirectContent.length,
      },
    });
  } catch (error: any) {
    console.error('Puppeteer 콘텐츠 추출 오류:', error);
    return NextResponse.json(
      { error: '콘텐츠를 추출하는 중 오류가 발생했습니다', message: error.message },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 페이지 자동 스크롤 함수 (전체 콘텐츠 로드를 위함)
// 페이지 자동 스크롤 함수 (최적화 버전)
async function autoScroll(page: any, maxScrolls = 5) {
  await page.evaluate(async (maxScrolls: number) => {
    await new Promise<void>((resolve) => {
      let scrollCount = 0;
      const distance = 300;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        scrollCount++;

        if (scrollCount >= maxScrolls) {
          clearInterval(timer);
          resolve();
        }
      }, 50); // 더 빠른 스크롤
    });
  }, maxScrolls);
}

// 텍스트 정제 함수 - 불필요한 공백 제거
function cleanText(text: string): string {
  if (!text) return '';

  return (
    text
      // 연속된 줄바꿈 3개 이상을 2개로 줄임
      .replace(/\n{3,}/g, '\n\n')
      // 연속된 공백을 하나로 줄임
      .replace(/[ \t]+/g, ' ')
      // 각 줄 앞뒤 공백 제거
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      // 시작과 끝의 불필요한 줄바꿈 제거
      .trim()
  );
}
