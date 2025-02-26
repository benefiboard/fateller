/**
 * 한국어 기본 불용어 목록
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
 * 한국어 텍스트에서 불용어 제거
 */
export function removeKoreanStopwords(text: string): string {
  let result = text;

  // 정규식으로 불용어 제거 (단어 경계를 고려)
  koreanStopwords.forEach((stopword) => {
    const regex = new RegExp(`\\s${stopword}\\s`, 'g');
    result = result.replace(regex, ' ');
  });

  return result.replace(/\s+/g, ' ').trim();
}

/**
 * 한국어 단어 빈도 계산
 * 간단한 구현으로, 실제 프로덕션에서는 형태소 분석기 사용 권장
 */
export function getKoreanWordFrequency(text: string): Record<string, number> {
  const wordFreq: Record<string, number> = {};

  // 불용어 제거
  const cleanedText = removeKoreanStopwords(text);

  // 문장 부호와 숫자 제거하고 공백으로 단어 분리
  const words = cleanedText
    .replace(/[^\w\s가-힣]/g, '') // 한글 및 영숫자만 남김
    .split(/\s+/)
    .filter((word) => word.length > 1); // 한 글자 단어 제거

  // 각 단어 빈도 계산
  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  return wordFreq;
}

/**
 * 한국어 텍스트 중요도 산출
 */
export function calculateKoreanSentenceScore(
  sentence: string,
  wordFrequency: Record<string, number>
): number {
  // 불용어 제거
  const cleanedSentence = removeKoreanStopwords(sentence);

  // 문장을 단어로 분리
  const words = cleanedSentence
    .replace(/[^\w\s가-힣]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 1);

  // 빈도 기반 점수 계산
  let score = 0;
  words.forEach((word) => {
    score += wordFrequency[word] || 0;
  });

  // 문장 길이로 정규화
  return words.length > 0 ? score / words.length : 0;
}
