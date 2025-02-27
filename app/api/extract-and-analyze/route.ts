// app/api/extract-and-analyze/route.ts
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { YoutubeTranscript } from 'youtube-transcript';

// 크롬 실행 경로 (로컬 개발용)
const CHROME_PATH =
  process.env.CHROME_PATH ||
  (process.platform === 'win32'
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : '/usr/bin/google-chrome');

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

export async function POST(request: Request) {
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
        // youtube-transcript-api를 사용하여 자막 가져오기
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);

        if (!transcript || transcript.length === 0) {
          throw new Error('자막을 가져올 수 없습니다');
        }

        // 자막 텍스트 결합
        const transcriptText = transcript
          .map((item) => item.text)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return NextResponse.json({
          content: transcriptText,
          sourceUrl: text,
          isExtracted: true,
          type: 'youtube',
        });
      } catch (error: any) {
        return NextResponse.json(
          {
            error: '이 영상에서 자막을 가져올 수 없습니다: ' + error.message,
          },
          { status: 400 }
        );
      }
    }

    // 일반 웹페이지 콘텐츠 추출 (기존 코드 유지)
    let browser = null;
    try {
      browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

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
      await page.goto(text, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // HTML 가져오기
      const html = await page.content();

      // Readability로 콘텐츠 추출
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
    } finally {
      if (browser) await browser.close();
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
