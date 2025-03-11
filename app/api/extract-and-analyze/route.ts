// app/api/extract-and-analyze/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { Innertube } from 'youtubei.js';
import { createSupabaseServerClient } from '@/lib/supabse/server';

// 콘텐츠 소스 인터페이스 정의
interface ContentSource {
  id: string;
  canonical_url: string;
  source_type: string;
  content: string;
  title: string | null;
  image_url: string | null;
  access_count: number;
  created_at: string;
  updated_at: string;
}

// 소스 조회 결과 인터페이스 정의
interface SourceResult {
  existingSource: boolean;
  source?: ContentSource;
  canonicalUrl?: string;
  urlType?: 'youtube' | 'naver_blog' | 'website';
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

// URL 정규화 함수 - 다양한 URL 형식을 표준화
function normalizeUrl(url: string): string {
  try {
    // 1. 기본 정규화
    url = url.trim();

    // 2. 프로토콜 정규화 (http → https)
    url = url.replace(/^http:\/\//i, 'https://');

    // 3. 유튜브 URL 정규화
    if (isYoutubeUrl(url)) {
      const videoId = extractYoutubeId(url);
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    // 4. 네이버 블로그 정규화 (모바일 ↔ PC)
    const naverBlogMatch = url.match(/^https?:\/\/(m\.)?(blog\.naver\.com)\/([^\/]+)\/(\d+)/i);
    if (naverBlogMatch) {
      const username = naverBlogMatch[3];
      const postId = naverBlogMatch[4];
      return `https://blog.naver.com/${username}/${postId}`;
    }

    // 5. 추적 파라미터 제거
    try {
      const urlObj = new URL(url);

      // 제거할 파라미터 목록
      const paramsToRemove = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'fbclid',
        'gclid',
        'ocid',
        'ref',
        'source',
        'mc_cid',
        'mc_eid',
      ];

      // 파라미터 제거
      paramsToRemove.forEach((param) => {
        urlObj.searchParams.delete(param);
      });

      return urlObj.toString();
    } catch (e) {
      // URL 파싱 실패 시 원래 URL 반환
      return url;
    }
  } catch (e) {
    console.error('URL 정규화 오류:', e);
    return url; // 오류 발생 시 원래 URL 반환
  }
}

// 웹페이지 컨텐츠 정제 함수
function cleanWebContent(text: string): string {
  if (!text) return '';

  console.log(`[${new Date().toISOString()}] 컨텐츠 정제 시작 (원본 길이: ${text.length}자)`);

  // 1단계: 기본 정제
  let cleaned = text
    .replace(/\r\n/g, '\n') // Windows 줄바꿈 통일
    .replace(/\t/g, ' ') // 탭을 공백으로 변환
    .replace(/[ \t]+/g, ' ') // 여러 공백을 하나로 통합
    .trim();

  // 2단계: 의미 없는 짧은 줄과 메뉴 항목 제거
  let lines = cleaned.split('\n');

  // 짧은 텍스트(3글자 이하)만 있는 줄 필터링
  // 단, 숫자만 있는 경우(날짜, 시간 등)는 유지
  lines = lines.filter((line) => {
    const trimmed = line.trim();

    // 빈 줄 제거
    if (!trimmed) return false;

    // 짧은 줄 중 의미 있는 것 보존 (숫자, 날짜 등)
    if (trimmed.length <= 3) {
      // 숫자만 있는 줄은 유지 (날짜, 시간 등)
      if (/^\d+$/.test(trimmed)) return true;

      // 화살표, 기호만 있는 줄 제거
      if (/^[>•※◆★☆\-_=+<>,.]+$/.test(trimmed)) return false;

      return false; // 그 외 짧은 줄 제거
    }

    // 메뉴, 탐색, 기능 버튼 패턴 제거
    const menuPatterns = [
      '메뉴',
      '홈',
      '로그인',
      '회원가입',
      '검색',
      '설정',
      '공지사항',
      '이용약관',
      '개인정보',
      '고객센터',
      '결제',
      '배송',
      '주문',
      '장바구니',
      '최근 본',
      '찜한',
      '좋아요',
      '공유',
      '복사',
      '신고',
      '페이지',
      '카테고리',
      '전체보기',
      '더보기',
      '이전',
      '다음',
      'TOP',
      'FAQ',
    ];

    // 메뉴 패턴이 포함된 짧은 줄(10자 이하) 제거
    if (trimmed.length <= 10) {
      for (const pattern of menuPatterns) {
        if (trimmed.includes(pattern)) return false;
      }
    }

    return true;
  });

  // 3단계: 연속된 빈 줄 하나로 통합
  let lastLineEmpty = false;
  let consolidatedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const isEmpty = !trimmed;

    if (isEmpty) {
      if (!lastLineEmpty) {
        consolidatedLines.push('');
        lastLineEmpty = true;
      }
    } else {
      consolidatedLines.push(trimmed);
      lastLineEmpty = false;
    }
  }

  // 4단계: 추가 특수 패턴 정제
  // 화살표, 특수문자로 시작하는 메뉴/내비게이션 항목 제거
  consolidatedLines = consolidatedLines.filter((line) => {
    // 화살표로 시작하는 내비게이션 메뉴 항목 제거
    if (/^[>▶▷→⇒◀◁←⇐]/.test(line)) return false;

    // 기호로 시작하는 짧은 항목 제거 (10자 이하)
    if (line.length <= 10 && /^[•※◆★☆\-_=+]/.test(line)) return false;

    return true;
  });

  // 5단계: 중복 텍스트 섹션 제거 (예: 반복된 푸터/헤더)
  let uniqueSections = new Set<string>();
  let isDuplicate = false;
  let finalLines: string[] = [];

  // 4줄 이상의 섹션을 비교하여 중복 제거
  for (let i = 0; i < consolidatedLines.length; i++) {
    isDuplicate = false;

    // 4줄 이상 남아있는 경우에만 검사
    if (i <= consolidatedLines.length - 4) {
      // 4줄 섹션 생성
      const section = consolidatedLines.slice(i, i + 4).join('\n');

      // 이미 등장한 섹션인지 확인
      if (uniqueSections.has(section)) {
        isDuplicate = true;
        i += 3; // 중복 섹션 건너뛰기
      } else {
        uniqueSections.add(section);
      }
    }

    if (!isDuplicate) {
      finalLines.push(consolidatedLines[i]);
    }
  }

  // 6단계: 컨텐츠의 시작과 끝에 있는 잔여 메뉴 항목 제거
  // 본문은 일반적으로 여러 줄의 문장이 연속되므로, 앞뒤에 고립된 짧은 줄은 메뉴일 가능성 높음
  let startContent = 0;
  let endContent = finalLines.length - 1;

  // 시작 위치 찾기: 첫 번째 의미 있는 텍스트 블록 시작점
  for (let i = 0; i < finalLines.length; i++) {
    const line = finalLines[i].trim();
    const nextLine = i < finalLines.length - 1 ? finalLines[i + 1].trim() : '';

    // 현재 줄이 비어있지 않고, 다음 줄이 있으며 둘 다 적당한 길이가 있으면 본문 시작으로 간주
    if (line && nextLine && line.length > 10 && nextLine.length > 10) {
      startContent = i;
      break;
    }

    // 긴 줄(30자 이상)은 제목일 가능성이 높으므로 본문 시작으로 간주
    if (line.length >= 30) {
      startContent = i;
      break;
    }
  }

  // 끝 위치 찾기: 마지막 의미 있는 텍스트 블록 종료점
  for (let i = finalLines.length - 1; i >= 0; i--) {
    const line = finalLines[i].trim();
    const prevLine = i > 0 ? finalLines[i - 1].trim() : '';

    // 현재 줄이 비어있지 않고, 이전 줄이 있으며 둘 다 적당한 길이가 있으면 본문 끝으로 간주
    if (line && prevLine && line.length > 10 && prevLine.length > 10) {
      endContent = i;
      break;
    }

    // 긴 줄은 본문 끝으로 간주
    if (line.length >= 30) {
      endContent = i;
      break;
    }
  }

  // 시작과 끝 위치가 타당한지 확인 (최소 25%의 컨텐츠를 유지)
  const contentLength = endContent - startContent + 1;
  if (contentLength < finalLines.length * 0.25) {
    // 너무 많은 컨텐츠가 잘릴 경우 원래 텍스트 유지
    startContent = 0;
    endContent = finalLines.length - 1;
  }

  // 최종 결과 조합
  let result = finalLines.slice(startContent, endContent + 1).join('\n');

  // 7단계: 최종 정리
  result = result
    .replace(/\n{3,}/g, '\n\n') // 3줄 이상 공백을 2줄로 정리
    .trim();

  console.log(`[${new Date().toISOString()}] 컨텐츠 정제 완료 (최종 길이: ${result.length}자)`);
  console.log(
    `[${new Date().toISOString()}] 제거된 용량: ${text.length - result.length}자 (${(
      ((text.length - result.length) / text.length) *
      100
    ).toFixed(1)}%)`
  );

  return result;
}

// 유튜브 URL 확인 함수
function isYoutubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(url);
}

// 유튜브 비디오 ID 추출 함수
function extractYoutubeId(url: string): string | null {
  // 단축 URL 형식 (youtu.be)
  let shortMatch = url.match(/^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?|$)/);
  if (shortMatch) {
    return shortMatch[1];
  }

  // 일반 YouTube URL 형식
  let longMatch = url.match(
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&|$)/
  );
  if (longMatch) {
    return longMatch[1];
  }

  // 임베드 URL 형식
  let embedMatch = url.match(
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?|$)/
  );
  if (embedMatch) {
    return embedMatch[1];
  }

  return null;
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
      let fullText = transcript
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

      // 추가: 동일한 변수명을 사용하여 텍스트 정제
      fullText = fullText
        .replace(/\n{3,}/g, '\n\n') // 여러 줄바꿈 제거
        .replace(/[ \t]+/g, ' ') // 여러 공백 제거
        .split('\n')
        .map((line) => line.trim()) // 각 라인 앞뒤 공백 제거
        .filter((line) => line) // 빈 라인 제거
        .join('\n')
        .trim(); // 전체 앞뒤 공백 제거

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

// PC URL을 모바일 URL로 변환하는 함수
function convertToNaverMobileUrl(url: string): string {
  try {
    // PC URL 형식 확인: https://blog.naver.com/유저명/포스트ID
    const pcUrlPattern = /^https?:\/\/(blog\.naver\.com)\/([^\/]+)\/(\d+)/i;
    const matches = url.match(pcUrlPattern);

    if (matches && matches.length >= 4) {
      const username = matches[2];
      const postId = matches[3];

      // 모바일 URL 생성: https://m.blog.naver.com/유저명/포스트ID
      return `https://m.blog.naver.com/${username}/${postId}`;
    }

    return url; // 패턴이 일치하지 않으면 원래 URL 반환
  } catch (e) {
    console.error('URL 변환 오류:', e);
    return url; // 오류 발생 시 원래 URL 반환
  }
}

// 네이버 블로그 이미지 URL 수정 함수
function fixNaverImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';

  try {
    // 네이버 블로그 썸네일 URL 패턴 확인
    if (imageUrl.includes('blogthumb.pstatic.net') || imageUrl.includes('postfiles.pstatic.net')) {
      // URL에 캐시 버스팅 파라미터 추가
      const separator = imageUrl.includes('?') ? '&' : '?';
      // User-Agent 관련 문제를 우회하기 위해 파라미터 추가
      return `${imageUrl}${separator}type=w966&nocache=${Date.now()}`;
    }

    return imageUrl; // 패턴이 일치하지 않으면 원래 URL 반환
  } catch (e) {
    console.error('이미지 URL 수정 오류:', e);
    return imageUrl; // 오류 발생 시 원래 URL 반환
  }
}

// 네이버 블로그 특화 처리 함수
async function extractNaverBlogContent(
  url: string
): Promise<{ content: string; title: string; imageUrl: string }> {
  console.log(`[${new Date().toISOString()}] 네이버 블로그 처리 시작: ${url}`);

  // URL을 모바일 버전으로 변환 (여기에 추가)
  const mobileUrl = convertToNaverMobileUrl(url);
  if (mobileUrl !== url) {
    console.log(`[${new Date().toISOString()}] PC URL을 모바일 URL로 변환: ${url} -> ${mobileUrl}`);
    url = mobileUrl; // 변환된 URL로 업데이트
  }

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

    // ---------- 네이버 블로그 컨텐츠 정제 로직 ----------
    if (content) {
      // 1. 기본 텍스트 정제
      content = content
        .replace(/\n{3,}/g, '\n\n') // 여러 줄바꿈 제거
        .replace(/[ \t]+/g, ' ') // 여러 공백 제거
        .split('\n')
        .map((line) => line.trim()) // 각 라인 앞뒤 공백 제거
        .filter((line) => line) // 빈 라인 제거
        .join('\n')
        .trim();

      // 2. 네이버 블로그 UI 요소 및 반복 패턴 제거

      // 로그인, 메뉴 관련 UI 상단 텍스트 제거
      const commonHeaderPatterns = [
        '로그인이 필요합니다.',
        '내소식',
        '이웃목록',
        '통계',
        '클립만들기',
        '글쓰기',
        'My Menu 닫기',
        '내 체크인',
        '최근 본 글',
        '내 동영상',
        '내 클립',
        '내 상품 관리',
        'NEW',
        '마켓 플레이스',
        '장바구니',
        '마켓 구매내역',
        '블로그팀 공식블로그',
        '이달의 블로그',
        '공식 블로그',
        '블로그 앱',
        'PC버전으로 보기',
        '블로그 고객센터',
        'ⓒ NAVER Corp.',
        '블로그',
        '카테고리 이동',
        '검색',
        'MY메뉴 열기',
      ];

      // 본문 하단 네비게이션 UI 제거
      const commonFooterPatterns = [
        '공감한 사람 보러가기',
        '댓글',
        '공유하기',
        '이웃추가',
        '공식블로그',
        '{"title":',
        '닫기',
        '카테고리',
        '이 블로그 홈',
      ];

      // 상단 메뉴 부분 전체 블록 제거 (시작부터 본문 제목 전까지)
      // 정규표현식을 사용하여 본문 시작 전 UI 부분 제거
      content = content.replace(/^로그인이 필요합니다[\s\S]*?MY메뉴 열기[\s\S]*?/, '');

      // 하단 UI 관련 텍스트 제거 (공감, 댓글 부분부터 끝까지)
      content = content.replace(/\d+\s*공감한 사람 보러가기[\s\S]*$/, '');

      // 개별 패턴 제거 (위 패턴으로 완전히 제거되지 않은 경우를 위한 백업 처리)
      let lines = content.split('\n');
      lines = lines.filter((line) => {
        // 공통 헤더/푸터 패턴과 일치하는 라인 제거
        for (const pattern of [...commonHeaderPatterns, ...commonFooterPatterns]) {
          if (line.includes(pattern)) {
            return false;
          }
        }
        return true;
      });

      // 포스트 본문의 시작을 찾아 그 이전의 모든 불필요한 텍스트 제거
      let contentStartIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        // 일반적으로 본문 제목은 두 줄 이상의 빈 줄 뒤에 나타남
        if (lines[i].length > 10 && i > 5) {
          contentStartIndex = i - 1;
          break;
        }
      }

      if (contentStartIndex > 0) {
        lines = lines.slice(contentStartIndex);
      }

      // 다시 문자열로 합치기
      content = lines.join('\n').trim();

      // 추가 정제: 반복되는 "본문 폰트 크기 조정" 등의 UI 요소 제거
      content = content.replace(/본문 기타 기능[\s\S]*?본문 폰트 크기 크게 보기/, '');

      // 정리된 콘텐츠의 최종 정제
      content = content
        .replace(/^\s*가\s*$/, '') // "가" 단일 문자 제거 (폰트 크기 조정 관련)
        .replace(/공감\s*공유하기\s*URL복사\s*신고하기/, '') // 하단 액션 버튼 텍스트 제거
        .replace(/\n{3,}/g, '\n\n') // 다시 한번 여러 줄바꿈 제거
        .trim();

      console.log(
        `[${new Date().toISOString()}] 네이버 블로그 컨텐츠 정제 완료 (${content.length}자)`
      );
    }
    // --------------------------------------------------------

    // 충분한 컨텐츠가 추출되었는지 확인
    if (!content || content.trim().length < 200) {
      throw new Error('네이버 블로그 컨텐츠를 충분히 추출할 수 없습니다.');
    }

    console.log(
      `[${new Date().toISOString()}] 네이버 블로그 컨텐츠 추출 성공 (${content.length}자)`
    );

    let fixedImageUrl = mainImageUrl;
    if (mainImageUrl) {
      fixedImageUrl = fixNaverImageUrl(mainImageUrl);
      if (fixedImageUrl !== mainImageUrl) {
        console.log(
          `[${new Date().toISOString()}] 이미지 URL 수정: ${mainImageUrl} -> ${fixedImageUrl}`
        );
      }
    }

    // 최종 추출된 컨텐츠에 추가로 빈 줄/공백 정제 함수 적용
    content = cleanWebContent(content);

    return {
      content,
      title: pageTitle.replace(' : 네이버 블로그', ''),
      imageUrl: fixedImageUrl || '',
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

// URL 타입 감지 함수
function detectUrlType(url: string): 'youtube' | 'naver_blog' | 'website' {
  if (isYoutubeUrl(url)) {
    return 'youtube';
  } else if (url.includes('blog.naver.com') || url.includes('m.blog.naver.com')) {
    return 'naver_blog';
  } else {
    return 'website';
  }
}

// 콘텐츠 소스 조회 또는 생성 함수
async function getOrCreateContentSource(url: string): Promise<SourceResult> {
  try {
    const supabase = await createSupabaseServerClient();

    // URL 정규화
    const canonicalUrl = normalizeUrl(url);
    console.log(`URL 정규화: ${url} → ${canonicalUrl}`);

    // 정규화된 URL을 사용하여 기존 소스 조회
    const { data: existingSource, error: sourceError } = await supabase
      .from('content_sources')
      .select('*')
      .eq('canonical_url', canonicalUrl)
      .single();

    // 기존 소스가 있으면 접근 카운트 증가 후 반환
    if (existingSource && !sourceError) {
      console.log(`기존 소스 발견 (ID: ${existingSource.id}), 접근 카운트 증가`);

      // 접근 카운트 증가
      await supabase
        .from('content_sources')
        .update({
          access_count: existingSource.access_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSource.id);

      return {
        existingSource: true,
        source: existingSource as ContentSource,
      };
    }

    // 기존 소스가 없으면 새로 생성 준비
    return {
      existingSource: false,
      canonicalUrl,
      urlType: detectUrlType(canonicalUrl),
    };
  } catch (error) {
    console.error('콘텐츠 소스 조회 오류:', error);
    throw new Error('콘텐츠 소스 조회 중 오류가 발생했습니다');
  }
}

// 콘텐츠 소스 저장 함수
async function saveContentSource(sourceData: {
  canonicalUrl: string;
  sourceType: string;
  content: string;
  title: string;
  imageUrl: string;
}): Promise<ContentSource> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: newSource, error } = await supabase
      .from('content_sources')
      .insert({
        canonical_url: sourceData.canonicalUrl,
        source_type: sourceData.sourceType,
        content: sourceData.content,
        title: sourceData.title || null,
        image_url: sourceData.imageUrl || null,
        access_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !newSource) {
      console.error('콘텐츠 소스 저장 오류:', error);
      throw new Error(`콘텐츠 소스 저장 실패: ${error?.message || '알 수 없는 오류'}`);
    }

    return newSource as ContentSource;
  } catch (error) {
    console.error('콘텐츠 소스 저장 오류:', error);
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

    // 1. 콘텐츠 소스 조회 (캐싱 활용)
    const sourceResult = await getOrCreateContentSource(text);

    // 2. 기존 소스가 있으면 바로 반환
    if (sourceResult.existingSource && sourceResult.source) {
      const existingSource = sourceResult.source;
      console.log(`캐시된 콘텐츠 사용: ${existingSource.id}`);

      return NextResponse.json({
        content: existingSource.content,
        sourceUrl: text,
        title: existingSource.title || '',
        imageUrl: existingSource.image_url || '',
        isExtracted: true,
        type: existingSource.source_type,
        sourceId: existingSource.id, // 중요: 소스 ID 클라이언트에 전달
      });
    }

    // 3. 소스가 없으면 URL 타입에 따라 콘텐츠 추출 진행
    if (!sourceResult.canonicalUrl || !sourceResult.urlType) {
      throw new Error('URL 정규화 또는 타입 감지에 실패했습니다');
    }

    const canonicalUrl = sourceResult.canonicalUrl;
    const urlType = sourceResult.urlType;

    let extractedContent = '';
    let extractedTitle = '';
    let extractedImageUrl = '';

    // 4. URL 타입별 처리
    if (urlType === 'youtube') {
      console.log('유튜브 콘텐츠 추출 시작');

      // 유튜브 자막 추출
      const videoId = extractYoutubeId(canonicalUrl);
      if (!videoId) {
        return NextResponse.json({ error: '유효한 유튜브 URL이 아닙니다' }, { status: 400 });
      }

      // 병렬로 자막과 메타데이터 가져오기
      const [transcriptText, metadata] = await Promise.all([
        fetchYoutubeTranscriptWithInnertube(videoId),
        getYoutubeMetadata(videoId),
      ]);

      // 정제 함수 적용
      extractedContent = cleanWebContent(transcriptText);
      extractedTitle = metadata.title;
      extractedImageUrl = metadata.thumbnailUrl;
    } else if (urlType === 'naver_blog') {
      console.log('네이버 블로그 콘텐츠 추출 시작');

      // 네이버 블로그 콘텐츠 추출
      const { content, title, imageUrl } = await extractNaverBlogContent(canonicalUrl);
      extractedContent = content;
      extractedTitle = title;
      extractedImageUrl = imageUrl;
    } else {
      console.log('일반 웹페이지 콘텐츠 추출 시작');

      // 일반 웹페이지 콘텐츠 추출 (기존 로직 사용)
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
        await page.goto(canonicalUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });

        // 페이지 제목 가져오기
        extractedTitle = await page.title();
        console.log('웹페이지 제목:', extractedTitle);

        // 메인 이미지 추출
        extractedImageUrl = await extractMainImage(page);

        // 상대 경로 URL을 절대 경로로 변환
        if (extractedImageUrl && !extractedImageUrl.startsWith('http')) {
          const pageUrl = new URL(canonicalUrl);
          if (extractedImageUrl.startsWith('/')) {
            extractedImageUrl = `${pageUrl.protocol}//${pageUrl.host}${extractedImageUrl}`;
          } else {
            extractedImageUrl = `${pageUrl.protocol}//${pageUrl.host}/${extractedImageUrl}`;
          }
          console.log('변환된 이미지 URL:', extractedImageUrl);
        }

        // HTML 콘텐츠 가져오기
        html = await page.content();

        // 중요: HTML을 얻은 즉시 브라우저 종료
        await browser.close();
        browser = null;

        // Readability로 콘텐츠 추출
        const dom = new JSDOM(html, { url: canonicalUrl });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article || !article.textContent || article.textContent.length < 100) {
          throw new Error('콘텐츠를 충분히 추출할 수 없습니다.');
        }

        // 접근 제한 체크
        const accessDeniedKeywords = [
          'access denied',
          'permission denied',
          'forbidden',
          '접근 금지',
          '권한 없음',
        ];

        const pageTitle = article.title?.toLowerCase() || '';
        const pageContent = article.textContent.toLowerCase();

        for (const keyword of accessDeniedKeywords) {
          if (pageTitle.includes(keyword) || pageContent.includes(keyword)) {
            throw new Error(`웹사이트에 접근이 거부되었습니다 (${article.title}).`);
          }
        }

        // 정제된 콘텐츠 생성
        extractedContent = cleanWebContent(article.textContent);

        // 제목이 추출되지 않았으면 article에서 가져오기
        if (!extractedTitle && article.title) {
          extractedTitle = article.title;
        }

        // 이미지가 추출되지 않았으면 HTML에서 추가 검색
        if (!extractedImageUrl) {
          // og:image 메타 태그 확인
          const ogImageMatch = html.match(
            /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
          );
          if (ogImageMatch && ogImageMatch[1]) {
            extractedImageUrl = ogImageMatch[1];
          } else {
            // twitter:image 메타 태그 확인
            const twitterImageMatch = html.match(
              /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i
            );
            if (twitterImageMatch && twitterImageMatch[1]) {
              extractedImageUrl = twitterImageMatch[1];
            }
          }
        }
      } catch (browserError) {
        // 브라우저 관련 오류 처리
        if (browser) {
          await browser.close();
        }
        throw browserError;
      }
    }

    // 5. 추출 성공 시 content_sources 테이블에 저장
    const newSource = await saveContentSource({
      canonicalUrl: canonicalUrl,
      sourceType: urlType,
      content: extractedContent,
      title: extractedTitle,
      imageUrl: extractedImageUrl,
    });

    console.log(`새 콘텐츠 소스 저장 완료 (ID: ${newSource.id})`);

    // 6. 결과 반환 (sourceId 포함)
    return NextResponse.json({
      content: extractedContent,
      sourceUrl: text,
      title: extractedTitle || '',
      imageUrl: extractedImageUrl || '',
      isExtracted: true,
      type: urlType,
      sourceId: newSource.id, // 중요: 소스 ID 클라이언트에 전달
    });
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
