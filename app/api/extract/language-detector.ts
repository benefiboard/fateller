/**
 * 텍스트 언어 감지를 위한 유틸리티 함수
 */

/**
 * 한국어 문자 범위 (유니코드 블록)
 * - 한글 완성형: 가-힣 (AC00-D7A3)
 * - 한글 자모: ㄱ-ㅎ, ㅏ-ㅣ (1100-11FF, 3130-318F)
 */
const KOREAN_CHAR_REGEX = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/;

/**
 * 영어 문자 범위
 */
const ENGLISH_CHAR_REGEX = /[a-zA-Z]/;

/**
 * 언어 감지 결과 타입
 */
export type DetectedLanguage = 'korean' | 'english' | 'mixed' | 'unknown';

/**
 * 간단한 언어 감지 함수
 *
 * @param text 감지할 텍스트
 * @returns 감지된 언어 (korean, english, mixed, unknown)
 */
export function detectLanguage(text: string): DetectedLanguage {
  // 샘플링을 위한 최대 문자 수
  const MAX_SAMPLE_SIZE = 1000;

  // 빈 텍스트 체크
  if (!text || text.trim().length === 0) {
    return 'unknown';
  }

  // 텍스트 샘플링 (긴 텍스트의 경우 일부만 분석)
  const sample =
    text.length > MAX_SAMPLE_SIZE
      ? text.substring(0, MAX_SAMPLE_SIZE / 2) + text.substring(text.length - MAX_SAMPLE_SIZE / 2)
      : text;

  // 한글, 영어 문자 카운트
  let koreanCharCount = 0;
  let englishCharCount = 0;

  // 문자별 언어 카운트
  for (const char of sample) {
    if (KOREAN_CHAR_REGEX.test(char)) {
      koreanCharCount++;
    } else if (ENGLISH_CHAR_REGEX.test(char)) {
      englishCharCount++;
    }
  }

  // 의미 있는 문자 총합
  const meaningfulChars = koreanCharCount + englishCharCount;

  // 문자가 너무 적으면 알 수 없음
  if (meaningfulChars < 10) {
    return 'unknown';
  }

  // 언어 비율 계산
  const koreanRatio = koreanCharCount / meaningfulChars;
  const englishRatio = englishCharCount / meaningfulChars;

  // 임계값 - 한 언어가 70% 이상이면 해당 언어로 판단
  if (koreanRatio >= 0.7) {
    return 'korean';
  } else if (englishRatio >= 0.7) {
    return 'english';
  } else if (koreanRatio + englishRatio >= 0.8) {
    return 'mixed';
  } else {
    return 'unknown';
  }
}
