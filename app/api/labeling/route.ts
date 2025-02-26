// app/api/labeling/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 트위터 스타일 프롬프트
const TWITTER_PROMPT = `당신은 트위터 최적화 전문가입니다.
1.먼저 유저의 입력 내용이 일반적인 내용인지 개인적인 내용인지 확인 후
2.사용자가 저장한 생각/메모/정보를 트위터에서 유저들이 쉽게 이해할 수 있는 포스트로 변환해 주세요.
3.스레드를 너무 잘게 쪼개지 말아주세요!
아래의 형식에 따라 정확히 JSON 객체를 생성해주세요:
{
  "title": "입력받은 텍스트의 핵심 아이디어를 표현하는 제목",
  "tweet_main": "핵심 메시지를 200자 이내로 압축",
  "hashtags": ["관련해시태그1", "관련해시태그2"],
  "thread": [
    "1. 스레드 첫 번째 트윗",
    "2. 스레드 두 번째 트윗"
  ],
  "labeling": {
    "category": "아래 카테고리 중 하나만 선택",
    "keywords": ["키워드1", "키워드2", "키워드3"],
    "key_sentence": "콘텐츠의 핵심을 담은 한 문장"
  }
}
카테고리는 다음 중 하나만 선택하세요(유저의 콘텐츠가 개인적인지 일반적인지 먼저 파악 후):
- 인문/철학
- 경영/경제
- 사회과학
- 자연과학
- 기술/공학
- 의학/건강
- 예술/문화
- 문학/창작
- 자기계발
- 할 일/액션
- 일기/성찰
필수 가이드라인:
1. 이모지 사용 금지: 대신 숫자(1, 2, 3) 또는 알파벳(a, b, c)을 사용하여 포인트 구분
2. 첫 문장에 강력한 후킹 요소 포함: HOW TO, 질문형, 숫자, FOMO 유발 표현 등
3. 트윗과 스레드는 모두 200자 제한 준수
4. 반드시 스레드는 최대 5개까지만 작성
결과는 반드시 유효한 JSON 형식으로만 응답하세요. 추가 설명이나 텍스트는 포함하지 마세요.
`;

export async function POST(req: NextRequest) {
  try {
    // 요청에서 텍스트 추출
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: '유효한 텍스트가 필요합니다.' }, { status: 400 });
    }

    // API 키 확인
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // 또는 사용 가능한 다른 모델
        messages: [
          {
            role: 'system',
            content: TWITTER_PROMPT,
          },
          {
            role: 'user',
            content: `다음 텍스트를 분석하고 JSON 형식으로 응답해주세요: ${text}`,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API 오류:', errorData);
      return NextResponse.json(
        { error: `API 오류: ${errorData.error?.message || '알 수 없는 오류가 발생했습니다.'}` },
        { status: response.status }
      );
    }

    // 응답 데이터 처리
    const data = await response.json();

    try {
      // API 응답에서 JSON 문자열 추출 및 파싱
      const content = data.choices[0].message.content;
      const parsedContent = JSON.parse(content);

      // 로그 출력
      //console.log('파싱된 응답:', parsedContent);

      // 응답 반환
      return NextResponse.json(parsedContent);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return NextResponse.json({ error: 'API 응답을 파싱할 수 없습니다.' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('API 처리 오류:', error);
    return NextResponse.json(
      { error: `처리 중 오류가 발생했습니다: ${error.message}` },
      { status: 500 }
    );
  }
}
