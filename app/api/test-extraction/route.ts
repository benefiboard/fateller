import { NextResponse } from 'next/server';
import axios from 'axios';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL이 필요합니다' }, { status: 400 });
    }

    // 1. 일반 HTTP 요청으로 콘텐츠 가져오기
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // 2. Mozilla의 Readability로 추출 시도
    const dom = new JSDOM(response.data, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    
    // 3. Cheerio로 추출 시도
    const $ = cheerio.load(response.data);
    const bodyText = $('body').text().trim();
    
    // 4. 결과 반환
    return NextResponse.json({ 
      url,
      title: article?.title || '제목 추출 실패',
      readabilityContent: article?.textContent || '콘텐츠 추출 실패 (Readability)',
      cheerioContent: bodyText || '콘텐츠 추출 실패 (Cheerio)',
      contentLength: {
        readability: article?.textContent?.length || 0,
        cheerio: bodyText?.length || 0
      }
    });
  } catch (error: any) {
    console.error('콘텐츠 추출 오류:', error);
    return NextResponse.json(
      { error: '콘텐츠를 추출하는 중 오류가 발생했습니다', message: error.message },
      { status: 500 }
    );
  }
}