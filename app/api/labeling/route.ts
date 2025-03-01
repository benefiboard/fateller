// app/api/labeling/route.ts
import { NextRequest, NextResponse } from 'next/server';

// 트위터 스타일 프롬프트
const TWITTER_PROMPT = `당신은 교과서나 학습자료 수준의 명확한 문서요약 전문가입니다.
1. 원문을 철저히 분석하여 가장 중요한 개념, 논점, 사례를 정확히 파악하세요.
2. 요약은 일타강사가 학생들에게 핵심을 설명하듯 명료하고 간결하게 작성하세요.
3. 독자가 한눈에 파악할 수 있도록 구조화하고 핵심 요점을 강조하세요.

아래의 형식에 따라 정확히 JSON 객체를 생성해주세요:
{
  "title": "원문의 핵심을 명확히 드러내는 간결한 제목",
  "tweet_main": "원문의 핵심 주장과 중요 결론을 직접적으로 서술(추상적 설명이나 '~에 관한 글'이 아닌, 구체적 핵심 내용을 '~은 ~이다. 왜냐하면 ~이기 때문이다' 형식으로 명확하게 서술)",
  "hashtags": ["핵심키워드1", "핵심키워드2", "핵심키워드3"],
  "thread": [
    "1. 가장 중요한 핵심 개념 - 구체적 예시와 함께 서술",
    "2. 두 번째 중요 개념 - 구체적 사례/데이터와 함께 서술",
    "3. 세 번째 중요 개념 - 구체적 근거와 함께 서술"
  ],
  "labeling": {
    "category": "가장 적합한 카테고리 한 가지만 선택",
    "keywords": ["정확한키워드1", "정확한키워드2", "정확한키워드3"],
    "key_sentence": "원문의 핵심 메시지를 한 문장으로 압축 (명제형으로 명확하게)"
  }
}

카테고리는 다음 중 하나만 선택하세요:
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

핵심 작성 지침:
1. 교과서처럼 명확하게: 모호함 없이 명확한 문장으로 서술
2. tweet_main은 반드시 원문의 핵심 주장을 직설적으로 서술:
   - "한국인은 공동체 의식이 강하며, 이는 역사적 경험과 문화적 배경에서 비롯됨" (O)
   - "이 글은 한국인의 특성에 관한 글입니다" (X)
3. 구체적 사례 강조: 원문에서 언급된 중요 사례나 데이터를 반드시 포함
4. 명확한 인과관계: "~때문에", "~결과로", "~의 영향으로" 등 인과관계를 명확히 표현
5. 문장은 완전한 형태로: 불완전한 문장이나 의문형으로 끝나는 문장 사용 금지
6. 논리적 구조화: 중요도 순으로 정보를 제시하며 핵심→세부사항 순으로 구성

추가 요약 테크닉:
- 핵심 문장은 명제형으로 작성 (예: "~은 ~이다", "~는 ~하다")
- 불필요한 수식어 제거하고 간결하게 서술
- 교과서나 문제집 설명처럼 직관적이고 명확한 문체 사용
- 스레드는 의미 단위로 분리하여 한 번에 하나의 개념만 다루기
- 중요 개념과 사례를 효과적으로 연결하여 이해도 높이기

결과는 반드시 유효한 JSON 형식으로만 응답하세요. 답변은 반드시 한글로 작성. 추가 설명이나 텍스트는 포함하지 마세요.`;

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
