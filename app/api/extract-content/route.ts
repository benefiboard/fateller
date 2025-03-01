import { NextResponse, type NextRequest } from 'next/server';
import puppeteer from 'puppeteer-core'; // 로컬 개발용
import puppeteerCore from 'puppeteer-core'; // Vercel 환경용
import chromium from '@sparticuz/chromium-min'; // Vercel 환경용
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

export async function POST(request: NextRequest) {
  // 1. URL 추출
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: 'URL이 필요합니다' }, { status: 400 });
  }

  // 2. 브라우저 설정
  let browser;
  try {
    // 환경에 따른 브라우저 시작
    if (isVercelProduction()) {
      // Vercel 환경에서 @sparticuz/chromium-min 사용
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
      // 로컬 개발 환경에서는 로컬 Chrome 경로 지정
      console.log('로컬 환경에서 실행 중...', CHROME_PATH);
      browser = await puppeteer.launch({
        executablePath: CHROME_PATH, // 로컬 Chrome 경로 지정
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    // 3. 페이지 설정 및 콘텐츠 추출 (이하 동일)
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
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // HTML 콘텐츠 가져오기
    const html = await page.content();

    // 4. Readability로 콘텐츠 추출
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent || article.textContent.length < 100) {
      throw new Error('콘텐츠를 충분히 추출할 수 없습니다.');
    }

    // 추출된 텍스트 정제
    const extractedContent = article.textContent
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim();

    // 5. 결과 반환
    return NextResponse.json({
      content: extractedContent,
      sourceUrl: url,
      title: article.title || '',
      isExtracted: true,
      type: 'webpage',
    });
  } catch (error: any) {
    console.error('처리 오류:', error);
    return NextResponse.json(
      { error: error.message || '처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}
