// app/api/labeling/route.ts
import { NextRequest, NextResponse } from 'next/server';

const TWITTER_PROMPT = `당신은 교과서나 학습자료 수준의 명확한 문서요약 전문가입니다.
1. 원문을 철저히 분석하여 가장 중요한 개념, 논점, 사례를 정확히 파악하세요.
2. 요약은 일타강사가 학생들에게 핵심을 설명하듯 명료하고 간결하게 작성하세요.
3. 독자가 한눈에 파악할 수 있도록 구조화하고 핵심 요점을 강조하세요.

아래의 형식에 따라 정확히 JSON 객체를 생성해주세요:
{
  "title": "원문의 핵심을 명확히 드러내는 간결한 제목",
  "tweet_main": {
    "sections": [
      {
        "heading": "첫 번째 주요 주제/영역 (예: 현황과 문제점, $분야의 특성 등)",
        "points": [
          "• 첫 번째 중요 포인트: 구체적이고 간결한 설명",
          "• 두 번째 중요 포인트: 구체적이고 간결한 설명"
        ]
      },
      {
        "heading": "두 번째 주요 주제/영역 (예: 성공 사례와 요건, 해결 방안 등)",
        "points": [
          "• 첫 번째 중요 포인트: 구체적이고 간결한 설명",
          "• 두 번째 중요 포인트: 구체적이고 간결한 설명"
        ],
        "sub_sections": [
          {
            "sub_heading": "하위 주제 (필요한 경우만)",
            "sub_points": [
              "◦ 세부 사항 1: 간결한 설명",
              "◦ 세부 사항 2: 간결한 설명"
            ]
          }
        ]
      },
      ... (필요한 갯수만큼 주가 , sub_sections는 필요한 경우만 작성)
    ]
  },
  "hashtags": ["핵심키워드1", "핵심키워드2", ... ], // 원문 내용에 따라 1~3개 사이로 필요한 만큼만 작성
  "thread": [
    "1. 가장 중요한 핵심 개념 - 구체적 예시와 함께 서술",
    "2. 두 번째 중요 개념 - 구체적 사례/데이터와 함께 서술",
    ... // 원문의 복잡도와 주요 개념 수에 따라 1~10개 사이로 필요한 만큼만 작성
  ],
  "labeling": {
    "category": "가장 적합한 카테고리 한 가지만 선택",
    "keywords": ["정확한키워드1", "정확한키워드2", ... ], // 원문 내용에 따라 1~10개 사이로 필요한 만큼만 작성
    "key_sentence": "원문의 핵심 메시지를 한 문장으로 압축 (명제형으로 명확하게)"
  }
}

카테고리 선택(하나만): 인문/철학, 경영/경제, 언어, 정치, 사회, 국제, 과학/IT, 수학, 기술/공학, 의학/건강, 예술/문화, 문학/창작

핵심 작성 지침:
1. 교과서처럼 명확하게: 모호함 없이 명확한 문장으로 서술
2. tweet_main은 원문의 내용과 맥락에 맞게 구조화:
   - 내용에 맞는 적절한 대분류 제목 사용 (현황/문제점, 사례/요건, 해결방안, 핵심전략 등)
   - 각 대분류 아래 구체적인 요점을 글머리 기호로 정리
   - 필요시 중분류, 소분류 구조 활용하여 내용의 계층 구조 표현
3. 구체적 사례 강조: 원문에서 언급된 중요 사례나 데이터를 반드시 포함
4. 문장은 완전한 형태로: 불완전한 문장이나 의문형으로 끝나는 문장 사용 금지
5. 논리적 구조화: 중요도 순으로 정보를 제시하며 핵심→세부사항 순으로 구성

추가 요약 테크닉:
- 핵심 문장은 명제형으로 작성
- 불필요한 수식어 제거하고 간결하게 서술
- 교과서나 문제집 설명처럼 직관적이고 명확한 문체 사용
- 내용의 특성에 맞게 분류 체계 구성 (예: 경영 내용은 '현황-문제점-해결책' 구조, 기술 내용은 '원리-응용-전망' 구조)
- 중요 개념과 사례를 효과적으로 연결하여 이해도 높이기

결과는 반드시 유효한 JSON 형식으로만 응답하세요. 답변은 반드시 한글로 작성. 추가 설명이나 텍스트는 포함하지 마세요.`;

const TIMEOUT_DURATION = 25000;

export async function POST(req: NextRequest) {
  // timeoutId 변수를 여기서 선언해서 스코프 문제 해결
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    // 요청에서 텍스트 추출
    const body = await req.json();
    const { text, originalTitle, originalImage } = body;

    // 요청 시작 시간 기록
    const startTime = Date.now();
    console.log('====== OpenAI API 요청 시작 ======');
    console.log(`요청 시간: ${new Date().toISOString()}`);
    console.log(`입력 텍스트 길이: ${text.length} 자`);

    // 입력 텍스트 미리보기 (처음 100자)
    if (text.length > 100) {
      console.log(`입력 텍스트 미리보기: ${text.substring(0, 100)}...`);
    } else {
      console.log(`입력 텍스트: ${text}`);
    }

    if (!text || typeof text !== 'string') {
      console.log('오류: 유효한 텍스트가 제공되지 않음');
      return NextResponse.json({ error: '유효한 텍스트가 필요합니다.' }, { status: 400 });
    }

    // API 키 확인
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      console.log('오류: API 키가 설정되지 않음');
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    // Create an AbortController for timeout handling
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
      console.log('OpenAI API 호출 중...');

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
        signal: controller.signal, // Add abort signal
      });

      // API 호출 완료 시간 계산
      const apiEndTime = Date.now();
      const apiElapsedTime = apiEndTime - startTime;
      console.log(`API 응답 수신 시간: ${apiElapsedTime}ms`);

      // Clear the timeout as the request completed
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('OpenAI API 오류:', errorData);
        return NextResponse.json(
          {
            error: `API 오류: ${errorData.error?.message || '알 수 없는 오류가 발생했습니다.'}`,
            status: response.status,
            originalTitle: originalTitle || '',
            originalImage: originalImage || '',
          },
          { status: response.status }
        );
      }

      // 응답 데이터 처리
      const data = await response.json();

      // 토큰 사용량 로깅
      if (data.usage) {
        console.log('====== OpenAI API 토큰 사용량 ======');
        console.log('사용 모델:', 'gpt-4o-mini');
        console.log('입력 토큰 수:', data.usage.prompt_tokens);
        console.log('출력 토큰 수:', data.usage.completion_tokens);
        console.log('총 토큰 수:', data.usage.total_tokens);

        // 토큰당 가격은 OpenAI의 가격 정책에 따라 변경될 수 있음
        const estimatedCost = (
          data.usage.prompt_tokens * 0.00000015 +
          data.usage.completion_tokens * 0.0000006
        ).toFixed(6);
        console.log('예상 비용(USD):', `$${estimatedCost}`);
        console.log('====================================');
      }

      try {
        // API 응답에서 JSON 문자열 추출 및 파싱
        const content = data.choices[0].message.content;

        // 응답 내용 미리보기 (처음 200자)
        if (content.length > 200) {
          console.log(`응답 내용 미리보기: ${content.substring(0, 200)}...`);
        } else {
          console.log(`응답 내용: ${content}`);
        }

        const parsedContent = JSON.parse(content);

        // 파싱된 JSON 내용 로깅
        console.log('====== 파싱된 응답 정보 ======');
        console.log('제목:', parsedContent.title);
        console.log('해시태그 수:', parsedContent.hashtags?.length || 0);
        console.log('스레드 항목 수:', parsedContent.thread?.length || 0);
        console.log('카테고리:', parsedContent.labeling?.category || '미분류');
        console.log('============================');

        // 총 처리 시간 계산
        const totalEndTime = Date.now();
        const totalElapsedTime = totalEndTime - startTime;
        console.log(`총 처리 시간: ${totalElapsedTime}ms`);
        console.log('====== OpenAI API 처리 완료 ======');

        // 응답 반환
        return NextResponse.json({
          ...parsedContent,
          originalTitle: originalTitle || '',
          originalImage: originalImage || '',
        });
      } catch (error) {
        // parseError를 Error 타입으로 처리하여 타입 오류 해결
        const parseError = error as Error;
        console.error('JSON 파싱 오류:', parseError);
        console.log('====== JSON 파싱 오류 발생 ======');
        console.log('원본 응답:', data.choices[0].message.content);
        console.log('==================================');

        // Return a cleaner error message that will be easier to handle on the client
        return NextResponse.json(
          {
            error: 'JSON 파싱 오류, 다시 시도해주세요.',
            details: parseError.message,
            originalTitle: originalTitle || '', // 오류 응답에도 포함
            originalImage: originalImage || '', // 오류 응답에도 포함
          },
          { status: 422 }
        );
      }
    } catch (error) {
      // Clear the timeout to prevent memory leaks
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // fetchError를 Error 타입으로 처리하여 타입 오류 해결
      const fetchError = error as Error;

      if (fetchError.name === 'AbortError') {
        console.error('API 요청 시간 초과');
        console.log(`시간 초과 발생: ${TIMEOUT_DURATION}ms 초과`);
        return NextResponse.json(
          {
            error: '요청 처리 시간이 초과되었습니다. 다시 시도해주세요.',
            isTimeout: true,
            originalTitle: originalTitle || '', // 추가
            originalImage: originalImage || '', // 추가
          },
          { status: 408 }
        );
      }

      console.error('API 호출 오류:', fetchError);
      return NextResponse.json(
        {
          error: `API 호출 오류: ${fetchError.message}`,
          originalTitle: originalTitle || '', // 추가
          originalImage: originalImage || '', // 추가
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // 외부 try-catch 블록으로 구조화하여 문법 오류 해결
    console.error('API 처리 오류:', error);
    const err = error as Error;
    return NextResponse.json(
      {
        error: `처리 중 오류가 발생했습니다: ${err.message}`,
        originalTitle: '', // 전역 오류에도 포함
        originalImage: '', // 전역 오류에도 포함
      },
      { status: 500 }
    );
  }
}
