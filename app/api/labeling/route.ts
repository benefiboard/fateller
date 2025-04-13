//app/api/labeling/route.ts

import { getContentSummary } from '@/app/utils/summary-manager';
import { createSupabaseServerClient } from '@/lib/supabse/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

type Purpose = '일반' | '업무' | '학습' | '개인';

const TITLE_EMPHASIS = `
중요: 제공된 '오리지널 타이틀'과 원문의 '주요 사례와 예시'는 요약의 핵심 지침으로 우선적으로 고려해야 합니다.

1. 원문 분석 시 오리지널 타이틀이 질문하거나 강조하는 내용에 우선적으로 초점을 맞추세요.
2. 타이틀에 언급된 핵심 주제, 질문 또는 관점이 반드시 요약의 주요 부분에 포함되어야 합니다.
3. 원문에서 언급된 구체적 사례, 예시, 스토리는 사람들의 기억에 가장 잘 남는 요소이므로 반드시 포함하세요.
   - 실제 인물, 기업, 제품 등 각종 사례 
   - 구체적 수치와 통계
   - 직접 인용된 중요 발언
   - 비유와 스토리텔링
4. key_sentence는 반드시 오리지널 타이틀이 제시하는 주제나 질문에 직접 답변하고, 주요 사례를 언급해야 합니다.
5. 원문에 명시적으로 존재하지 않는 내용은 절대 추가하지 마세요.
6. 결과 JSON의 모든 구성요소(title, tweet_main, thread 등)가 오리지널 타이틀의 의도와 일관성을 유지하는지 확인하세요.

7. 이해하기 쉬운 표현 사용:
   - 중학생 수준의 지식을 가진 사람도 쉽게 이해할 수 있는 단어와 표현을 사용하세요.
   - 전문 용어가 필요한 경우 간단한 설명을 함께 제공하세요.
   - 복잡한 문장 구조보다 짧고 명확한 문장을 사용하세요.
   - 추상적인 개념은 구체적인 예시로 보완하세요.
   - 어려운 단어 대신 일상에서 자주 쓰이는 쉬운 단어를 선택하세요.
`;

const SUMMARY_PROMPT = `당신은 전문적인 요약가입니다. 당신의 임무는 주어진 원문의 모든 중요한 내용과 세부사항을 빠짐없이 정확하게 요약하는 것입니다.

원문 분석 지침:
1. 원문에 언급된 모든 중요한 사실, 데이터, 숫자, 인용, 사례를 빠짐없이 포함하세요.
2. 개인, 기관, 회사의 이름과 그들의 발언이나 행동을 정확히 포함하세요.
3. 시간 순서, 인과 관계, 논리적 구조를 유지하세요.
4. 원문에 없는 내용을 추가하거나 원문의 내용을 왜곡하지 마세요.
5. 모든 핵심 주제를 다루되, 적절한 비중으로 요약하세요.

출력 형식 지침:
{
  "title": "원문의 핵심 내용을 명확히 요약한 제목",
  "tweet_main": {
    "sections": [
      {
        "heading": "주요 주제 영역 1",
        "points": [
          "• 첫 번째 중요 포인트: 관련 세부사항과 데이터 포함",
          "• 두 번째 중요 포인트: 관련 세부사항과 데이터 포함",
          "• 세 번째 중요 포인트: 관련 세부사항과 데이터 포함"
        ]
      },
      {
        "heading": "주요 주제 영역 2",
        "points": [
          "• 첫 번째 중요 포인트: 관련 세부사항과 데이터 포함",
          "• 두 번째 중요 포인트: 관련 세부사항과 데이터 포함"
        ],
        "sub_sections": [
          {
            "sub_heading": "세부 주제 영역",
            "sub_points": [
              "◦ 첫 번째 세부 포인트: 추가 세부사항 포함",
              "◦ 두 번째 세부 포인트: 추가 세부사항 포함"
            ]
          }
        ]
      }
    ]
  },
  "hashtags": ["관련키워드1", "관련키워드2", "관련키워드3"],
  "thread": [
    "1. 첫 번째 주요 내용에 대한 상세한 요약 - 구체적인 데이터, 사례, 인용문 등 포함. 각 thread 항목은 최소 2-3문장 이상으로 충분히 상세하게 작성해야 합니다.",
    "2. 두 번째 주요 내용에 대한 상세한 요약 - 구체적인 데이터, 사례, 인용문 등 포함. 간결한 요약이 아닌, 충분한 정보와 맥락을 제공하는 풍부한 내용으로 작성해야 합니다.",
    "3. 세 번째 주요 내용에 대한 상세한 요약 - 구체적인 데이터, 사례, 인용문 등 포함. 각 thread 항목은 해당 주제에 대한 핵심 정보와 흥미로운 세부사항을 균형있게 담아야 합니다.",
    "4. 네 번째 주요 내용에 대한 상세한 요약 - 구체적인 데이터, 사례, 인용문 등 포함. 각 항목은 독립적으로 읽었을 때도 충분히 이해될 수 있도록 완결된 내용을 담아야 합니다.",
    "5. 다섯 번째 주요 내용에 대한 상세한 요약 - 구체적인 데이터, 사례, 인용문 등 포함. 트위터 쓰레드처럼 간결하게 작성하되, 각 항목이 충분한 내용과 가치를 담고 있어야 합니다."
  ],
  "labeling": {
    "category": "가장 적합한 카테고리 선택",
    "keywords": ["정확한키워드1", "정확한키워드2", "정확한키워드3", "정확한키워드4", "정확한키워드5"],
    "key_sentence": "원문의 핵심 내용을 모두 포함하는 하나의 통합적인 문장"
  }
}

thread 작성 시 특별 지침:
1. thread는 단순한 요약이 아닌, 각 주제에 대한 충분한 내용을 담아야 합니다.
2. 각 thread 항목은 최소 2-3개 문장으로 구성하고, 핵심 정보와 함께 흥미로운 세부사항도 포함해야 합니다.
3. 숫자, 인용문, 구체적 사례 등을 포함하여  작성하세요.
4. 트위터 쓰레드처럼 독립적으로 읽어도 이해될 수 있도록 각 항목을 완결된 형태로 작성하세요.
5. thread의 각 항목은 tweet_main의 중요 섹션과 연결되어야 하지만, 단순히 헤딩을 반복하는 것이 아니라 핵심 내용을 풀어쓰는 형태여야 합니다.

매우 중요한 사항:
1. 절대로 마크다운 코드 블록(\`\`\`)을 사용하지 마세요. 순수한 JSON만 반환하세요.
2. tweet_main의 sections은 반드시 원문의 모든 주요 내용을 포함할 수 있도록 충분히 생성하세요. 최소 5개 이상, 필요하다면 최대 10개까지 포함하세요.
3. 각 section의 points는 주제에 따라 최소 2개 이상, 필요한 만큼 포함하세요.
4. thread의 각 항목은 간략한 문장이 아니라 충분히 상세한 내용(2-3문장 이상)으로 작성하세요.
5. 원문에서 언급된 모든 중요한 사건, 인물, 숫자, 인용문이 빠짐없이 포함되었는지 확인하세요.
6. 카테고리는 다음 중 하나를 선택하세요: 인문/철학, 역사, 경영/경제, 언어, 정치, 사회, 국제, 과학/IT, 수학, 기술/공학, 의학/건강, 예술/문화, 문학/창작

반환 형식은 반드시 순수한 JSON이어야 합니다. 반드시 한글로 작성해야합니다. 설명이나 마크다운 코드 블록 기호(\`\`\`)를 포함하지 마세요.`;

const BASIC_PROMPT = `당신은 교과서나 학습자료 수준의 명확한 문서요약 전문가입니다.
1. 원문을 철저히 분석하여 가장 중요한 개념, 논점, 사례를 정확히 파악하세요.
2. 요약은 일타강사가 학생들에게 핵심을 설명하듯 명료하고 간결하게 작성하세요.
3. 독자가 한눈에 파악할 수 있도록 구조화하고 핵심 요점을 강조하세요.

[중요: 구체적 사례와 예시 강조]
* 원문에 언급된 구체적 사례, 예시, 일화는 사람의 기억에 가장 잘 남는 요소이므로 반드시 포함하세요.
* 특히 비유, 이야기, 실제 사건, 사람들의 경험담 등 스토리텔링 요소는 반드시 tweet_main과 thread에 포함시키세요.
* 추상적 개념보다 구체적 예시(숫자, 이름, 장소, 사건 등)를 우선적으로 선별하세요.
* 원문에 인용된 유명인의 말, 실제 상황, 구체적 데이터는 가능한 그대로 유지하세요.

아래의 형식에 따라 정확히 JSON 객체를 생성하세요:
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
      ... (필요한 갯수만큼 추가, sub_sections는 필요한 경우만 작성, heading에는 절대 앞에 숫자넣지마세요!)
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

!!!중요!!! 카테고리는 다음 목록에서 반드시 정확히 하나만 선택하셔야 합니다: 인문/철학, 역사, 경영/경제, 언어, 정치, 사회, 국제, 과학/IT, 수학, 기술/공학, 의학/건강, 예술/문화, 문학/창작 (위 목록에 없는 카테고리는 절대 사용하지 마세요. 항상 슬래시(/)가 포함된 형태를 그대로 사용하세요.)

핵심 작성 지침:
1. 교과서처럼 명확하게: 모호함 없이 명확한 문장으로 서술하세요
2. tweet_main은 원문의 내용과 맥락에 맞게 구조화하세요:
   - 내용에 맞는 적절한 대분류 제목 사용 (현황/문제점, 사례/요건, 해결방안, 핵심전략 등)
   - 각 대분류 아래 구체적인 요점을 글머리 기호로 정리하세요
   - 필요시 중분류, 소분류 구조 활용하여 내용의 계층 구조 표현하세요
3. 구체적 사례 강조:
   - 원문에서 언급된 중요 사례, 데이터, 일화는 반드시 포함하세요
   - 예시와 구체적 사례는 사람들의 기억에 오래 남으므로 우선적으로 포함하세요
   - 원문에서 비유, 유명인 발언, 실생활 사례가 있다면 반드시 포함하세요
4. 문장은 완전한 형태로: 불완전한 문장이나 의문형으로 끝나는 문장 사용 금지하세요
5. 논리적 구조화: 중요도 순으로 정보를 제시하며 핵심→세부사항 순으로 구성하세요

추가 요약 테크닉:
- 핵심 문장은 명제형으로 작성하세요
- 불필요한 수식어 제거하고 간결하게 서술하세요
- 교과서나 문제집 설명처럼 직관적이고 명확한 문체 사용하세요
- 내용의 특성에 맞게 분류 체계 구성하세요 (예: 경영 내용은 '현황-문제점-해결책' 구조, 기술 내용은 '원리-응용-전망' 구조)
- 중요 개념과 사례를 효과적으로 연결하여 이해도 높이기
- 하나의 개념당 최소 하나의 구체적 예시 포함하기

사례 포함 특별 지침:
1. 원문에 나오는 모든 숫자 데이터(금액, 비율, 수치 등)는 특별히 중요한 정보로 간주하고 포함하세요
2. 실제 인물, 기업, 제품 이름은 구체성을 높이므로 가능한 그대로 유지하세요
3. 원문의 '이야기'나 '일화'는 전체 맥락을 유지하면서 간결하게 포함하세요
4. 원문에서 강조된 비유나 은유는 그대로 유지하여 포함하세요
5. 전문적 개념을 설명하는 실생활 예시는 반드시 포함하세요

결과는 반드시 유효한 JSON 형식으로만 응답하세요. 답변은 반드시 한글로 작성하세요. 추가 설명이나 텍스트는 포함하지 마세요.`;

const WORK_PROMPT = `당신은 다양한 업무 문서 요약 전문가입니다.
1. 다양한 형태의 업무 관련 문서(회의록, 보고서, 제안서, 이메일, 기획안 등)를 분석하여 핵심 내용을 파악하세요.
2. 원문의 구조와 성격에 맞게 적절한 방식으로 요약을 구성하세요.
3. 원문에 없는 내용은 절대 추가하지 마세요. 없는 내용을 만들어내는 것은 심각한 오류입니다.

아래의 형식에 따라 정확히 JSON 객체를 생성하세요:
{
  "title": "원문의 핵심을 명확히 드러내는 간결한 제목",
  "tweet_main": {
    "sections": [
      {
        "heading": "원문의 주제와 내용에 맞게 자유롭게 설정",
        "points": [
          "• 첫 번째 요점 - 원문에서 추출한 중요 내용",
          "• 두 번째 요점 - 원문에서 추출한 중요 내용"
        ],
        "sub_sections": [
          {
            "sub_heading": "필요한 경우에만 하위 제목 설정",
            "sub_points": [
              "◦ 하위 요점 - 원문에서 추출한 상세 내용",
              "◦ 하위 요점 - 원문에서 추출한 상세 내용"
            ]
          }
        ]
      }
    ]
  },
  "hashtags": ["관련키워드1", "관련키워드2"],
  "thread": [
    "1. 첫 번째 핵심 내용 - 원문에서 추출",
    "2. 두 번째 핵심 내용 - 원문에서 추출"
  ],
  "labeling": {
    "category": "업무",(반드시 업무로 하고 변경하지마)
    "keywords": ["관련키워드1", "관련키워드2"],
    "key_sentence": "원문의 3-5개 핵심 개념을 포함하고, 이들 사이의 관계를 명시하는 한 문장"
  }
}

핵심 작성 지침:
1. 원문 중심 접근:
   - 원문의 실제 내용과 구조가 요약의 형태를 결정해야 합니다
   - 원문에 명시적으로 존재하지 않는 내용은 절대 추가하지 마세요
   - 원문의 수치, 날짜, 이름 등은 정확하게 그대로 사용하세요

2. 유연한 구조 활용:
   - 헤딩과 섹션은 원문의 실제 구조와 내용에 맞게 자유롭게 설정하세요
   - 섹션 수, 포인트 수, 하위 섹션 수에 제한은 없으며 원문의 복잡도에 맞게 조정하세요
   - 제시된 구조는 예시일 뿐이며, 원문 특성에 따라 완전히 다른 구조를 사용해도 됩니다

3. 다양한 업무 문서 고려:
   - 회의록: 결정사항, 액션 아이템, 참석자 의견 등 핵심 요소 포함
   - 보고서: 주요 발견, 결론, 제안사항 등 중요 정보 강조
   - 제안서: 핵심 제안, 배경, 기대효과 등 주요 내용 요약
   - 이메일 스레드: 주요 논의 내용, 결정사항, 후속 조치 등 정리
   - 기획안: 목표, 전략, 실행 계획 등 핵심 요소 포함

4. 맥락 유지:
   - 부서, 역할, 직책 등 조직적 맥락이 중요한 경우 이를 유지하세요
   - 시간적 순서가 중요한 문서는 이를 보존하세요
   - 문서의 공식적/비공식적 성격에 맞는 어조를 유지하세요

결과는 반드시 유효한 JSON 형식으로만 응답하세요. 답변은 반드시 한글로 작성하세요. 추가 설명이나 텍스트는 포함하지 마세요.`;

const PERSONAL_PROMPT = `당신은 다양한 개인 메모와 기록 정리 전문가입니다.
1. 다양한 형태의 개인 콘텐츠(메모, 일기, 생각 정리, 계획, 아이디어, 일상 기록 등)를 분석하세요.
2. 원문의 목적과 스타일을 존중하며 그 내용을 적절하게 구조화하세요.
3. 원문에 없는 내용은 추가하지 말고, 과도한 해석이나 의미 부여를 피하세요.

아래의 형식에 따라 정확히 JSON 객체를 생성하세요:
{
  "title": "원문의 핵심을 담은 제목 (원제목 있으면 유지)",
  "tweet_main": {
    "sections": [
      {
        "heading": "원문 내용과 목적에 맞게 자유롭게 설정",
        "points": [
          "• 첫 번째 요점 - 원문에서 추출한 내용",
          "• 두 번째 요점 - 원문에서 추출한 내용"
        ],
        "sub_sections": [
          {
            "sub_heading": "필요한 경우에만 하위 제목 설정",
            "sub_points": [
              "◦ 하위 요점 - 원문에서 추출한 상세 내용",
              "◦ 하위 요점 - 원문에서 추출한 상세 내용"
            ]
          }
        ]
      }
    ]
  },
  "hashtags": ["관련키워드1", "관련키워드2"],
  "thread": [
    "1. 첫 번째 핵심 내용 - 원문에서 추출",
    "2. 두 번째 핵심 내용 - 원문에서 추출"
  ],
  "labeling": {
    "category": "개인",(반드시 개인으로 하고 변경하지마)
    "keywords": ["관련키워드1", "관련키워드2"],
    "key_sentence": "원문의 핵심 내용을 요약한 한 문장"
  }
}

핵심 작성 지침:
1. 원문의 다양성 존중:
   - 개인 메모는 형식, 목적, 스타일이 매우 다양할 수 있음을 인식하세요
   - 원문의 실제 내용과 목적이 요약의 구조를 결정해야 합니다
   - 원문이 간결하고 구조화되지 않은 경우 결과도 그에 맞게 간결하게 유지하세요

2. 유연한 구조 활용:
   - 원문이 매우 짧거나 단순한 경우 최소한의 섹션만 사용하세요
   - 헤딩과 섹션은 원문의 실제 내용과 목적에 맞게 자유롭게 설정하세요
   - 제시된 구조는 예시일 뿐이며, 원문 특성에 따라 완전히 다른 구조를 사용해도 됩니다

3. 다양한 개인 콘텐츠 유형 고려:
   - 계획/할일: 시간, 날짜, 중요도 등의 맥락 유지
   - 아이디어/생각: 연결성, 흐름, 발상 과정 보존
   - 일기/감정 표현: 감정 상태, 주관적 경험 등 원문 그대로 유지
   - 메모/기록: 간결함과 핵심 정보 우선
   - 창작 콘텐츠: 창의적 요소와 표현 방식 존중
   - 자기계발: 목표, 동기, 진행 상황 등 맥락 유지

4. 개인적 표현 방식 보존:
   - 원문의 구어체, 이모티콘, 약어, 줄임말 등 그대로 유지
   - 강조, 반복, 의문 등의 표현 방식 보존
   - 개인적인 표기법이나 특별한 표현 방식 존중

5. 최소한의 구조화:
   - 원문이 구조화되지 않은 경우 과도한 구조화를 피하세요
   - 원문이 짧은 경우 섹션 수와 포인트 수를 최소화하세요
   - 필요한 경우 하나의 섹션과 몇 개의 포인트만으로도 충분합니다

결과는 반드시 유효한 JSON 형식으로만 응답하세요. 답변은 반드시 한글로 작성하세요. 추가 설명이나 텍스트는 포함하지 마세요.`;

const STUDY_PROMPT = `당신은 학습 자료 요약 전문가입니다.
1. 다양한 형태의 학습 자료(강의노트, 교재, 논문, 튜토리얼, 온라인 강좌 등)를 분석하여 학습에 필요한 충분한 세부사항을 유지하세요.
2. 너무 간략하게 요약하지 말고, 핵심 개념과 함께 구체적인 예시, 수치, 데이터를 적절히 포함하세요.
3. 원문에 없는 내용은 절대 추가하지 마세요. 없는 내용을 만들어내는 것은 심각한 오류입니다.

아래의 형식에 따라 정확히 JSON 객체를 생성하세요:
{
  "title": "원문의 주제와 내용을 반영한 제목",
  "tweet_main": {
    "sections": [
      {
        "heading": "원문의 주제에 맞게 자유롭게 설정",
        "points": [
          "• 첫 번째 학습 요점 - 충분한 설명과 구체적 예시 포함",
          "• 두 번째 학습 요점 - 충분한 설명과 구체적 예시 포함",
          "• 세 번째 학습 요점 - 충분한 설명과 구체적 예시 포함"
        ],
        "sub_sections": [
          {
            "sub_heading": "필요한 경우 하위 제목 설정",
            "sub_points": [
              "◦ 세부 학습 포인트 - 충분한 상세 내용 포함",
              "◦ 세부 학습 포인트 - 충분한 상세 내용 포함"
            ]
          }
        ]
      }
    ]
  },
  "hashtags": ["관련키워드1", "관련키워드2"],
  "thread": [
    "1. 첫 번째 핵심 학습 내용 - 충분히 자세하게 서술",
    "2. 두 번째 핵심 학습 내용 - 충분히 자세하게 서술",
    "3. 세 번째 핵심 학습 내용 - 충분히 자세하게 서술",
    "4. 네 번째 핵심 학습 내용 - 충분히 자세하게 서술"
  ],
  "labeling": {
    "category": "학습",
    "keywords": ["관련키워드1", "관련키워드2"],
    "key_sentence": "원문의 핵심 개념을 포함하는 한 문장"
  }
}

핵심 작성 지침:
1. 적절한 세부 수준 유지:
   - 원문의 중요한 세부사항, 수치, 예시는 모두 포함하세요
   - 핵심 개념 설명 시 충분한 맥락과 배경을 함께 제공하세요
   - 일반 요약보다 더 많은 세부 내용을 포함하되, 불필요한 반복은 피하세요

2. 구조화와 가독성 균형:
   - 정보를 논리적 흐름에 따라 배열하세요
   - 충분한 설명을 제공하되 한 포인트가 너무 길어지지 않도록 적절히 분할하세요
   - 포인트 항목 수를 제한하지 말고 원문의 중요 내용을 모두 포함하세요

3. 학습 자료 특성 반영:
   - 원문에서 강조하거나 중요하다고 표시된 내용은 명확히 표현하세요
   - 교수/강사가 언급한 특별한 내용이나 시험 관련 정보는 구체적으로 포함하세요
   - 복잡한 개념은 더 자세한 설명을 제공하세요

4. 균형 잡힌 정보 제공:
   - 원문의 주요 섹션이나 영역을 모두 다루세요
   - 원문에서 중요하게 다룬 주제는 요약에서도 충분한 비중으로 다루세요
   - 스레드 부분에는 4-6개 항목을 포함하여 충분한 정보를 제공하세요

결과는 반드시 유효한 JSON 형식으로만 응답하세요. 답변은 반드시 한글로 작성하세요. 추가 설명이나 텍스트는 포함하지 마세요.`;

const PROMPTS: Record<Purpose, string> = {
  일반: SUMMARY_PROMPT,
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
    if (validPurpose !== '일반') {
      selectedPrompt = selectedPrompt + TITLE_EMPHASIS;
    }

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
