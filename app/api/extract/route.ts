import { NextRequest, NextResponse } from 'next/server';
import { detectLanguage } from './language-detector';
import {
  splitIntoSentences,
  calculateWordFrequency,
  calculateSentenceImportance,
  calculatePositionScore,
  calculateSignalPhraseScore,
} from './text-processor';

type RequestData = {
  text: string;
  extractionRate?: number; // 추출할 비율 (0.3 = 30%)
};

type ResponseData = {
  extractedText: string;
  originalLength: number;
  extractedLength: number;
  reductionRate: number;
  detectedLanguage: string;
};

/**
 * 텍스트에서 중요 문장을 추출하는 API 라우트
 */
export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as RequestData;
    const { text, extractionRate = 0.3 } = data;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // 1. 언어 감지
    const detectedLanguage = detectLanguage(text);
    console.log(`Detected language: ${detectedLanguage}`);

    // 2. 텍스트를 문장으로 분리
    const sentences = splitIntoSentences(text, detectedLanguage);
    console.log(`Extracted ${sentences.length} sentences`);

    if (sentences.length === 0) {
      // 문장 추출 실패 시 전체 텍스트 반환
      return NextResponse.json({
        extractedText: text,
        originalLength: text.length,
        extractedLength: text.length,
        reductionRate: 0,
        detectedLanguage: detectedLanguage,
      } as ResponseData);
    }

    // 3. 각 문장에 점수 부여
    const scoredSentences = calculateSentenceScores(sentences, detectedLanguage);

    // 4. 상위 N% 문장 선택
    const topSentencesCount = Math.max(1, Math.ceil(sentences.length * extractionRate));
    const topSentences = [...scoredSentences]
      .sort((a, b) => b.score - a.score)
      .slice(0, topSentencesCount);

    // 5. 원래 순서대로 재정렬
    const extractedSentences = [...topSentences]
      .sort((a, b) => a.position - b.position)
      .map((s) => s.text);

    // 적절한 구분자로 결합
    const extractedText = extractedSentences.join(' ');

    // 6. 결과 반환
    return NextResponse.json({
      extractedText,
      originalLength: text.length,
      extractedLength: extractedText.length,
      reductionRate: (1 - extractedText.length / text.length) * 100,
      detectedLanguage: detectedLanguage,
    } as ResponseData);
  } catch (error) {
    console.error('Error extracting important text:', error);
    return NextResponse.json({ error: 'Failed to process text' }, { status: 500 });
  }
}

/**
 * 문장에 점수를 부여하는 함수
 */
function calculateSentenceScores(sentences: string[], language: ReturnType<typeof detectLanguage>) {
  // 모든 단어의 빈도수 계산
  const allText = sentences.join(' ');
  const wordFrequency = calculateWordFrequency(allText, language);

  // 각 문장에 점수 부여
  return sentences.map((sentence, index) => {
    const score = calculateSentenceScore(
      sentence,
      wordFrequency,
      index,
      sentences.length,
      language
    );
    return {
      text: sentence.trim(),
      score,
      position: index,
    };
  });
}

/**
 * 문장 점수 계산
 */
function calculateSentenceScore(
  sentence: string,
  wordFrequency: Record<string, number>,
  position: number,
  totalSentences: number,
  language: ReturnType<typeof detectLanguage>
) {
  // 1. 단어 빈도 기반 점수
  const frequencyScore = calculateSentenceImportance(sentence, wordFrequency, language);

  // 2. 위치 기반 가중치
  const positionScore = calculatePositionScore(position, totalSentences);

  // 3. 신호 문구 기반 점수
  const signalPhraseScore = calculateSignalPhraseScore(sentence, language);

  // 최종 점수 계산 (각 요소별 가중치는 조정 가능)
  return frequencyScore * 0.6 + positionScore * 0.3 + signalPhraseScore * 0.1;
}
