import { getContentSummary } from '@/app/utils/summary-manager';
import { createSupabaseServerClient } from '@/lib/supabse/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

type Purpose = '일반' | '업무' | '학습' | '개인';

const EMPHASIS_INSTRUCTION = `너는 교과서나 학습자료 수준의 명확한 문서요약 전문가야.
1. 원문을 철저히 분석하여 가장 중요한 개념, 논점, 사례를 정확히 파악해.
2. 요약은 일타강사가 학생들에게 핵심을 설명하듯 명료하고 간결하게 작성해.
3. 독자가 한눈에 파악할 수 있도록 구조화하고 핵심 요점을 강조해.
4. tweet_main, thread, labeling.key_sentence 이 3부분에는 반드시 최소 한개 이상의 태그를 포함해야함

[중요: 최소한의 효과적인 태그 사용 지침]
* 태그는 <key>, <ex>, <data>, <term> 네 가지만 사용해.
* 태그는 각 문단이나 포인트당 최대 1개만 사용하고, 문서 전체적으로 20% 이하로 제한해.
* 태그는 절대적으로 가장 핵심적인 내용에만 적용해.
* 태그는 문장 전체가 아닌, 정확히 핵심 구절에만 적용해.
* <key> 태그: 가장 중요한 주장이나 결론을 담은 구절에만 사용
* <ex> 태그: 가장 중요한 사례나 예시를 담은 구절에만 사용
* <data> 태그: 꼭 기억해야 할 수치 데이터를 포함한 구절에만 사용
* <term> 태그: 반드시 알아야 할 핵심 용어와 정의에만 사용

[태그 사용 예시]
* 잘못된 예: <key>독서는 뇌를 활성화하고 상상력을 자극하는 지적 활동이며, 수동적인 영상 시청과는 차별화된다</key>
* 올바른 예: 독서는 <key>뇌를 활성화하고 상상력을 자극</key>하는 지적 활동이며, 수동적인 영상 시청과는 차별화된다

* 잘못된 예: <data>브라질 중앙은행은 기준 금리를 14.25%로 인상했으며, 이는 인플레이션을 억제하기 위한 조치다</data>
* 올바른 예: 브라질 중앙은행은 <data>기준 금리를 14.25%로 인상</data>했으며, 이는 인플레이션을 억제하기 위한 조치다

* 잘못된 예: <key>책은 정보 습득을 넘어 지식과 지혜를 연결</key>하는 훈련을 제공하며, <ex>비판적 사고와 집중력</ex>을 키워줌
* 올바른 예: 책은 <key>정보 습득을 넘어 지식과 지혜를 연결</key>하는 훈련을 제공하며, 비판적 사고와 집중력을 키워줌
`;

const TITLE_EMPHASIS = `
중요: 제공된 '오리지널 타이틀'과 원문의 '주요 사례와 예시'는 요약의 핵심 지침으로 우선적으로 고려해야 해. 넌 모든 답변에 절대 반말을 사용하면안돼!

1. 원문 분석 시 오리지널 타이틀이 질문하거나 강조하는 내용에 우선적으로 초점을 맞춰.
2. 타이틀에 언급된 핵심 주제, 질문 또는 관점이 반드시 요약의 주요 부분에 포함되어야 해.
3. 원문에서 언급된 구체적 사례, 예시, 스토리는 사람들의 기억에 가장 잘 남는 요소이므로 반드시 포함해.
   - 실제 인물, 기업, 제품 등 각종 사례 
   - 구체적 수치와 통계
   - 직접 인용된 중요 발언
   - 비유와 스토리텔링
4. key_sentence는 반드시 오리지널 타이틀이 제시하는 주제나 질문에 직접 답변하고, 주요 사례를 언급해야 해.
5. 원문에 명시적으로 존재하지 않는 내용은 절대 추가하지 마.
6. 결과 JSON의 모든 구성요소(title, tweet_main, thread 등)가 오리지널 타이틀의 의도와 일관성을 유지하는지 확인해.

7. 이해하기 쉬운 표현 사용:
   - 중학생 수준의 지식을 가진 사람도 쉽게 이해할 수 있는 단어와 표현을 사용해.
   - 전문 용어가 필요한 경우 간단한 설명을 함께 제공해.
   - 복잡한 문장 구조보다 짧고 명확한 문장을 사용해.
   - 추상적인 개념은 구체적인 예시로 보완해.
   - 어려운 단어 대신 일상에서 자주 쓰이는 쉬운 단어를 선택해.
`;

const TWITTER_PROMPT = `너는 교과서나 학습자료 수준의 명확한 문서요약 전문가야.
1. 원문을 철저히 분석하여 가장 중요한 개념, 논점, 사례를 정확히 파악해.
2. 요약은 일타강사가 학생들에게 핵심을 설명하듯 명료하고 간결하게 작성해.
3. 독자가 한눈에 파악할 수 있도록 구조화하고 핵심 요점을 강조해.

[중요: 구체적 사례와 예시 강조]
* 원문에 언급된 구체적 사례, 예시, 일화는 사람의 기억에 가장 잘 남는 요소이므로 반드시 포함해.
* 특히 비유, 이야기, 실제 사건, 사람들의 경험담 등 스토리텔링 요소는 반드시 tweet_main과 thread에 포함시켜.
* 추상적 개념보다 구체적 예시(숫자, 이름, 장소, 사건 등)를 우선적으로 선별해.
* 원문에 인용된 유명인의 말, 실제 상황, 구체적 데이터는 가능한 그대로 유지해.

아래의 형식에 따라 정확히 JSON 객체를 생성해:
{
  "title": "원문의 핵심을 명확히 드러내는 간결한 제목",
  "tweet_main": {
    "sections": [
      {
        "heading": "첫 번째 주요 주제/영역 (예: 현황과 문제점, $분야의 특성 등)",
        "points": [
          "• 첫 번째 주요 내용: 구체적이고 간결한 설명과 관련 예시/사례",
          "• 두 번째 주요 내용: 구체적이고 간결한 설명과 관련 예시/사례"
        ]
      },
      {
        "heading": "두 번째 주요 주제/영역 (예: 성공 사례와 요건, 해결 방안 등)",
        "points": [
          "• 첫 번째 주요 내용: 구체적이고 간결한 설명과 관련 예시/사례",
          "• 두 번째 주요 내용: 구체적이고 간결한 설명과 관련 예시/사례"
        ],
        "sub_sections": [
          {
            "sub_heading": "하위 주제 (필요한 경우만)",
            "sub_points": [
              "◦ 세부 사항 1: 간결한 설명과 구체적 예시",
              "◦ 세부 사항 2: 간결한 설명과 구체적 예시"
            ]
          }
        ]
      },
      ... (필요한 갯수만큼 추가, sub_sections는 필요한 경우만 작성, heading에는 절대 앞에 숫자넣지마!)
    ]
  },
  "hashtags": ["핵심키워드1", "핵심키워드2", ... ], // 원문 내용에 따라 1~3개 사이로 필요한 만큼만 작성
  "thread": [
    "1. 가장 중요한 핵심 개념 - 반드시 구체적 예시/사례와 함께 서술",
    "2. 두 번째 중요 개념 - 반드시 구체적 사례/데이터와 함께 서술",
    ... // 원문의 복잡도와 주요 개념 수에 따라 1~10개 사이로 필요한 만큼만 작성
  ],
  "labeling": {
    "category": "가장 적합한 카테고리 한 가지만 선택",
    "keywords": ["정확한키워드1", "정확한키워드2", ... ], // 원문 내용에 따라 1~10개 사이로 필요한 만큼만 작성
    "key_sentence": "원문의 3-5개 핵심 개념을 포함하고, 이들 사이의 관계를 명시하며, 구체적인 정보를 담은 한 문장으로 압축 (일반적 진술이 아닌 원문 특유의 정보가 드러나야 함)"
  }
}

!!!중요!!! 카테고리는 다음 목록에서 반드시 정확히 하나만 선택해야 해: 인문/철학, 역사, 경영/경제, 언어, 정치, 사회, 국제, 과학/IT, 수학, 기술/공학, 의학/건강, 예술/문화, 문학/창작 (위 목록에 없는 카테고리는 절대 사용하지 마. 항상 슬래시(/)가 포함된 형태를 그대로 사용해.)

핵심 작성 지침:
1. 교과서처럼 명확하게: 모호함 없이 명확한 문장으로 서술해
2. tweet_main은 원문의 내용과 맥락에 맞게 구조화해:
   - 내용에 맞는 적절한 대분류 제목 사용 (현황/문제점, 사례/요건, 해결방안, 핵심전략 등)
   - 각 대분류 아래 구체적인 요점을 글머리 기호로 정리해
   - 필요시 중분류, 소분류 구조 활용하여 내용의 계층 구조 표현해
3. 구체적 사례 강조: 
   - 원문에서 언급된 중요 사례, 데이터, 일화는 반드시 포함해
   - 예시와 구체적 사례는 사람들의 기억에 오래 남으므로 우선적으로 포함해
   - 원문에서 비유, 유명인 발언, 실생활 사례가 있다면 반드시 포함해
4. 문장은 완전한 형태로: 불완전한 문장이나 의문형으로 끝나는 문장 사용 금지해
5. 논리적 구조화: 중요도 순으로 정보를 제시하며 핵심→세부사항 순으로 구성해

추가 요약 테크닉:
- 핵심 문장은 명제형으로 작성해
- 불필요한 수식어 제거하고 간결하게 서술해
- 교과서나 문제집 설명처럼 직관적이고 명확한 문체 사용해
- 내용의 특성에 맞게 분류 체계 구성해 (예: 경영 내용은 '현황-문제점-해결책' 구조, 기술 내용은 '원리-응용-전망' 구조)
- 중요 개념과 사례를 효과적으로 연결하여 이해도 높이기
- 하나의 개념당 최소 하나의 구체적 예시 포함하기

사례 포함 특별 지침:
1. 원문에 나오는 모든 숫자 데이터(금액, 비율, 수치 등)는 특별히 중요한 정보로 간주하고 포함해
2. 실제 인물, 기업, 제품 이름은 구체성을 높이므로 가능한 그대로 유지해
3. 원문의 '이야기'나 '일화'는 전체 맥락을 유지하면서 간결하게 포함해
4. 원문에서 강조된 비유나 은유는 그대로 유지하여 포함해
5. 전문적 개념을 설명하는 실생활 예시는 반드시 포함해

결과는 반드시 유효한 JSON 형식으로만 응답해. 답변은 반드시 한글로 작성해. 추가 설명이나 텍스트는 포함하지 마.`;

const WORK_PROMPT = `너는 비즈니스 문서 전문 요약가야.
1. 업무 문서를 체계적으로 분석하여 핵심 내용, 의사결정 사항, 액션 아이템 등을 명확하게 파악해.
2. 요약은 간결하고 전문적인 비즈니스 어조로 작성하여 바쁜 의사결정자가 빠르게 핵심을 파악할 수 있게 해.
3. 실행 가능한 정보와 비즈니스 인사이트에 중점을 두고 구조화해.
4. 원문에 없는 내용은 절대 추가하지 마. 없는 내용을 만들어내는 것은 심각한 오류야.

아래의 형식에 따라 정확히 JSON 객체를 생성해:
{
  "title": "업무 문서의 핵심을 명확히 드러내는 간결한 제목",
  "tweet_main": {
    "sections": [
      // 원문의 주요 섹션이나 주제에 맞게 적절한 수의 섹션 포함
      // 원문에 없는 내용의 섹션은 포함하지 마
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
1. 원문에 있는 내용만 포함해:
   - 원문에 명시적으로 존재하지 않는 내용은 절대 추가하지 마
   - 특히 인물 이름, 날짜, 팀 구성, 수치 등은 원문에 있는 그대로만 포함해
   - 불확실하거나 모호한 내용은 포함하지 않는 것이 좋아

2. 항목 수 제한 없음:
   - 각 섹션의 points, sub_sections, sub_points는 원문 내용에 따라 필요한 만큼 포함해
   - 원문에 관련 내용이 많으면 많은 항목을, 적으면 적은 항목을 포함해
   - 숫자나 개수에 제한 없이 원문의 중요 내용을 모두 적절히 반영해

3. 섹션 구성 자유:
   - 섹션 제목과 구성은 원문 내용과 구조에 맞게 자유롭게 조정해
   - 원문에 맞지 않는 섹션은 포함하지 말고, 원문 구조에 맞는 새로운 섹션 추가 가능해
   - 섹션 수에 제한은 없으며, 원문 구조를 가장 잘 반영하는 방식으로 구성해

4. 상세함과 정확성 유지해:
   - 원문의 중요 정보는 누락 없이 포함해
   - 원문의 수치, 날짜, 이름 등은 정확하게 그대로 사용해
   - 원문의 구체적 내용을 일반화하거나 왜곡하지 마

결과는 반드시 유효한 JSON 형식으로만 응답해. 답변은 반드시 한글로 작성해. 추가 설명이나 텍스트는 포함하지 마.`;

const PERSONAL_PROMPT = `너는 개인 메모와 일상 기록 정리 전문가야.
1. 일기, To-Do 목록, 개인 계획, 생각 등 다양한 유형의 개인 콘텐츠를 존중해.
2. 개인 기록의 실용적 목적(계획 추적, 할 일 관리, 감정 표현 등)을 유지해.
3. 원문에 실제로 존재하는 내용만 포함하고, 과도한 해석이나 의미 추가를 피해.
4. 오리지널 타이틀이 있는 경우, 이를 최우선적으로 존중해.

아래의 형식에 따라 정확히 JSON 객체를 생성해:
{
  "title": "원문의 핵심을 담은 간결한 제목 (원제목 있으면 유지)",
  "tweet_main": {
    "sections": [
      // 아래 섹션들은 원문 내용 유형에 따라 적절히 선택해
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
      // 원문에 맞지 않는 섹션은 포함하지 마
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
1. 개인 메모 특성 존중해:
   - 원문의 구어체, 이모티콘, 줄임말, 강조 표현 등을 그대로 유지해
   - 개인적인 약어나 특수 표현도 원문 그대로 유지해
   - 불완전한 문장이나 메모 형식 텍스트도 그대로 반영해

2. 실용성 중심 접근해:
   - 계획, 할 일, 구매 목록 등 실행 가능한 항목은 명확하게 구분해
   - 날짜, 시간, 장소 등 중요 정보는 눈에 띄게 처리해
   - 원문에서 강조된 우선순위 표현 ("꼭!", "중요", "!!!" 등) 유지해

3. 간결성 유지해:
   - 원문이 짧은 경우 tweet_main은 1-2개 섹션으로 제한해
   - 각 섹션의 points는 원문 내용을 간결하게 요약해
   - thread는 원문이 매우 짧은 경우 1개 항목으로도 충분해

4. 개인 일상 관련 섹션 유연성:
   - 원문 내용에 가장 적합한 섹션 제목 선택해 (위 예시에 국한되지 않음)
   - 필요시 섹션 제목을 원문에 맞게 적절히 변경해
   - 관련 내용이 없는 섹션은 완전히 생략해

5. 할루시네이션 방지해:
   - 원문에 없는 내용 추가 금지
   - 과도한 심리 분석이나 패턴 추론 금지
   - 원문에 명시되지 않은 감정이나 의도 추론 금지

6. 매우 짧은 메모 처리해:
   - 원문이 한두 문장인 경우, 과도한 분석 없이 핵심만 간결히 요약해
   - 짧은 메모는 1개 섹션, 1-2개 points로 구성해
   - 필요한 경우 thread도 1개 항목으로 제한해

결과는 반드시 유효한 JSON 형식으로만 응답해. 답변은 반드시 한글로 작성해. 추가 설명이나 텍스트는 포함하지 마.`;

const STUDY_PROMPT = `너는 학습 학습 최적화 전문가야.
1. 강의, 수업, 학습 자료의 내용을 분석하여 핵심 개념, 이론, 원리를 정확히 파악해.
2. 요약은 시험 준비에 최적화된 형태로 구조화하고, 원문의 강조점(★, 중요도 표시)을 유지해.
3. 교수/강사가 언급한 시험 관련 정보, 중요도 표시, 다음 수업 준비사항 등을 반드시 포함해.
4. 오리지널 타이틀이 있는 경우, 이를 요약의 중심 기준으로 삼아.
5. 원문에 없는 내용은 절대 추가하지 마. 없는 내용을 만들어내는 것은 심각한 오류야.

아래의 형식에 따라 정확히 JSON 객체를 생성해:
{
  "title": "원문 주제와 과목명을 반영한 제목",
  "tweet_main": {
    "sections": [
      // 원문의 주요 섹션이나 주제에 맞게 적절한 수의 섹션 포함
      // 원문에 없는 내용의 섹션은 포함하지 마
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
1. 원문에 있는 내용만 포함해:
   - 원문에 명시적으로 존재하지 않는 내용은 절대 추가하지 마
   - 교수/강사가 말한 내용도 원문에 있는 그대로만 포함해
   - 불확실하거나 모호한 내용은 포함하지 않는 것이 좋아

2. 항목 수 제한 없음:
   - 각 섹션의 points, sub_sections, sub_points는 원문 내용에 따라 필요한 만큼 포함해
   - 원문에 관련 내용이 많으면 많은 항목을, 적으면 적은 항목을 포함해
   - 숫자나 개수에 제한 없이 원문의 중요 내용을 모두 적절히 반영해

3. 섹션 구성 자유:
   - 섹션 제목과 구성은 원문 내용과 구조에 맞게 자유롭게 조정해
   - 원문에 맞지 않는 섹션은 포함하지 말고, 원문 구조에 맞는 새로운 섹션 추가 가능
   - 섹션 수에 제한은 없으며, 원문 구조를 가장 잘 반영하는 방식으로 구성해

4. 학습 자료 특성 유지해:
   - 강의/수업 메타데이터(날짜, 교수명, 과목명 등) 보존해
   - 원문의 구조와 체계(장-절 구조, 번호 체계 등) 유지해
   - 원문의 강조점(★, ⭐ 등) 및 '중요하다'는 언급 유지해
   - 학생의 의문점이나 이해 어려움 표시("??", "이해 안됨" 등) 보존해

5. 시험 정보 우선화해:
   - '시험에 나온다', '예상문제', '자주 출제된다' 등의 언급은 반드시 포함해
   - 교수가 특별히 강조한 내용은 중요도 표시(★)와 함께 포함해
   - "시험에 나오지 않는다"는 정보도 명시적으로 포함해

6. 학습 계획 정보 보존해:
   - 다음 수업 준비사항, 과제, 읽기 자료 등이 원문에 있으면 반드시 포함해
   - 원문에 언급된 시험 일정, 범위 등도 정확히 포함해

7. 오리지널 타이틀 존중해:
   - 오리지널 타이틀이 있다면 반드시 그 내용과 의도를 분석의 최우선으로 삼을 것
   - 타이틀에서 강조하는 주제나 질문이 요약의 중심이 되도록 할 것

최종 검증 체크리스트:
- 원문에 없는 내용이 추가되지 않았는지 확인
- 교수/강사가 특별히 언급한 내용이 모두 포함되었는지 확인
- 시험 관련 언급(나온다/안나온다)이 모두 정확히 표시되었는지 확인
- 원문의 모든 주요 섹션/주제가 누락 없이 요약에 포함되었는지 확인
- 원문의 강조점(★)과 의문점("??")이 적절히 유지되었는지 확인

결과는 반드시 유효한 JSON 형식으로만 응답해. 답변은 반드시 한글로 작성해. 추가 설명이나 텍스트는 포함하지 마.`;

const PROMPTS: Record<Purpose, string> = {
  일반: TWITTER_PROMPT,
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

    // 사용자 인증 정보 확인
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const userId = session.user.id;

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

    // 오리지널 타이틀이 있을 경우 프롬프트에 타이틀 강조 지시사항 추가
    if (originalTitle && originalTitle.trim() !== '') {
      selectedPrompt = selectedPrompt + TITLE_EMPHASIS;
    }

    // 강조 지시사항 추가
    selectedPrompt = selectedPrompt + EMPHASIS_INSTRUCTION;

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
