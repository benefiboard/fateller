//app/api/labeling/route.ts

import { getContentSummary } from '@/app/utils/summary-manager';
import { createSupabaseServerClient } from '@/lib/supabse/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

type Purpose = '일반' | '업무' | '학습' | '개인';

const TITLE_EMPHASIS = `
[필수 요약 지침]
1. 오리지널 타이틀의 주제와 의도를 요약의 최우선 기준으로 삼으세요.
2. 원문의 구체적 사례를 반드시 포함하세요:
   - 실제 인물, 기업, 제품 이름
   - 구체적 수치와 통계
   - 직접 인용문
   - 비유와 사례
3. 중학생 수준으로 이해할 수 있게 작성하세요:
   - 쉬운 단어와 표현 사용
   - 전문 용어가 필요하면 간단한 설명 추가
   - 짧고 명확한 문장 사용
   - 추상적 개념은 구체적 예시로 설명
`;

const BASIC_PROMPT = `당신은 명확한 문서요약 전문가입니다. 다음 원칙에 따라 JSON 형식으로 요약을 생성하세요:

[핵심 원칙]
1. 원문의 주요 개념, 논점, 사례를 정확히 파악하세요.
2. 구체적 사례와 예시를 반드시 포함하세요.
3. 원문에 없는 내용은 추가하지 마세요.
4. 중학생 수준의 쉬운 언어로 작성하세요.

[출력 형식]
{
  "title": "간결한 제목",
  "tweet_main": {
    "sections": [
      {
        "heading": "주요 주제 1",
        "points": [
          "• 중요 내용 1 (원문에 따라 필요한 만큼 추가)",
          "• ..."
        ],
        "sub_sections": [
          {
            "sub_heading": "하위 주제 (필요한 경우만)",
            "sub_points": [
              "◦ 세부 내용 1 (필요한 만큼 추가)",
              "◦ 세부 내용 2",
              "◦ ..."
            ]
          }
        ]
      },
      {
        "heading": "주요 주제 2",
        "points": [
          "• 중요 내용 1",
          "• ..."
        ]
      },
      ... (주요 주제 섹션을 원문에 따라 필요한 만큼 추가)
    ]
  },
  "hashtags": ["키워드1", "키워드2", "..."],
  "thread": [
    "1. 첫 번째 핵심 내용",
    "2. 두 번째 핵심 내용",
    "... (원문의 복잡도에 따라 필요한 만큼 추가)"
  ],
  "labeling": {
    "category": "카테고리", // 다음 중 하나만 선택: 인문/철학, 역사, 경영/경제, 언어, 정치, 사회, 국제, 과학/IT, 수학, 기술/공학, 의학/건강, 예술/문화, 문학/창작
    "keywords": ["키워드1", "키워드2", "..."],
    "key_sentence": "원문의 핵심을 담은 한 문장"
  }
}

[구조 활용 지침]
- 주요 주제(sections)는 원문의 내용에 따라 필요한 만큼 자유롭게 추가하세요.
- sub_sections은 필요한 경우에만 사용하세요.
- 모든 항목(points, sub_points, thread)의 개수는 원문에 따라 필요한 만큼 자유롭게 추가하세요.
- 단순한 내용은 간단하게, 복잡한 내용은 더 상세하게 구성하세요.

[작성 지침]
1. 교과서처럼 명확하게 작성하세요.
2. 구체적 사례, 데이터, 인용문을 우선적으로 포함하세요.
3. 쉬운 단어를 사용하고 전문 용어는 간단히 설명하세요.
4. 짧고 명확한 문장으로 작성하세요.
5. 중요한 내용을 먼저 제시하세요.

반드시 유효한 JSON 형식으로 한글로만 응답하세요.`;

const WORK_PROMPT = `당신은 업무 문서 요약 전문가입니다. 다음 원칙에 따라 JSON 형식으로 요약을 생성하세요:

[핵심 원칙]
1. 업무 문서(회의록, 보고서, 제안서, 이메일 등)를 분석하세요.
2. 원문의 구조와 목적에 맞게 요약을 구성하세요.
3. 원문에 없는 내용은 추가하지 마세요.
4. 중학생도 이해할 수 있는 쉬운 언어로 작성하세요.

[출력 형식]
{
  "title": "간결한 제목",
  "tweet_main": {
    "sections": [
      {
        "heading": "주요 내용 1",
        "points": [
          "• 중요 내용 1 (원문에 따라 필요한 만큼 추가)",
          "• ..."
        ],
        "sub_sections": [
          {
            "sub_heading": "하위 주제 (필요한 경우만)",
            "sub_points": [
              "◦ 세부 내용 1 (필요한 만큼 추가)",
              "◦ 세부 내용 2",
              "◦ ..."
            ]
          }
        ]
      },
      {
        "heading": "주요 내용 2",
        "points": [
          "• 중요 내용 1",
          "• ..."
        ]
      },
      ... (주요 내용 섹션을 원문에 따라 필요한 만큼 추가)
    ]
  },
  "hashtags": ["키워드1", "키워드2", "..."],
  "thread": [
    "1. 핵심 내용 1",
    "2. 핵심 내용 2",
    "... (원문의 복잡도에 따라 필요한 만큼 추가)"
  ],
  "labeling": {
    "category": "업무",
    "keywords": ["키워드1", "키워드2", "..."],
    "key_sentence": "핵심을 담은 한 문장"
  }
}

[구조 활용 지침]
- 주요 내용(sections)은 원문의 내용에 따라 필요한 만큼 자유롭게 추가하세요.
- sub_sections은 필요한 경우에만 사용하세요.
- 모든 항목(points, sub_points, thread)의 개수는 원문에 따라 필요한 만큼 자유롭게 추가하세요.
- 문서 유형에 맞게 구조를 조정하세요.

[작성 지침]
1. 업무 문서 유형에 따라 중요 요소를 식별하세요:
   - 회의록: 결정사항, 액션 아이템
   - 보고서: 주요 발견, 결론, 제안
   - 제안서: 핵심 제안, 배경, 기대효과
2. 업무 맥락과 시간적 순서를 유지하세요.
3. 전문 용어는 쉽게 풀어서 설명하세요.
4. 명확하고 간결한 문장으로 작성하세요.

반드시 유효한 JSON 형식으로 한글로만 응답하세요.`;

const PERSONAL_PROMPT = `당신은 개인 메모와 기록 정리 전문가입니다. 다음 원칙에 따라 JSON 형식으로 요약을 생성하세요:

[핵심 원칙]
1. 개인 콘텐츠(메모, 일기, 아이디어, 계획 등)를 분석하세요.
2. 원문의 목적과 스타일을 존중하세요.
3. 과도한 해석이나 의미 부여를 피하세요.
4. 쉽고 명확한 언어로 작성하세요.

[출력 형식]
{
  "title": "간결한 제목",
  "tweet_main": {
    "sections": [
      {
        "heading": "주요 내용 1",
        "points": [
          "• 중요 내용 1 (원문에 따라 필요한 만큼 추가)",
          "• ..."
        ],
        "sub_sections": [
          {
            "sub_heading": "하위 주제 (필요한 경우만)",
            "sub_points": [
              "◦ 세부 내용 1 (필요한 만큼 추가)",
              "◦ 세부 내용 2",
              "◦ ..."
            ]
          }
        ]
      },
      {
        "heading": "주요 내용 2",
        "points": [
          "• 중요 내용 1",
          "• ..."
        ]
      },
      ... (주요 내용 섹션을 원문에 따라 필요한 만큼 추가)
    ]
  },
  "hashtags": ["키워드1", "키워드2", "..."],
  "thread": [
    "1. 핵심 내용 1",
    "2. 핵심 내용 2",
    "... (원문의 복잡도에 따라 필요한 만큼 추가)"
  ],
  "labeling": {
    "category": "개인",
    "keywords": ["키워드1", "키워드2", "..."],
    "key_sentence": "핵심을 담은 한 문장"
  }
}

[구조 활용 지침]
- 원문이 짧거나 단순하면 최소한의 구조만 사용하세요.
- 주요 내용(sections)은 원문에 따라 필요한 만큼 자유롭게 추가하세요.
- 모든 항목(points, sub_points, thread)의 개수는 원문에 따라 필요한 만큼 자유롭게 추가하세요.
- 필요한 경우에만 sub_sections을 사용하세요.

[작성 지침]
1. 원문의 개인적 표현 방식(구어체, 이모티콘, 약어 등)을 유지하세요.
2. 콘텐츠 유형에 맞게 중요 요소를 식별하세요:
   - 계획/할일: 시간, 중요도
   - 생각/아이디어: 핵심 개념, 연결성
   - 일기/감정: 주요 감정, 경험
3. 쉬운 단어와 표현을 사용하세요.
4. 과도한 구조화를 피하고 원문의 자연스러운 흐름을 존중하세요.

반드시 유효한 JSON 형식으로 한글로만 응답하세요.`;

const STUDY_PROMPT = `당신은 학습 자료 요약 전문가입니다. 다음 원칙에 따라 JSON 형식으로 요약을 생성하세요:

[핵심 원칙]
1. 학습 자료(강의노트, 교재, 논문 등)를 분석하세요.
2. 학습에 필요한 충분한 세부사항과 예시를 유지하세요.
3. 원문에 없는 내용은 추가하지 마세요.
4. 중학생도 이해할 수 있는 쉬운 언어로 작성하세요.

[출력 형식]
{
  "title": "간결한 제목",
  "tweet_main": {
    "sections": [
      {
        "heading": "주요 학습 주제 1",
        "points": [
          "• 주요 내용 1 + 구체적 예시 (원문에 따라 필요한 만큼 추가)",
          "• ..."
        ],
        "sub_sections": [
          {
            "sub_heading": "하위 주제 (필요한 경우만)",
            "sub_points": [
              "◦ 세부 내용 1 (필요한 만큼 추가)",
              "◦ 세부 내용 2",
              "◦ ..."
            ]
          }
        ]
      },
      {
        "heading": "주요 학습 주제 2",
        "points": [
          "• 주요 내용 1 + 구체적 예시",
          "• ..."
        ]
      },
      ... (주요 학습 주제 섹션을 원문에 따라 필요한 만큼 추가)
    ]
  },
  "hashtags": ["키워드1", "키워드2", "..."],
  "thread": [
    "1. 핵심 학습 내용 1 + 상세 설명",
    "2. 핵심 학습 내용 2 + 상세 설명",
    "... (원문의 복잡도에 따라 필요한 만큼 추가)"
  ],
  "labeling": {
    "category": "학습",
    "keywords": ["키워드1", "키워드2", "..."],
    "key_sentence": "핵심을 담은 한 문장"
  }
}

[구조 활용 지침]
- 주요 학습 주제(sections)는 원문에 따라 필요한 만큼 자유롭게 추가하세요.
- 모든 항목(points, sub_points, thread)의 개수는 원문에 따라 필요한 만큼 자유롭게 추가하세요.
- 원문의 구조에 맞게 sections과 sub_sections을 활용하세요.
- 원문에서 강조된 구조는 요약에도 반영하세요.

[작성 지침]
1. 중요한 세부사항, 수치, 예시를 모두 포함하세요.
2. 원문에서 강조된 내용은 명확히 표현하세요.
3. 복잡한 개념은 쉽게 풀어서 설명하세요:
   - 전문 용어는 일상적인 표현으로 바꾸거나 간단히 설명 추가
   - 추상적 개념은 구체적 예시로 설명
   - 짧고 명확한 문장 사용
4. 원문의 모든 중요 영역을 균형있게 다루세요.

반드시 유효한 JSON 형식으로 한글로만 응답하세요.`;

const PROMPTS: Record<Purpose, string> = {
  일반: BASIC_PROMPT,
  업무: WORK_PROMPT,
  학습: STUDY_PROMPT,
  개인: PERSONAL_PROMPT,
};

const TIMEOUT_DURATION = 25000;

// Google Generative AI API 인스턴스 설정
const setupGeminiAPI = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(req: NextRequest) {
  // timeoutId 변수를 여기서 선언해서 스코프 문제 해결
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    // 요청에서 텍스트 추출
    const body = await req.json();
    const { text, originalTitle, originalImage, purpose = '일반', sourceId = null } = body;

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('사용자 정보 조회 오류:', userError);
      return NextResponse.json({ error: '사용자 정보를 확인할 수 없습니다' }, { status: 401 });
    }

    const userId = user.id;

    // 텍스트 길이에 따른 필요 크레딧 계산
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    const byteLength = bytes.length;

    // 30,000 바이트마다 1 크레딧 소모 (영문 약 30,000자, 한글 약 10,000자에 해당)
    const requiredCredits = Math.max(1, Math.ceil(byteLength / 12000));

    // 로그에 바이트 정보 추가
    console.log(`입력 텍스트 길이: ${text.length} 자 (${byteLength} 바이트)`);

    // 사용자 크레딧 정보 조회 및 필요시 리셋 (함수 호출)
    await supabase.rpc('maybe_reset_credits', { uid: userId });

    // 최신 크레딧 정보 가져오기
    const { data: creditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('credits_remaining, last_reset_date')
      .eq('user_id', userId)
      .single();

    if (creditsError) {
      console.error('크레딧 확인 오류:', creditsError);
      return NextResponse.json(
        {
          error: '크레딧 정보를 확인할 수 없습니다.',
          originalTitle: originalTitle || '',
          originalImage: originalImage || '',
        },
        { status: 500 }
      );
    }

    // 크레딧 부족 확인 (특별 처리 추가)
    if (creditsData.credits_remaining <= 0) {
      return NextResponse.json(
        {
          error: '크레딧이 없습니다',
          required: requiredCredits,
          remaining: creditsData.credits_remaining,
          originalTitle: originalTitle || '',
          originalImage: originalImage || '',
        },
        { status: 402 }
      ); // 402 Payment Required
    }

    // 특별 케이스: 크레딧이 1개 남았을 때는 필요 크레딧과 상관없이 진행
    let actualRequiredCredits = requiredCredits;

    if (creditsData.credits_remaining === 1 && requiredCredits > 1) {
      console.log('크레딧이 1개만 남았지만 특별 처리로 진행합니다.');
      actualRequiredCredits = 1; // 1개만 차감
    } else if (creditsData.credits_remaining < requiredCredits) {
      return NextResponse.json(
        {
          error: '크레딧이 부족합니다',
          required: requiredCredits,
          remaining: creditsData.credits_remaining,
          originalTitle: originalTitle || '',
          originalImage: originalImage || '',
        },
        { status: 402 }
      ); // 402 Payment Required
    }

    const validPurpose = (Object.keys(PROMPTS).includes(purpose) ? purpose : '일반') as Purpose;
    let selectedPrompt = PROMPTS[validPurpose];

    // 기존 캐시된 요약이 있는지 확인 (있으면 크레딧 무조건 1만 차감 반환)
    if (sourceId) {
      try {
        // 기존 요약 조회
        const summaryResult = await getContentSummary(sourceId, purpose);

        // 2. 기존 요약이 있으면 1개의 크레딧을 차감하고 반환
        if (summaryResult.existingSummary) {
          const cachedSummary = summaryResult.summary;
          console.log(`캐싱된 요약 사용: sourceId=${sourceId}, purpose=${purpose}`);

          // 여기에 크레딧 차감 로직 추가 (항상 1개만 차감)
          const newCreditsRemaining = creditsData.credits_remaining - 1;
          const { data: updateData, error: updateError } = await supabase
            .from('user_credits')
            .update({ credits_remaining: newCreditsRemaining })
            .eq('user_id', userId)
            .select('credits_remaining')
            .single();

          if (updateError) {
            console.error('캐시 사용 시 크레딧 차감 오류:', updateError);
            return NextResponse.json(
              {
                error: '크레딧 차감에 실패했습니다.',
                originalTitle: originalTitle || '',
                originalImage: originalImage || '',
              },
              { status: 500 }
            );
          }

          console.log(
            `캐시 데이터 사용으로 크레딧 1개 차감, 남은 크레딧: ${updateData.credits_remaining}`
          );

          return NextResponse.json({
            title: cachedSummary.title,
            tweet_main: cachedSummary.tweet_main,
            hashtags: cachedSummary.hashtags,
            thread: cachedSummary.thread,
            labeling: {
              category: cachedSummary.category,
              keywords: cachedSummary.keywords,
              key_sentence: cachedSummary.key_sentence,
            },
            originalTitle: originalTitle || '',
            originalImage: originalImage || '',
            // 추가 정보
            sourceId: sourceId,
            embeddingId: cachedSummary.embedding_id,
            // 크레딧 정보 업데이트 - 1개 사용했음을 반영
            credits: {
              remaining: updateData.credits_remaining,
              used: 1, // 캐시 사용 시에도 1 크레딧 사용
            },
          });
        }
      } catch (cacheError) {
        console.error('캐싱된 요약 조회 오류:', cacheError);
        // 오류 발생 시 계속 진행 (Gemini로 새로 생성)
      }
    }

    // 크레딧 차감 (먼저 현재 값 가져온 후 계산하여 업데이트)
    const newCreditsRemaining = creditsData.credits_remaining - actualRequiredCredits;
    const { data: updateData, error: updateError } = await supabase
      .from('user_credits')
      .update({ credits_remaining: newCreditsRemaining })
      .eq('user_id', userId)
      .select('credits_remaining')
      .single();

    if (updateError) {
      console.error('크레딧 차감 오류:', updateError);
      return NextResponse.json(
        {
          error: '크레딧 차감에 실패했습니다.',
          originalTitle: originalTitle || '',
          originalImage: originalImage || '',
        },
        { status: 500 }
      );
    }

    console.log(
      `크레딧 차감 완료: ${actualRequiredCredits}개 차감, 남은 크레딧: ${updateData.credits_remaining}`
    );

    // 강조 지시사항 추가
    selectedPrompt = selectedPrompt + TITLE_EMPHASIS;

    // 요청 시작 시간 기록
    const startTime = Date.now();
    console.log('====== Gemini API 요청 시작 ======');
    console.log(`요청 시간: ${new Date().toISOString()}`);
    console.log(`입력 텍스트 길이: ${text.length} 자`);
    console.log(`필요 크레딧: ${actualRequiredCredits} 개 (원래 필요: ${requiredCredits}개)`);
    console.log(`오리지널제목: ${originalTitle}`);
    console.log(`요청 의도: ${validPurpose}`);

    // 입력 텍스트 미리보기 (처음 100자)
    if (text.length > 100) {
      console.log(`입력 텍스트 미리보기: ${text.substring(0, 100)}...`);
    } else {
      console.log(`입력 텍스트: ${text}`);
    }

    if (!text || typeof text !== 'string') {
      console.log('오류: 유효한 텍스트가 제공되지 않음');

      // 크레딧 환불 (오류 발생 시)
      const refundedCredits = updateData.credits_remaining + actualRequiredCredits;
      await supabase
        .from('user_credits')
        .update({ credits_remaining: refundedCredits })
        .eq('user_id', userId);

      console.log(`입력 오류로 크레딧 환불: ${actualRequiredCredits}개`);

      return NextResponse.json(
        {
          error: '유효한 텍스트가 필요합니다.',
          credits: {
            remaining: refundedCredits,
            used: 0,
          },
        },
        { status: 400 }
      );
    }

    // Create an AbortController for timeout handling
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
      console.log('Gemini API 호출 중...');

      // Gemini API 설정
      const genAI = setupGeminiAPI();
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-lite',
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.95,
          topK: 64,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      });

      // Gemini API 호출
      const userContent = originalTitle
        ? `오리지널 타이틀: "${originalTitle}" 
           다음 텍스트를 분석하고 JSON 형식으로 응답해주세요: ${text}`
        : `다음 텍스트를 분석하고 JSON 형식으로 응답해주세요: ${text}`;

      const result = await model.generateContent([selectedPrompt, userContent]);

      // Clear the timeout as the request completed
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const response = result.response;
      const responseText = response.text();

      // API 호출 완료 시간 계산
      const apiEndTime = Date.now();
      const apiElapsedTime = apiEndTime - startTime;
      console.log(`API 응답 수신 시간: ${apiElapsedTime}ms`);

      try {
        // 응답 내용 미리보기 (처음 200자)
        if (responseText.length > 200) {
          console.log(`응답 내용 미리보기: ${responseText.substring(0, 200)}...`);
        } else {
          console.log(`응답 내용: ${responseText}`);
        }

        // JSON 파싱
        const parsedContent = JSON.parse(responseText);

        if (sourceId) {
          try {
            // 요약 결과 저장
            await supabase.from('content_summaries').insert({
              source_id: sourceId,
              purpose: purpose,
              title: parsedContent.title,
              tweet_main: parsedContent.tweet_main,
              hashtags: parsedContent.hashtags || [],
              thread: parsedContent.thread || [],
              category: parsedContent.labeling?.category || '미분류',
              keywords: parsedContent.labeling?.keywords || [],
              key_sentence: parsedContent.labeling?.key_sentence || '',
              created_at: new Date().toISOString(),
            });

            console.log(`요약 결과 저장 완료: sourceId=${sourceId}, purpose=${purpose}`);
          } catch (saveError) {
            // 저장 실패해도 결과는 반환 (로그만 기록)
            console.error('요약 결과 저장 실패:', saveError);
          }
        }

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
        console.log('====== Gemini API 처리 완료 ======');

        // 응답 반환 (크레딧 정보 포함)
        return NextResponse.json({
          ...parsedContent,
          originalTitle: originalTitle || '',
          originalImage: originalImage || '',
          sourceId: sourceId,
          // 크레딧 정보 추가
          credits: {
            remaining: updateData.credits_remaining,
            used: actualRequiredCredits,
          },
        });
      } catch (error) {
        // parseError를 Error 타입으로 처리하여 타입 오류 해결
        const parseError = error as Error;
        console.error('JSON 파싱 오류:', parseError);
        console.log('====== JSON 파싱 오류 발생 ======');
        console.log('원본 응답:', responseText);
        console.log('==================================');

        // 파싱 실패 시 크레딧 환불
        const refundedCredits = updateData.credits_remaining + actualRequiredCredits;
        await supabase
          .from('user_credits')
          .update({ credits_remaining: refundedCredits })
          .eq('user_id', userId);

        console.log(`파싱 오류로 인한 크레딧 환불: ${actualRequiredCredits}개`);

        // Return a cleaner error message that will be easier to handle on the client
        return NextResponse.json(
          {
            error: 'JSON 파싱 오류, 다시 시도해주세요.',
            details: parseError.message,
            originalTitle: originalTitle || '', // 오류 응답에도 포함
            originalImage: originalImage || '', // 오류 응답에도 포함
            credits: {
              remaining: refundedCredits,
              used: 0,
            },
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

      // 오류 시 크레딧 환불
      const refundedCredits = updateData.credits_remaining + actualRequiredCredits;
      await supabase
        .from('user_credits')
        .update({ credits_remaining: refundedCredits })
        .eq('user_id', userId);

      console.log(`API 호출 오류로 인한 크레딧 환불: ${actualRequiredCredits}개`);

      if (fetchError.name === 'AbortError') {
        console.error('API 요청 시간 초과');
        console.log(`시간 초과 발생: ${TIMEOUT_DURATION}ms 초과`);
        return NextResponse.json(
          {
            error: '요청 처리 시간이 초과되었습니다. 다시 시도해주세요.',
            isTimeout: true,
            originalTitle: originalTitle || '', // 추가
            originalImage: originalImage || '', // 추가
            credits: {
              remaining: refundedCredits,
              used: 0,
            },
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
          credits: {
            remaining: refundedCredits,
            used: 0,
          },
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
