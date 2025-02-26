import { DetectedLanguage } from './language-detector';

/**
 * 한국어 불용어 목록
 */
export const koreanStopwords = [
  '이',
  '그',
  '저',
  '것',
  '이것',
  '그것',
  '저것',
  '이번',
  '그번',
  '저번',
  '나',
  '너',
  '우리',
  '저희',
  '당신',
  '그대',
  '자기',
  '자신',
  '이런',
  '그런',
  '이렇게',
  '그렇게',
  '저렇게',
  '어떤',
  '어느',
  '저런',
  '무슨',
  '무엇',
  '어디',
  '언제',
  '누구',
  '왜',
  '어떻게',
  '하다',
  '있다',
  '되다',
  '않다',
  '이다',
  '아니다',
  '들',
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '에',
  '에서',
  '으로',
  '로',
  '와',
  '과',
  '의',
  '도',
  '만',
  '뿐',
  '같이',
  '처럼',
  '대로',
  '같다',
  '그리고',
  '그러나',
  '그래서',
  '하지만',
  '또한',
  '또',
  '혹은',
  '또는',
  '한',
  '할',
  '하여',
  '한다',
  '합니다',
  '했다',
  '했습니다',
  '하겠다',
  '하겠습니다',
];

/**
 * 영어 불용어 목록
 */
export const englishStopwords = [
  'a',
  'an',
  'the',
  'and',
  'but',
  'or',
  'for',
  'nor',
  'on',
  'at',
  'to',
  'by',
  'from',
  'in',
  'out',
  'over',
  'with',
  'is',
  'am',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'shall',
  'should',
  'may',
  'might',
  'must',
  'can',
  'could',
  'of',
  'that',
  'which',
  'who',
  'whom',
  'whose',
  'this',
  'these',
  'those',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'its',
  'our',
  'their',
  'mine',
  'yours',
  'hers',
  'ours',
  'theirs',
  'what',
  'when',
  'where',
  'why',
  'how',
  'if',
  'then',
  'so',
  'than',
  'as',
];

/**
 * 텍스트에서 불용어 제거
 */
export function removeStopwords(text: string, language: DetectedLanguage): string {
  let result = text;
  let stopwords: string[] = [];

  // 언어에 따라 적절한 불용어 목록 선택
  if (language === 'korean' || language === 'mixed') {
    stopwords = stopwords.concat(koreanStopwords);
  }

  if (language === 'english' || language === 'mixed') {
    stopwords = stopwords.concat(englishStopwords);
  }

  // 불용어 제거 (공백 기준으로 단어 구분)
  stopwords.forEach((stopword) => {
    const regex = new RegExp(`\\b${stopword}\\b`, 'gi');
    result = result.replace(regex, '');
  });

  // 여러 공백을 하나로 통합
  return result.replace(/\s+/g, ' ').trim();
}

/**
 * 단어 빈도 계산
 */
export function calculateWordFrequency(
  text: string,
  language: DetectedLanguage
): Record<string, number> {
  const wordFreq: Record<string, number> = {};

  // 불용어 제거
  const cleanedText = removeStopwords(text, language);

  // 한국어는 공백으로 단어 분리 (간단한 구현)
  // 더 정확한 한국어 처리는 형태소 분석이 필요함
  let words: string[] = [];

  if (language === 'korean') {
    // 한국어 단어 추출 (2글자 이상)
    words = cleanedText
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1 && /[가-힣]/.test(word));
  } else if (language === 'mixed') {
    // 혼합 언어 단어 추출
    words = cleanedText
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1);
  } else {
    // 영어 단어 추출
    words = cleanedText
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1);
  }

  // 단어 빈도 계산
  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return wordFreq;
}

/**
 * 문장 점수 계산
 */
export function calculateSentenceImportance(
  sentence: string,
  wordFrequency: Record<string, number>,
  language: DetectedLanguage
): number {
  // 불용어 제거
  const cleanedSentence = removeStopwords(sentence, language);

  // 문장을 단어로 분리
  let words: string[] = [];

  if (language === 'korean') {
    // 한국어 단어 추출
    words = cleanedSentence
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1 && /[가-힣]/.test(word));
  } else if (language === 'mixed') {
    // 혼합 언어 단어 추출
    words = cleanedSentence
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1);
  } else {
    // 영어 단어 추출
    words = cleanedSentence
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 1);
  }

  // 빈도 기반 점수 계산
  let score = 0;
  words.forEach((word) => {
    score += wordFrequency[word] || 0;
  });

  // 문장 길이로 정규화
  return words.length > 0 ? score / words.length : 0;
}

/**
 * 문장 위치 기반 점수 계산
 */
export function calculatePositionScore(position: number, totalSentences: number): number {
  // 처음과 마지막 부분의 문장들에 더 높은 점수 부여
  if (position < totalSentences * 0.2) {
    // 첫 20%의 문장
    return 1 - position / (totalSentences * 0.2);
  } else if (position > totalSentences * 0.8) {
    // 마지막 20%의 문장
    return (position - totalSentences * 0.8) / (totalSentences * 0.2);
  }

  // 중간 부분은 낮은 점수
  return 0.3;
}

/**
 * 신호 문구 기반 점수 계산
 */
export function calculateSignalPhraseScore(sentence: string, language: DetectedLanguage): number {
  // 한국어 신호 문구
  const koreanSignalPhrases = [
    '중요',
    '핵심',
    '요약',
    '결론',
    '따라서',
    '그러므로',
    '결과적으로',
    '요점',
    '중심',
    '핵심적',
    '주요',
    '필수',
    '중대한',
    '결정적',
    '특히',
    '가장',
    '반드시',
    '꼭',
    '명심',
    '필히',
    '무조건',
    '주목',
    '집중',
    '강조',
    '확실',
    '분명',
    '당연',
    '틀림없이',
  ];

  // 영어 신호 문구
  const englishSignalPhrases = [
    'important',
    'key',
    'summary',
    'conclusion',
    'therefore',
    'thus',
    'consequently',
    'essential',
    'critical',
    'significant',
    'crucial',
    'vital',
    'main',
    'major',
    'highlight',
    'emphasis',
    'focus',
    'note',
    'remember',
    'notably',
    'specifically',
    'particularly',
    'especially',
    'fundamentally',
    'primarily',
    'basically',
    'central',
    'foremost',
    'paramount',
    'in conclusion',
    'to summarize',
    'in summary',
  ];

  const lowerSentence = sentence.toLowerCase();
  let signalPhrases: string[] = [];

  // 언어에 따라 적절한 신호 문구 목록 선택
  if (language === 'korean' || language === 'mixed') {
    signalPhrases = signalPhrases.concat(koreanSignalPhrases);
  }

  if (language === 'english' || language === 'mixed') {
    signalPhrases = signalPhrases.concat(englishSignalPhrases);
  }

  // 신호 문구 포함 여부 확인
  for (const phrase of signalPhrases) {
    if (lowerSentence.includes(phrase.toLowerCase())) {
      return 1.0;
    }
  }

  return 0.0;
}

/**
 * 문장 분리 함수 (개선된 버전)
 */
export function splitIntoSentences(text: string, language: DetectedLanguage): string[] {
  // 줄바꿈 기호를 마침표로 임시 변환 (한국어 문장 인식 개선용)
  const normalizedText = text.replace(/\n+/g, '. ');

  // 한국어와 영어 문장 종결 패턴
  let sentences: string[] = [];

  // 1. 일반적인 문장 종결 부호로 구분
  if (language === 'korean' || language === 'mixed') {
    // 한국어 문장 종결 (마침표, 물음표, 느낌표, 말줄임표, 한글 마침표 등)
    sentences = normalizedText.match(/[^.!?…。]+[.!?…。]+/g) || [];
  } else {
    // 영어 문장 종결
    sentences = normalizedText.match(/[^.!?]+[.!?]+/g) || [];
  }

  // 2. 문장이 하나도 추출되지 않았을 경우 대체 방법
  if (sentences.length === 0) {
    // 2-1. 문단 단위로 나누기 (줄바꿈 2번 이상으로 구분)
    sentences = normalizedText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);

    // 2-2. 그래도 없으면 임의로 문장 분리 (일정 길이마다)
    if (sentences.length === 0) {
      const MAX_SENTENCE_LENGTH = 100; // 최대 문장 길이 설정
      for (let i = 0; i < normalizedText.length; i += MAX_SENTENCE_LENGTH) {
        const sentenceChunk = normalizedText.substring(i, i + MAX_SENTENCE_LENGTH);
        if (sentenceChunk.trim().length > 0) {
          sentences.push(sentenceChunk);
        }
      }
    }
  }

  // 3. 빈 문장 제거 및 공백 정리
  return sentences.map((s) => s.trim()).filter((s) => s.length > 0);
}
