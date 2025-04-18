// app/api/labeling-gemini/route.ts
import { getContentSummary } from '@/app/utils/summary-manager';
import { createSupabaseServerClient } from '@/lib/supabse/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

type Purpose = '일반' | '업무' | '학습' | '개인';

const TITLE_EMPHASIS = `
중요: 제공된 '오리지널 타이틀'은 요약의 핵심 지침으로 반드시 최우선적으로 고려해야 합니다.
1. 원문 분석 시 오리지널 타이틀이 질문하거나 강조하는 내용에 최우선적으로 초점을 맞추세요.
2. 타이틀에 언급된 핵심 주제, 질문 또는 관점이 반드시 요약의 주요 부분에 포함되어야 합니다.
3. key_sentence는 반드시 오리지널 타이틀이 제시하는 주제나 질문에 직접 답변해야 합니다.
4. 원문에 명시적으로 존재하지 않는 내용은 절대 추가하지 마세요.
5. 결과 JSON의 모든 구성요소(title, tweet_main, thread 등)가 오리지널 타이틀의 의도와 일관성을 유지하는지 확인하세요.
`;

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
    "key_sentence": "원문의 3-5개 핵심 개념을 포함하고, 이들 사이의 관계를 명시하며, 구체적인 정보를 담은 한 문장으로 압축 (일반적 진술이 아닌 원문 특유의 정보가 드러나야 함)"
  }
}

!!!중요!!! 카테고리는 다음 목록에서 반드시 정확히 하나만 선택해야 합니다: 인문/철학, 역사, 경영/경제, 언어, 정치, 사회, 국제, 과학/IT, 수학, 기술/공학, 의학/건강, 예술/문화, 문학/창작 (위 목록에 없는 카테고리는 절대 사용하지 마세요. 항상 슬래시(/)가 포함된 형태를 그대로 사용하세요.)

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

const WORK_PROMPT = `당신은 비즈니스 문서 전문 요약가입니다.
1. 업무 문서를 체계적으로 분석하여 핵심 내용, 의사결정 사항, 액션 아이템 등을 명확하게 파악하세요.
2. 요약은 간결하고 전문적인 비즈니스 어조로 작성하여 바쁜 의사결정자가 빠르게 핵심을 파악할 수 있게 하세요.
3. 실행 가능한 정보와 비즈니스 인사이트에 중점을 두고 구조화하세요.
4. 원문에 없는 내용은 절대 추가하지 마세요. 없는 내용을 만들어내는 것은 심각한 오류입니다.

아래의 형식에 따라 정확히 JSON 객체를 생성해주세요:
{
  "title": "업무 문서의 핵심을 명확히 드러내는 간결한 제목",
  "tweet_main": {
    "sections": [
      // 원문의 주요 섹션이나 주제에 맞게 적절한 수의 섹션 포함
      // 원문에 없는 내용의 섹션은 포함하지 마세요
      {
        "heading": "제목은 원문의 주제에 맞게 자유롭게 설정",
        "points": [
          "• 첫 번째 요점 - 원문에 있는 내용만",
          "• 두 번째 요점 - 원문에 있는 내용만",
          "• 세 번째 요점 - 원문에 있는 내용만",
          // 원문에 있는 관련 내용 모두 포함 (갯수 제한 없음)
          "• 원문의 내용에 따라 필요한 만큼 추가 가능"
        ],
        "sub_sections": [
          // sub_sections는 필요한 경우에만 포함
          {
            "sub_heading": "하위 제목은 원문 내용에 맞게 설정",
            "sub_points": [
              "◦ 첫 번째 하위 요점 - 원문에 있는 내용만",
              "◦ 두 번째 하위 요점 - 원문에 있는 내용만",
              // 원문에 있는 관련 내용 모두 포함 (갯수 제한 없음)
              "◦ 원문의 내용에 따라 필요한 만큼 추가 가능"
            ]
          },
          // 원문에 맞게 필요한 만큼의 하위 섹션 추가 가능 (갯수 제한 없음)
          {
            "sub_heading": "또 다른 하위 제목 예시",
            "sub_points": [
              "◦ 하위 요점 - 원문에 있는 내용만",
              "◦ 하위 요점 - 원문에 있는 내용만",
              // 필요한 만큼 추가
            ]
          }
        ]
      },
      // 필요한 만큼 섹션 추가 (갯수 제한 없음)
      {
        "heading": "다른 섹션 제목 예시",
        "points": [
          "• 요점 - 원문에 있는 내용만",
          "• 요점 - 원문에 있는 내용만",
          // 필요한 만큼 추가
        ],
        "sub_sections": []
      }
    ]
  },
  "hashtags": [
    "첫번째키워드", 
    "두번째키워드", 
    "세번째키워드",
    // 원문 내용에 따라 필요한 만큼 추가 (갯수 제한 없음)
  ],
  "thread": [
    "1. 첫 번째 주요 내용 - 원문에 있는 내용만",
    "2. 두 번째 주요 내용 - 원문에 있는 내용만",
    "3. 세 번째 주요 내용 - 원문에 있는 내용만",
    // 원문 내용에 따라 필요한 만큼 추가 (갯수 제한 없음)
  ],
  "labeling": {
    "category": "업무",
    "keywords": [
      "첫번째키워드", 
      "두번째키워드", 
      "세번째키워드",
      // 원문 내용에 따라 필요한 만큼 추가 (갯수 제한 없음)
    ],
    "key_sentence": "원문의 3-5개 핵심 개념을 포함하고, 이들 사이의 관계를 명시하며, 구체적인 정보를 담은 한 문장으로 압축 (일반적 진술이 아닌 원문 특유의 정보가 드러나야 함)"
  }
}

핵심 작성 지침:
1. 원문에 있는 내용만 포함:
   - 원문에 명시적으로 존재하지 않는 내용은 절대 추가하지 마세요
   - 특히 인물 이름, 날짜, 팀 구성, 수치 등은 원문에 있는 그대로만 포함하세요
   - 불확실하거나 모호한 내용은 포함하지 않는 것이 좋습니다

2. 항목 수 제한 없음:
   - 각 섹션의 points, sub_sections, sub_points는 원문 내용에 따라 필요한 만큼 포함하세요
   - 원문에 관련 내용이 많으면 많은 항목을, 적으면 적은 항목을 포함하세요
   - 숫자나 개수에 제한 없이 원문의 중요 내용을 모두 적절히 반영하세요

3. 섹션 구성 자유:
   - 섹션 제목과 구성은 원문 내용과 구조에 맞게 자유롭게 조정하세요
   - 원문에 맞지 않는 섹션은 포함하지 말고, 원문 구조에 맞는 새로운 섹션 추가 가능
   - 섹션 수에 제한은 없으며, 원문 구조를 가장 잘 반영하는 방식으로 구성하세요

4. 상세함과 정확성 유지:
   - 원문의 중요 정보는 누락 없이 포함하세요
   - 원문의 수치, 날짜, 이름 등은 정확하게 그대로 사용하세요
   - 원문의 구체적 내용을 일반화하거나 왜곡하지 마세요

특별 지침 - GPT 스타일 요약:
1. 강한 압축성 - 내용을 매우 간결하게 요약하세요:
   - 원문의 핵심 사항만 남기고 부수적인 설명은 과감히 생략하세요
   - 발언자 정보("김부장님:", "박차장님:" 등)는 가능한 생략하세요
   - 개인 메모나 비공식적 내용은 대부분 제외하세요

2. 계층적 구조화 - 정보를 명확한 위계로 정리하세요:
   - 주요 섹션과 하위 섹션을 명확히 구분하세요
   - 상위 레벨에는 가장 중요한 정보만 포함하세요
   - 세부 정보는 하위 섹션에 배치하세요

3. 핵심 결정사항과 액션 아이템 강조:
   - 결정사항과 TO-DO는 반드시 sub_sections에 포함시키세요
   - 일반적인 논의보다 결과적 내용에 초점을 맞추세요

4. 주관적 표현 최소화:
   - "~것 같습니다" 같은 불확실한 표현 대신 단언적 표현을 사용하세요
   - 인용문은 핵심적인 것만 유지하고 나머지는 생략하세요

결과는 반드시 유효한 JSON 형식으로만 응답하세요. 답변은 반드시 한글로 작성. 추가 설명이나 텍스트는 포함하지 마세요.`;

const PERSONAL_PROMPT = `당신은 개인 메모와 일상 기록 정리 전문가입니다.
1. 일기, To-Do 목록, 개인 계획, 생각 등 다양한 유형의 개인 콘텐츠를 존중하세요.
2. 개인 기록의 실용적 목적(계획 추적, 할 일 관리, 감정 표현 등)을 유지하세요.
3. 원문에 실제로 존재하는 내용만 포함하고, 과도한 해석이나 의미 추가를 피하세요.
4. 오리지널 타이틀이 있는 경우, 이를 최우선적으로 존중하세요.

아래의 형식에 따라 정확히 JSON 객체를 생성해주세요:
{
  "title": "원문의 핵심을 담은 간결한 제목 (원제목 있으면 유지)",
  "tweet_main": {
    "sections": [
      // 아래 섹션들은 원문 내용 유형에 따라 적절히 선택하세요
      {
        "heading": "계획 및 할 일", // 계획/To-Do 관련 내용이 있는 경우
        "points": [
          "• 해야 할 일: 원문에 언급된 특정 할 일 항목들",
          "• 일정 관리: 원문에 언급된 약속, 날짜, 시간 등"
        ]
      },
      {
        "heading": "생각과 아이디어", // 아이디어/생각이 있는 경우
        "points": [
          "• 주요 생각: 원문에 표현된 핵심 아이디어나 고려사항",
          "• 영감: 원문에 언급된 영감이나 새로운 아이디어"
        ]
      },
      {
        "heading": "감정과 경험", // 감정/경험 표현이 있는 경우
        "points": [
          "• 감정 상태: 원문에 명시적으로 표현된 감정들",
          "• 경험: 원문에 기록된 특별한 경험이나 활동"
        ]
      },
      {
        "heading": "구매 목록", // 구매 관련 내용이 있는 경우
        "points": [
          "• 필요한 항목: 원문에 언급된 구매할 품목들",
          "• 구매 메모: 원문에 언급된 구매 관련 특이사항"
        ]
      },
      {
        "heading": "생활 관리", // 건강/습관/생활 관련 내용이 있는 경우
        "points": [
          "• 건강 관리: 원문에 언급된 운동, 식단, 건강 관련 메모",
          "• 습관 기록: 원문에 언급된 습관 형성/관리 사항"
        ]
      }
      // 원문에 맞지 않는 섹션은 포함하지 마세요
    ]
  },
  "hashtags": ["관련키워드1", "관련키워드2"], // 원문 내용에서 추출한 핵심 키워드
  "thread": [
    "1. 핵심 요약 - 원문의 가장 중요한 내용",
    "2. 중요 사항 - 특히 강조된 내용 (있는 경우에만)"
    // 원문이 짧으면 1개 항목으로도 충분
  ],
  "labeling": {
    "category": "개인",
    "keywords": ["관련키워드1", "관련키워드2"], // 원문 내용과 직접 관련된 키워드만
    "key_sentence": "원문의 3-5개 핵심 개념을 포함하고, 이들 사이의 관계를 명시하며, 구체적인 정보를 담은 한 문장으로 압축 (일반적 진술이 아닌 원문 특유의 정보가 드러나야 함)"
  }
}


핵심 작성 지침:
1. 개인 메모 특성 존중:
   - 원문의 구어체, 이모티콘, 줄임말, 강조 표현 등을 그대로 유지
   - 개인적인 약어나 특수 표현도 원문 그대로 유지
   - 불완전한 문장이나 메모 형식 텍스트도 그대로 반영

2. 실용성 중심 접근:
   - 계획, 할 일, 구매 목록 등 실행 가능한 항목은 명확하게 구분
   - 날짜, 시간, 장소 등 중요 정보는 눈에 띄게 처리
   - 원문에서 강조된 우선순위 표현 ("꼭!", "중요", "!!!" 등) 유지

3. 간결성 유지:
   - 원문이 짧은 경우 tweet_main은 1-2개 섹션으로 제한
   - 각 섹션의 points는 원문 내용을 간결하게 요약
   - thread는 원문이 매우 짧은 경우 1개 항목으로도 충분

4. 개인 일상 관련 섹션 유연성:
   - 원문 내용에 가장 적합한 섹션 제목 선택 (위 예시에 국한되지 않음)
   - 필요시 섹션 제목을 원문에 맞게 적절히 변경
   - 관련 내용이 없는 섹션은 완전히 생략

5. 할루시네이션 방지:
   - 원문에 없는 내용 추가 금지
   - 과도한 심리 분석이나 패턴 추론 금지
   - 원문에 명시되지 않은 감정이나 의도 추론 금지

6. 매우 짧은 메모 처리:
   - 원문이 한두 문장인 경우, 과도한 분석 없이 핵심만 간결히 요약
   - 짧은 메모는 1개 섹션, 1-2개 points로 구성
   - 필요한 경우 thread도 1개 항목으로 제한

결과는 반드시 유효한 JSON 형식으로만 응답하세요. 답변은 반드시 한글로 작성. 추가 설명이나 텍스트는 포함하지 마세요.`;

const STUDY_PROMPT = `당신은 학습 학습 최적화 전문가입니다.
1. 강의, 수업, 학습 자료의 내용을 분석하여 핵심 개념, 이론, 원리를 정확히 파악하세요.
2. 요약은 시험 준비에 최적화된 형태로 구조화하고, 원문의 강조점(★, 중요도 표시)을 유지하세요.
3. 교수/강사가 언급한 시험 관련 정보, 중요도 표시, 다음 수업 준비사항 등을 반드시 포함하세요.
4. 오리지널 타이틀이 있는 경우, 이를 요약의 중심 기준으로 삼으세요.
5. 원문에 없는 내용은 절대 추가하지 마세요. 없는 내용을 만들어내는 것은 심각한 오류입니다.

아래의 형식에 따라 정확히 JSON 객체를 생성해주세요:
{
  "title": "원문 주제와 과목명을 반영한 제목",
  "tweet_main": {
    "sections": [
      // 원문의 주요 섹션이나 주제에 맞게 적절한 수의 섹션 포함
      // 원문에 없는 내용의 섹션은 포함하지 마세요
      {
        "heading": "제목은 원문의 주제에 맞게 자유롭게 설정",
        "points": [
          "• 첫 번째 요점 - 원문에 있는 내용만, 중요도 표시(★) 유지",
          "• 두 번째 요점 - 원문에 있는 내용만",
          "• 세 번째 요점 - 원문에 있는 내용만",
          // 원문에 있는 관련 내용 모두 포함 (갯수 제한 없음)
          "• 원문의 내용에 따라 필요한 만큼 추가 가능"
        ],
        "sub_sections": [
          // sub_sections는 필요한 경우에만 포함
          {
            "sub_heading": "하위 제목은 원문 내용에 맞게 설정",
            "sub_points": [
              "◦ 첫 번째 하위 요점 - 원문에 있는 내용만",
              "◦ 두 번째 하위 요점 - 원문에 있는 내용만",
              // 원문에 있는 관련 내용 모두 포함 (갯수 제한 없음)
              "◦ 원문의 내용에 따라 필요한 만큼 추가 가능"
            ]
          },
          // 원문에 맞게 필요한 만큼의 하위 섹션 추가 가능 (갯수 제한 없음)
          {
            "sub_heading": "또 다른 하위 제목 예시",
            "sub_points": [
              "◦ 하위 요점 - 원문에 있는 내용만",
              "◦ 하위 요점 - 원문에 있는 내용만",
              // 필요한 만큼 추가
            ]
          }
        ]
      },
      // 예시로 학습 학습에 자주 있는 섹션들 (원문에 맞게 자유롭게 수정/생략 가능)
      {
        "heading": "시험 대비 정보",
        "points": [
          "• '시험에 나온다'고 언급된 내용 - 원문 그대로 포함",
          "• '시험에 안 나온다'고 언급된 내용 - 원문 그대로 포함",
          "• 시험 범위 - 원문에 명시된 경우만 포함",
          // 필요한 만큼 추가
        ],
        "sub_sections": []
      },
      {
        "heading": "다음 수업 준비사항",
        "points": [
          "• 과제 - 원문에 언급된 경우만 포함",
          "• 읽기 자료 - 원문에 언급된 경우만 포함",
          // 필요한 만큼 추가
        ],
        "sub_sections": []
      },
      // 필요한 만큼 섹션 추가 (갯수 제한 없음)
      {
        "heading": "다른 섹션 제목 예시",
        "points": [
          "• 요점 - 원문에 있는 내용만",
          "• 요점 - 원문에 있는 내용만",
          // 필요한 만큼 추가
        ],
        "sub_sections": []
      }
    ]
  },
  "hashtags": [
    "과목명", 
    "주요개념1", 
    "주요개념2",
    // 원문 내용에 따라 필요한 만큼 추가 (갯수 제한 없음)
  ],
  "thread": [
    "1. 핵심 주제 요약 - 원문에 있는 내용만",
    "2. 주요 학습 포인트 - 원문에 있는 내용만",
    "3. 응용 및 활용 - 원문에 있는 내용만(있는 경우)",
    // 원문 내용에 따라 필요한 만큼 추가 (갯수 제한 없음)
  ],
  "labeling": {
    "category": "학습",
    "keywords": [
      "키워드1", 
      "키워드2", 
      "키워드3",
      // 원문 내용에 따라 필요한 만큼 추가 (갯수 제한 없음)
    ],
    "key_sentence": "원문의 3-5개 핵심 개념을 포함하고, 이들 사이의 관계를 명시하며, 구체적인 정보를 담은 한 문장으로 압축 (일반적 진술이 아닌 원문 특유의 정보가 드러나야 함)"
  }
}

핵심 작성 지침:
1. 원문에 있는 내용만 포함:
   - 원문에 명시적으로 존재하지 않는 내용은 절대 추가하지 마세요
   - 교수/강사가 말한 내용도 원문에 있는 그대로만 포함하세요
   - 불확실하거나 모호한 내용은 포함하지 않는 것이 좋습니다

2. 항목 수 제한 없음:
   - 각 섹션의 points, sub_sections, sub_points는 원문 내용에 따라 필요한 만큼 포함하세요
   - 원문에 관련 내용이 많으면 많은 항목을, 적으면 적은 항목을 포함하세요
   - 숫자나 개수에 제한 없이 원문의 중요 내용을 모두 적절히 반영하세요

3. 섹션 구성 자유:
   - 섹션 제목과 구성은 원문 내용과 구조에 맞게 자유롭게 조정하세요
   - 원문에 맞지 않는 섹션은 포함하지 말고, 원문 구조에 맞는 새로운 섹션 추가 가능
   - 섹션 수에 제한은 없으며, 원문 구조를 가장 잘 반영하는 방식으로 구성하세요

4. 학습 자료 특성 유지:
   - 강의/수업 메타데이터(날짜, 교수명, 과목명 등) 보존
   - 원문의 구조와 체계(장-절 구조, 번호 체계 등) 유지
   - 원문의 강조점(★, ⭐ 등) 및 '중요하다'는 언급 유지
   - 학생의 의문점이나 이해 어려움 표시("??", "이해 안됨" 등) 보존

5. 시험 정보 우선화:
   - '시험에 나온다', '예상문제', '자주 출제된다' 등의 언급은 반드시 포함
   - 교수가 특별히 강조한 내용은 중요도 표시(★)와 함께 포함
   - "시험에 나오지 않는다"는 정보도 명시적으로 포함

6. 학습 계획 정보 보존:
   - 다음 수업 준비사항, 과제, 읽기 자료 등이 원문에 있으면 반드시 포함
   - 원문에 언급된 시험 일정, 범위 등도 정확히 포함

7. 오리지널 타이틀 존중:
   - 오리지널 타이틀이 있다면 반드시 그 내용과 의도를 분석의 최우선으로 삼을 것
   - 타이틀에서 강조하는 주제나 질문이 요약의 중심이 되도록 할 것

최종 검증 체크리스트:
- 원문에 없는 내용이 추가되지 않았는지 확인
- 교수/강사가 특별히 언급한 내용이 모두 포함되었는지 확인
- 시험 관련 언급(나온다/안나온다)이 모두 정확히 표시되었는지 확인
- 원문의 모든 주요 섹션/주제가 누락 없이 요약에 포함되었는지 확인
- 원문의 강조점(★)과 의문점("??")이 적절히 유지되었는지 확인

결과는 반드시 유효한 JSON 형식으로만 응답하세요. 답변은 반드시 한글로 작성. 추가 설명이나 텍스트는 포함하지 마세요.`;

const PROMPTS: Record<Purpose, string> = {
  일반: TWITTER_PROMPT,
  업무: WORK_PROMPT,
  학습: STUDY_PROMPT,
  개인: PERSONAL_PROMPT,
};

const TIMEOUT_DURATION = 25000;

// Google Generative AI API 인스턴스 설정
const setupGeminiAPI = () => {
  const apiKey = process.env.GEMINI_API_KEY || 'envlocal';
  return new GoogleGenerativeAI(apiKey);
};

export async function POST(req: NextRequest) {
  // timeoutId 변수를 여기서 선언해서 스코프 문제 해결
  let timeoutId: NodeJS.Timeout | undefined;

  try {
    // 요청에서 텍스트 추출
    const body = await req.json();
    const { text, originalTitle, originalImage, purpose = '일반', sourceId = null } = body;

    const validPurpose = (Object.keys(PROMPTS).includes(purpose) ? purpose : '일반') as Purpose;
    let selectedPrompt = PROMPTS[validPurpose];

    if (sourceId) {
      try {
        // 기존 요약 조회
        const summaryResult = await getContentSummary(sourceId, purpose);

        // 2. 기존 요약이 있으면 바로 반환
        if (summaryResult.existingSummary) {
          const cachedSummary = summaryResult.summary;
          console.log(`캐싱된 요약 사용: sourceId=${sourceId}, purpose=${purpose}`);

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
          });
        }
      } catch (cacheError) {
        console.error('캐싱된 요약 조회 오류:', cacheError);
        // 오류 발생 시 계속 진행 (Gemini로 새로 생성)
      }
    }

    // 오리지널 타이틀이 있을 경우 프롬프트에 타이틀 강조 지시사항 추가
    if (originalTitle && originalTitle.trim() !== '') {
      selectedPrompt = selectedPrompt + TITLE_EMPHASIS;
    }

    // 요청 시작 시간 기록
    const startTime = Date.now();
    console.log('====== Gemini API 요청 시작 ======');
    console.log(`요청 시간: ${new Date().toISOString()}`);
    console.log(`입력 텍스트 길이: ${text.length} 자`);
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
      return NextResponse.json({ error: '유효한 텍스트가 필요합니다.' }, { status: 400 });
    }

    // API 키 확인
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBRXKuxlyZCCGO126mbs3BT66uGnSfiQUE';
    if (!apiKey) {
      console.log('오류: API 키가 설정되지 않음');
      return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
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
            const supabase = await createSupabaseServerClient();

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

        // 응답 반환
        return NextResponse.json({
          ...parsedContent,
          originalTitle: originalTitle || '',
          originalImage: originalImage || '',
          sourceId: sourceId,
        });
      } catch (error) {
        // parseError를 Error 타입으로 처리하여 타입 오류 해결
        const parseError = error as Error;
        console.error('JSON 파싱 오류:', parseError);
        console.log('====== JSON 파싱 오류 발생 ======');
        console.log('원본 응답:', responseText);
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
