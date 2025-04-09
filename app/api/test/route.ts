//app/api/test/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { Innertube } from 'youtubei.js';
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

// 1차 요약 프롬프트 - 스타일 없이 순수하게 내용만 요약
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
1. thread는 단순한 요약이 아닌, 각 주제에 대한 충분히 상세한 내용을 담아야 합니다.
2. 각 thread 항목은 최소 2-3개 문장으로 구성하고, 핵심 정보와 함께 흥미로운 세부사항도 포함해야 합니다.
3. 숫자, 인용문, 구체적 사례 등을 포함하여 풍부하고 정보가 가득한 내용으로 작성하세요.
4. 트위터 쓰레드처럼 독립적으로 읽어도 이해될 수 있도록 각 항목을 완결된 형태로 작성하세요.
5. thread의 각 항목은 tweet_main의 중요 섹션과 연결되어야 하지만, 단순히 헤딩을 반복하는 것이 아니라 핵심 내용을 풀어쓰는 형태여야 합니다.

매우 중요한 사항:
1. 절대로 마크다운 코드 블록(\`\`\`)을 사용하지 마세요. 순수한 JSON만 반환하세요.
2. tweet_main의 sections은 반드시 원문의 모든 주요 내용을 포함할 수 있도록 충분히 생성하세요. 최소 5개 이상, 필요하다면 최대 10개까지 포함하세요.
3. 각 section의 points는 주제에 따라 최소 2개 이상, 필요한 만큼 포함하세요.
4. thread의 각 항목은 간략한 문장이 아니라 충분히 상세한 내용(2-3문장 이상)으로 작성하세요.
5. 원문에서 언급된 모든 중요한 사건, 인물, 숫자, 인용문이 빠짐없이 포함되었는지 확인하세요.
6. 카테고리는 다음 중 하나를 선택하세요: 인문/철학, 역사, 경영/경제, 언어, 정치, 사회, 국제, 과학/IT, 수학, 기술/공학, 의학/건강, 예술/문화, 문학/창작

반환 형식은 반드시 순수한 JSON이어야 합니다. 설명이나 마크다운 코드 블록 기호(\`\`\`)를 포함하지 마세요.`;

// 2차 스타일 적용 프롬프트 템플릿
function getStylePrompt(authorStyle: string, originalJson: string) {
  // 작가별 스타일 지침
  const styleInstructions = {
    feynman: `당신은 세계적인 물리학자이자 명강의자로 알려진 리처드 파인만으로 변신해야 합니다. 파인만은 어떤 복잡한 개념도 쉽고 재미있게 설명하는 능력으로 유명합니다.

파인만 스타일의 핵심 특징:
1. 극도로 명쾌하고 직관적인 설명 - 일상적 비유와 예시 풍부
2. 친근하고 대화체적인 어조 - "이것 좀 봐요", "생각해 보세요" 같은 표현
3. 호기심과 흥미를 자극하는 질문과 표현
4. 복잡한 개념을 쉬운 예시로 쪼개서 설명
5. 유머와 재치를 섞어 설명
6. 거의 마법처럼 느껴질 정도로 명쾌한 설명 방식

당신의 임무는 주어진 JSON 데이터를 파인만이 직접 설명하는 것처럼 다시 작성하는 것입니다. 내용과 구조는 그대로 유지하되, 표현 방식과 어조를 완전히 파인만 스타일로 바꾸세요.

* 기본 구조와 정보는 보존하면서 표현만 바꾸세요
* 타이틀과 헤딩을 더 흥미롭고 호기심을 자극하는 방식으로 바꾸세요
* 각 포인트를 파인만처럼 직관적이고 생생한 비유와 함께 재작성하세요
* thread 부분은 특히 중요합니다. 트위터 쓰레드처럼 보이지만, 각 항목에 파인만 특유의 생생한 설명과 흥미로운 비유, 직관적인 예시를 풍부하게 담아주세요. 각 항목은 최소 3-4문장 이상으로 상세하게 작성하세요.
* key_sentence를 파인만식 명쾌함으로 재작성하세요

thread 작성 시 특별 지침:
1. "이것 좀 보세요!", "생각해 보세요!", "놀랍지 않나요?"와 같은 파인만 특유의 표현을 활용하세요.
2. 복잡한 내용도 마치 친구에게 이야기하듯 쉽고 재미있게 풀어써야 합니다.
3. 각 thread 항목에는 파인만식 비유와 생생한 예시를 최소 1개 이상 포함하세요.
4. 질문과 감탄문을 적절히 활용하여 독자의 호기심을 자극하세요.
5. 각 thread 항목은 간결함보다 '이해하기 쉬운 상세함'에 중점을 두어 작성하세요.

온도 설정: 0.8 (창의적인 표현과 생생한 비유를 위해)`,

    yoosimin: `당신은 한국의 유명 작가이자 지식인인 유시민으로 변신해야 합니다. 유시민은 논리적이고 체계적인 글쓰기와 명확한 분석으로 유명합니다.

유시민 스타일의 핵심 특징:
1. 철저한 논리적 구조와 체계적 분석
2. 역사적, 사회적 맥락을 항상 고려한 다층적 설명
3. 정교한 어휘와 문장, 그러나 불필요한 난해함은 배제
4. 사회과학적 관점에서 현상을 분석하고 해석
5. 예리한 비판 의식과 함께 대안 제시
6. '첫째... 둘째... 셋째...'와 같은 명확한 구조 활용
7. 교양 있는 대화체와 풍부한 인문학적 소양 표현

당신의 임무는 주어진 JSON 데이터를 유시민이 직접 작성한 것처럼 다시 표현하는 것입니다. 내용과 구조는 그대로 유지하되, 표현 방식과 어조를 완전히 유시민 스타일로 바꾸세요.

* 기본 구조와 정보는 보존하면서 표현만 바꾸세요
* 타이틀과 헤딩을 더 분석적이고 구조적인 방식으로 바꾸세요
* 각 포인트를 유시민처럼 논리적 구조와 함께 재작성하세요
* thread 부분은 특히 중요합니다. 각 항목은 유시민 특유의 논리적 분석과 사회적/역사적 맥락을 담아 최소 3-4문장 이상으로 상세하게, 마치 지적인 에세이처럼 작성하세요.
* key_sentence를 유시민식 통찰력으로 재작성하세요

thread 작성 시 특별 지침:
1. "이 문제의 본질은...", "역사적 맥락에서 살펴보면...", "이는 단순한 현상이 아니라..." 등 유시민 특유의 분석적 표현을 활용하세요.
2. 각 thread 항목은 논리적 구조(전제-분석-결론)를 갖추어 작성하세요.
3. 인문학적, 사회과학적 관점에서의 해석을 포함하세요.
4. 각 thread 항목은 학술적이고 교양 있는 어조를 유지하되, 지나치게 어렵지 않게 작성하세요.
5. 전체 thread가 하나의 논리적 흐름을 가질 수 있도록 연결성을 고려하세요.

온도 설정: 0.6 (논리적 일관성을 유지하면서도 창의적 표현을 위해)`,

    kimyoungha: `당신은 한국의 대표적인 작가 김영하로 변신해야 합니다. 김영하는 간결하고 절제된 문체와 예리한 통찰력으로 유명합니다.

김영하 스타일의 핵심 특징:
1. 극도로 간결하고 절제된 문체 - 불필요한 수식어 제거
2. 날카로운 통찰력과 예리한 관찰
3. 건조하면서도 묘한 긴장감을 주는 서술 방식
4. 복잡한 현상의 본질을 꿰뚫는 명쾌한 분석
5. 반전과 아이러니를 활용한 표현
6. 감정 표현보다는 객관적 사실 중심의 서술
7. 짧고 강렬한 문장 구사

당신의 임무는 주어진 JSON 데이터를 김영하가 직접 작성한 것처럼 다시 표현하는 것입니다. 내용과 구조는 그대로 유지하되, 표현 방식과 어조를 완전히 김영하 스타일로 바꾸세요.

* 기본 구조와 정보는 보존하면서 표현만 바꾸세요
* 타이틀과 헤딩을 더 간결하고 날카로운 방식으로 바꾸세요
* 각 포인트를 김영하처럼 불필요한 수식어 없이 강렬하게 재작성하세요
* thread 부분은 특히 중요합니다. 각 항목을 김영하 특유의 간결하면서도 강렬한 문체로 작성하되, 표면적 사실 너머의 본질을 꿰뚫는 통찰을 담아주세요. 각 항목은 짧은 문장들로 구성되었지만 서로 연결되어 풍부한 의미를 만들어내야 합니다.
* key_sentence를 김영하식 간결함과 통찰력으로 재작성하세요

thread 작성 시 특별 지침:
1. 간결한 문장을 연속적으로 사용하되, 각 문장이 강한 인상을 남길 수 있도록 작성하세요.
2. 표면적 사실을 넘어서는 독특한 관점과 통찰을 포함하세요.
3. 아이러니, 반전, 의외성을 활용하여 독자의 사고를 자극하세요.
4. 감정적 표현보다는 객관적 서술로 오히려 더 강한 인상을 주는 방식을 택하세요.
5. 각 thread 항목은 간결하면서도 충분한 정보와 깊이를 담아야 합니다.

온도 설정: 0.7 (간결함과 예상치 못한 통찰을 위해)`,

    haruki: `당신은 세계적인 소설가 무라카미 하루키로 변신해야 합니다. 하루키는 일상과 초현실의 경계를 넘나드는 독특한 문체로 유명합니다.

하루키 스타일의 핵심 특징:
1. 담담하고 건조한 문체 속에 깊은 감성 담기
2. 일상적 디테일에 대한 세밀한 묘사
3. 초현실적 은유와 상징 활용
4. 반복되는 문장 구조와 리듬감
5. 독백적이고 사색적인 어조
6. 평범한 현실과 기묘한 이면 세계의 대비
7. 재즈, 고양이, 우물, 달빛 등 하루키적 모티프 활용
8. 갑작스러운 전환과 단절을 통한 몽환적 분위기

당신의 임무는 주어진 JSON 데이터를 하루키가 직접 작성한 것처럼 다시 표현하는 것입니다. 내용과 구조는 그대로 유지하되, 표현 방식과 어조를 완전히 하루키 스타일로 바꾸세요.

* 기본 구조와 정보는 보존하면서 표현만 바꾸세요
* 타이틀과 헤딩을 더 하루키스러운 은유와 상징으로 바꾸세요 (그림자, 미로, 문, 달빛 등의 모티프 활용)
* 각 포인트를 하루키처럼 담담하면서도 묘한 분위기가 느껴지도록 재작성하세요
* thread 부분은 특히 중요합니다. 각 항목을 하루키 특유의 담담한 어조와 독백적인 분위기로 작성하되, 일상적 디테일과 은유적 표현이 자연스럽게 어우러지도록 해주세요. 마치 소설의 한 부분을 읽는 것처럼 세계관과 분위기가 느껴지게 작성하세요.
* key_sentence를 하루키식 은유와 상징으로 재작성하세요

thread 작성 시 특별 지침:
1. 일상적인 디테일과 감각적 묘사를 풍부하게 포함하세요.
2. 하루키 특유의 은유와 상징(달, 우물, 고양이, 미로 등)을 적절히 활용하세요.
3. 반복되는 문장 구조와 리듬감 있는 표현을 사용하세요.
4. 담담한 어조 속에 깊은 감성과 몽환적인 분위기를 담아내세요.
5. 각 thread 항목은 사실 전달 너머의 존재론적, 철학적 질문을 은근히 던지는 느낌을 주어야 합니다.

온도 설정: 0.9 (초현실적 은유와 독특한 분위기 표현을 위해)`,

    eagleman: `당신은 뇌과학자이자 작가인 데이비드 이글먼으로 변신해야 합니다. 이글먼은 과학적 정확성과 철학적 깊이를 결합한 독특한 스타일로 유명합니다.

이글먼 스타일의 핵심 특징:
1. 과학적 사고와 인문학적 통찰의 융합
2. 뇌과학적 관점에서 사회현상 해석
3. 정교한 비유와 사고실험을 통한 개념 설명
4. 일상적 현상에서 출발해 우주적 스케일로 확장하는 사고
5. 시간, 인식, 의식과 같은 근본적 주제와 연결
6. 탐구적이고 호기심 어린 어조
7. "생각해보라"와 같은 독자의 사고를 자극하는 표현

당신의 임무는 주어진 JSON 데이터를 이글먼이 직접 작성한 것처럼 다시 표현하는 것입니다. 내용과 구조는 그대로 유지하되, 표현 방식과 어조를 완전히 이글먼 스타일로 바꾸세요.

* 기본 구조와 정보는 보존하면서 표현만 바꾸세요
* 타이틀과 헤딩을 더 과학적-철학적 관점에서 바꾸세요
* 각 포인트를 이글먼처럼 정교한 비유와 사고실험을 통해 재작성하세요
* thread 부분은 특히 중요합니다. 각 항목을 이글먼 특유의 과학적 정확성과 철학적 깊이가 결합된 방식으로 작성하세요. "생각해보라"와 같은 표현으로 독자의 사고를 자극하고, 뇌과학적 관점에서 현상을 새롭게 조명하는 내용을 담아주세요. 각 항목은 상세하고 풍부한 내용을 가져야 합니다.
* key_sentence를 이글먼식 과학적-철학적 통찰로 재작성하세요

thread 작성 시 특별 지침:
1. "생각해보라..."와 같은 이글먼 특유의 표현으로 독자의 사고를 자극하세요.
2. 과학적 정확성을 유지하면서도 철학적 질문을 던지는 방식으로 내용을 전개하세요.
3. 뇌과학, 인지과학적 관점에서 현상을 새롭게 해석하는 내용을 포함하되, 원문의 사실을 왜곡하지 마세요.
4. 일상적 현상을 더 큰 맥락(진화적, 우주적, 시간적)에서 바라보는 관점을 제시하세요.
5. 각 thread 항목은 정보 전달과 함께 독자에게 새로운 시각과 깊은 통찰을 제공해야 합니다.

중요: 원문에 없는 뇌과학 내용을 무리하게 추가하지 마세요. 단지 이글먼처럼 사고하고 표현하는 방식을 채택하세요.

온도 설정: 0.8 (과학적 정확성과 창의적 표현의 균형을 위해)`,
  };

  // 선택한 작가 스타일에 맞는 지침 선택
  const selectedStyleInstructions =
    styleInstructions[authorStyle as keyof typeof styleInstructions];

  if (!selectedStyleInstructions) {
    return null; // 해당 스타일이 없으면 null 반환
  }

  // 최종 프롬프트 생성
  return `${selectedStyleInstructions}

주어진 JSON:
${originalJson}

이 JSON을 선택된 작가 스타일로 재작성하여 반환해 주세요. JSON 구조는 그대로 유지하고, 표현 방식만 바꿔주세요.
특히 thread 부분은 트위터 쓰레드처럼 보이지만, 각 항목에 충분한 내용과 작가의 특징적인 표현 방식이 담겨야 합니다.
각 thread 항목은 최소 3-4문장 이상의 상세한 내용으로 작성해주세요.

반드시 유효한 JSON 형식으로 반환하세요. 마크다운 코드 블록 (\`\`\`) 같은 형식은 사용하지 마세요.`;
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

  // 라이브 URL 형식
  let liveMatch = url.match(
    /^https?:\/\/(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]{11})(?:\?|$)/
  );
  if (liveMatch) {
    return liveMatch[1];
  }

  // YouTube Shorts
  let shortsMatch = url.match(
    /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?|$)/
  );
  if (shortsMatch) {
    return shortsMatch[1];
  }

  // YouTube Music
  let musicMatch = url.match(
    /^https?:\/\/music\.youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&|$)/
  );
  if (musicMatch) {
    return musicMatch[1];
  }

  // 모바일 앱 딥링크
  let vMatch = url.match(/^https?:\/\/(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:\?|$)/);
  if (vMatch) {
    return vMatch[1];
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

// 유튜브 메타데이터(제목, 썸네일) 가져오기 함수
async function getYoutubeMetadata(
  videoId: string
): Promise<{ title: string; thumbnailUrl: string }> {
  console.log(`유튜브 메타데이터 가져오기 시작: ${videoId}`);

  try {
    // OEmbed API URL 구성
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    console.log(`OEmbed API 요청: ${oembedUrl}`);

    // OEmbed API 호출
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      throw new Error(`OEmbed API 오류: ${response.status} ${response.statusText}`);
    }

    // 응답 JSON 파싱
    const oembedData = await response.json();
    console.log(`OEmbed 응답 성공`);

    // 제목 추출
    const title = oembedData.title || '제목 없음';

    // 고화질 썸네일 URL 구성
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    console.log(`제목: "${title}", 썸네일: "${thumbnailUrl}"`);

    return { title, thumbnailUrl };
  } catch (error: any) {
    console.error(`OEmbed API 오류:`, error);

    try {
      // OEmbed 실패 시 HTML 메타태그 추출 시도
      console.log(`OEmbed 실패, HTML 메타태그 시도`);
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await fetch(videoUrl);
      const html = await response.text();

      // 정규식으로 제목 추출
      const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
      let title = '제목을 가져올 수 없음';

      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(' - YouTube', '');
        console.log(`HTML에서 제목 추출 성공: "${title}"`);
      }

      const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      return { title, thumbnailUrl };
    } catch (backupError) {
      console.error(`백업 메타데이터 추출 오류:`, backupError);

      // 모든 방법 실패 시 기본값 반환
      return {
        title: '제목을 가져올 수 없음',
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    }
  }
}

// Gemini API 설정 함수
const setupGeminiAPI = (temperature: number = 0.3) => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('Gemini API 키가 설정되지 않았습니다.');
  }

  return new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: 'gemini-1.5-flash',
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
      temperature: temperature,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
    },
  });
};

// 마크다운 코드 블록 제거 함수
function removeMarkdownCodeBlocks(text: string): string {
  // 마크다운 코드 블록 패턴 (```json ... ```)을 찾아 내용만 추출
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = text.match(codeBlockRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  // 코드 블록이 없으면 원본 반환
  return text;
}

// 직접 텍스트 파일 처리 함수 (텍스트 파일이 업로드된 경우)
async function processTextContent(content: string, title?: string) {
  try {
    console.log('직접 텍스트 파일 처리 시작...');
    console.log(`텍스트 길이: ${content.length}자`);

    // 텍스트가 이미 JSON 형식인지 확인
    try {
      const parsedJson = JSON.parse(content);
      console.log('입력된 텍스트가 이미 JSON 형식입니다.');
      return parsedJson; // 이미 JSON 형식이면 그대로 반환
    } catch (e) {
      // JSON이 아니면 일반 텍스트로 처리 계속
      console.log('일반 텍스트로 처리 계속...');
    }

    // 1단계: 내용 요약 (스타일 없음)
    console.log('1단계: 순수 내용 요약 시작...');

    // 컨텐츠 프롬프트 생성
    const contentPrompt = title
      ? `오리지널 타이틀: "${title}" 
         다음 텍스트를 분석하고 요약해주세요: ${content}`
      : `다음 텍스트를 분석하고 요약해주세요: ${content}`;

    // 1단계: 내용 요약 API 호출
    const summaryModel = setupGeminiAPI(0.3); // 낮은 온도로 정확한 요약
    const summaryResult = await summaryModel.generateContent([SUMMARY_PROMPT, contentPrompt]);
    const summaryText = summaryResult.response.text();
    const cleanedSummary = removeMarkdownCodeBlocks(summaryText);

    // 순수 요약 JSON 파싱
    const parsedSummary = JSON.parse(cleanedSummary);
    console.log('1단계: 순수 내용 요약 완료');

    return parsedSummary;
  } catch (error: any) {
    console.error('텍스트 처리 오류:', error);
    throw new Error(`텍스트 처리 실패: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    // 요청에서 URL 추출
    const body = await request.json();
    const { url, title, authorStyle = 'default', textContent } = body;

    // 텍스트 콘텐츠가 직접 제공된 경우 (파일 업로드)
    if (textContent) {
      try {
        // 1단계: 텍스트 콘텐츠 처리
        const parsedSummary = await processTextContent(textContent, title);

        // 작가 스타일이 default인 경우 바로 1단계 결과 반환
        if (authorStyle === 'default') {
          console.log('기본 스타일 선택: 1단계 결과를 최종 결과로 반환');
          return NextResponse.json({
            success: true,
            textContent: true,
            authorStyle: 'default',
            summary: parsedSummary,
          });
        }

        // 2단계: 작가 스타일 적용
        console.log('2단계: 작가 스타일 적용 시작...');

        // 스타일 프롬프트 생성
        const stylePrompt = getStylePrompt(authorStyle, JSON.stringify(parsedSummary, null, 2));

        if (!stylePrompt) {
          console.log('유효하지 않은 작가 스타일: 1단계 결과를 최종 결과로 반환');
          return NextResponse.json({
            success: true,
            textContent: true,
            authorStyle: 'default', // 유효하지 않은 스타일이므로 default로 설정
            summary: parsedSummary,
          });
        }

        // 작가별 온도 설정 (스타일 프롬프트에서 온도 값 추출)
        const temperatureMatch = stylePrompt.match(/온도 설정: ([\d.]+)/);
        const styleTemperature = temperatureMatch ? parseFloat(temperatureMatch[1]) : 0.7;

        // 2단계: 스타일 적용 API 호출
        const styleModel = setupGeminiAPI(styleTemperature); // 작가 스타일에 맞는 온도 설정
        const styleResult = await styleModel.generateContent([stylePrompt]);
        const styleText = styleResult.response.text();
        const cleanedStyleText = removeMarkdownCodeBlocks(styleText);

        try {
          // 스타일 적용 JSON 파싱
          const parsedStyleResult = JSON.parse(cleanedStyleText);
          console.log('2단계: 작가 스타일 적용 완료');

          // 최종 결과 반환
          return NextResponse.json({
            success: true,
            textContent: true,
            authorStyle: authorStyle,
            summary: parsedStyleResult,
          });
        } catch (styleParseError) {
          console.error('스타일 적용 JSON 파싱 오류:', styleParseError);
          console.error('원본 응답:', styleText);

          // 스타일 적용 실패 시 1단계 결과 반환
          return NextResponse.json({
            success: true,
            textContent: true,
            authorStyle: authorStyle,
            summary: parsedSummary, // 1단계 요약 결과 반환
            styleError: '스타일 적용 중 오류가 발생했습니다. 기본 요약을 반환합니다.',
          });
        }
      } catch (textProcessError) {
        console.error('텍스트 처리 오류:', textProcessError);
        return NextResponse.json(
          {
            error: '텍스트 처리 오류, 다시 시도해주세요.',
          },
          { status: 422 }
        );
      }
    }

    // URL 기반 처리 (유튜브 URL)
    if (!url) {
      return NextResponse.json({ error: 'URL 또는 텍스트 콘텐츠가 필요합니다' }, { status: 400 });
    }

    // 유튜브 URL인지 확인
    if (!isYoutubeUrl(url)) {
      return NextResponse.json({ error: '유효한 유튜브 URL이 아닙니다' }, { status: 400 });
    }

    // 유튜브 ID 추출
    const videoId = extractYoutubeId(url);
    if (!videoId) {
      return NextResponse.json({ error: '유튜브 비디오 ID를 추출할 수 없습니다' }, { status: 400 });
    }

    console.log(`유튜브 비디오 ID: ${videoId}`);

    // 병렬로 자막과 메타데이터 가져오기
    const [transcriptText, metadata] = await Promise.all([
      fetchYoutubeTranscriptWithInnertube(videoId),
      getYoutubeMetadata(videoId),
    ]);

    // 자막 텍스트 정제
    const cleanedTranscript = transcriptText
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim();

    const videoTitle = metadata.title;

    console.log(`유튜브 제목: ${videoTitle}`);
    console.log(`자막 추출 완료: ${cleanedTranscript.length}자`);
    console.log(`선택된 작가 스타일: ${authorStyle}`);

    // 1단계: 내용 요약 (스타일 없음)
    console.log('1단계: 순수 내용 요약 시작...');

    // 컨텐츠 프롬프트 생성
    const contentPrompt = title
      ? `오리지널 타이틀: "${title}" 
         다음 텍스트를 분석하고 요약해주세요: ${cleanedTranscript}`
      : `오리지널 타이틀: "${videoTitle}" 
         다음 텍스트를 분석하고 요약해주세요: ${cleanedTranscript}`;

    // 1단계: 내용 요약 API 호출
    const summaryModel = setupGeminiAPI(0.3); // 낮은 온도로 정확한 요약
    const summaryResult = await summaryModel.generateContent([SUMMARY_PROMPT, contentPrompt]);
    const summaryText = summaryResult.response.text();
    const cleanedSummary = removeMarkdownCodeBlocks(summaryText);

    try {
      // 순수 요약 JSON 파싱
      const parsedSummary = JSON.parse(cleanedSummary);
      console.log('1단계: 순수 내용 요약 완료');

      // 작가 스타일이 default인 경우 바로 1단계 결과 반환
      if (authorStyle === 'default') {
        console.log('기본 스타일 선택: 1단계 결과를 최종 결과로 반환');
        return NextResponse.json({
          success: true,
          videoTitle: videoTitle,
          thumbnailUrl: metadata.thumbnailUrl,
          transcript: cleanedTranscript,
          authorStyle: 'default',
          summary: parsedSummary,
        });
      }

      // 2단계: 작가 스타일 적용
      console.log('2단계: 작가 스타일 적용 시작...');

      // 스타일 프롬프트 생성
      const stylePrompt = getStylePrompt(authorStyle, JSON.stringify(parsedSummary, null, 2));

      if (!stylePrompt) {
        console.log('유효하지 않은 작가 스타일: 1단계 결과를 최종 결과로 반환');
        return NextResponse.json({
          success: true,
          videoTitle: videoTitle,
          thumbnailUrl: metadata.thumbnailUrl,
          transcript: cleanedTranscript,
          authorStyle: 'default', // 유효하지 않은 스타일이므로 default로 설정
          summary: parsedSummary,
        });
      }

      // 작가별 온도 설정 (스타일 프롬프트에서 온도 값 추출)
      const temperatureMatch = stylePrompt.match(/온도 설정: ([\d.]+)/);
      const styleTemperature = temperatureMatch ? parseFloat(temperatureMatch[1]) : 0.7;

      // 2단계: 스타일 적용 API 호출
      const styleModel = setupGeminiAPI(styleTemperature); // 작가 스타일에 맞는 온도 설정
      const styleResult = await styleModel.generateContent([stylePrompt]);
      const styleText = styleResult.response.text();
      const cleanedStyleText = removeMarkdownCodeBlocks(styleText);

      try {
        // 스타일 적용 JSON 파싱
        const parsedStyleResult = JSON.parse(cleanedStyleText);
        console.log('2단계: 작가 스타일 적용 완료');

        // 최종 결과 반환
        return NextResponse.json({
          success: true,
          videoTitle: videoTitle,
          thumbnailUrl: metadata.thumbnailUrl,
          transcript: cleanedTranscript,
          authorStyle: authorStyle,
          summary: parsedStyleResult,
        });
      } catch (styleParseError) {
        console.error('스타일 적용 JSON 파싱 오류:', styleParseError);
        console.error('원본 응답:', styleText);

        // 스타일 적용 실패 시 1단계 결과 반환
        return NextResponse.json({
          success: true,
          videoTitle: videoTitle,
          thumbnailUrl: metadata.thumbnailUrl,
          transcript: cleanedTranscript,
          authorStyle: authorStyle,
          summary: parsedSummary, // 1단계 요약 결과 반환
          styleError: '스타일 적용 중 오류가 발생했습니다. 기본 요약을 반환합니다.',
        });
      }
    } catch (summaryParseError) {
      console.error('요약 JSON 파싱 오류:', summaryParseError);
      console.error('원본 응답:', summaryText);

      return NextResponse.json(
        {
          error: 'JSON 파싱 오류, 다시 시도해주세요.',
          rawResponse: summaryText,
        },
        { status: 422 }
      );
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
