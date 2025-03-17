'use client';

import createSupabaseBrowserClient from '@/lib/supabse/client';
import { useState } from 'react';

// 코사인 유사도 계산 함수
function calculateCosineSimilarity(vecA: any, vecB: any): number {
  // 벡터 형식 확인 및 변환
  const arrayA = Array.isArray(vecA) ? vecA : typeof vecA === 'string' ? JSON.parse(vecA) : null;
  const arrayB = Array.isArray(vecB) ? vecB : typeof vecB === 'string' ? JSON.parse(vecB) : null;

  // 벡터 유효성 검사
  if (!arrayA || !arrayB) {
    console.error('유효하지 않은 벡터 형식:', { vecA, vecB });
    return 0;
  }

  // 벡터 길이 검사
  if (arrayA.length !== arrayB.length) {
    console.warn(`벡터 길이 불일치: A(${arrayA.length}) vs B(${arrayB.length})`);
    // 더 짧은 벡터 길이로 계산
    const minLength = Math.min(arrayA.length, arrayB.length);

    // 길이가 너무 다르면 유사도 0으로 처리
    if (Math.abs(arrayA.length - arrayB.length) > 10) {
      return 0;
    }

    // 더 짧은 벡터 길이로 계산
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < minLength; i++) {
      dotProduct += arrayA[i] * arrayB[i];
      normA += arrayA[i] * arrayA[i];
      normB += arrayB[i] * arrayB[i];
    }

    // 제로 벡터 체크
    if (normA === 0 || normB === 0) {
      return 0;
    }

    // 코사인 유사도 계산
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // 통상적인 경우: 동일한 길이의 벡터
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < arrayA.length; i++) {
    dotProduct += arrayA[i] * arrayB[i];
    normA += arrayA[i] * arrayA[i];
    normB += arrayB[i] * arrayB[i];
  }

  // 제로 벡터 체크
  if (normA === 0 || normB === 0) {
    return 0;
  }

  // 코사인 유사도 계산
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export default function BasicSearch() {
  const [memoId, setMemoId] = useState('');
  const [results, setResults] = useState<Array<{ id: string; title: string; similarity: number }>>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 타입 정의 추가
  interface SimilarityResult {
    embedding_id: string;
    similarity: number;
  }

  const supabase = createSupabaseBrowserClient();

  const handleSearch = async () => {
    if (!memoId) {
      setError('메모 ID를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      // 1단계: 검색할 메모의 embedding_id 가져오기
      const { data: memoData, error: memoError } = await supabase
        .from('memos')
        .select('embedding_id')
        .eq('id', memoId)
        .limit(1)
        .single();

      if (memoError) {
        throw new Error(`메모를 찾을 수 없습니다: ${memoError.message}`);
      }

      if (!memoData?.embedding_id) {
        throw new Error('이 메모에 연결된 임베딩이 없습니다');
      }

      // 2단계: embedding_id를 사용하여 source_embeddings 테이블에서 실제 임베딩 가져오기
      const { data: queryEmbedding, error: embeddingError } = await supabase
        .from('source_embeddings')
        .select('id, embedding')
        .eq('id', memoData.embedding_id)
        .limit(1)
        .single();

      if (embeddingError) {
        throw new Error(`임베딩 데이터를 찾을 수 없습니다: ${embeddingError.message}`);
      }

      if (!queryEmbedding?.embedding) {
        throw new Error('임베딩 데이터가 비어 있습니다');
      }

      // 3단계: 모든 임베딩 가져오기
      const { data: allEmbeddings, error: allEmbeddingsError } = await supabase
        .from('source_embeddings')
        .select('id, embedding');

      if (allEmbeddingsError) {
        throw new Error(`임베딩 목록 조회 오류: ${allEmbeddingsError.message}`);
      }

      // 임베딩 디버깅 - 쿼리 벡터 구조 확인
      console.log('쿼리 임베딩 정보:', {
        id: queryEmbedding.id,
        type: typeof queryEmbedding.embedding,
        isArray: Array.isArray(queryEmbedding.embedding),
        length: Array.isArray(queryEmbedding.embedding)
          ? queryEmbedding.embedding.length
          : typeof queryEmbedding.embedding === 'string'
          ? JSON.parse(queryEmbedding.embedding).length
          : 'unknown',
      });

      // 4단계: 각 임베딩과의 유사도 계산
      const similarityResults = allEmbeddings
        .filter((item) => item.id !== queryEmbedding.id) // 자기 자신 제외
        .map((item) => {
          try {
            // 디버깅을 위해 현재 임베딩의 형태를 확인
            const targetType = typeof item.embedding;
            const targetIsArray = Array.isArray(item.embedding);
            const targetLength = targetIsArray
              ? item.embedding.length
              : typeof item.embedding === 'string'
              ? JSON.parse(item.embedding).length
              : 'unknown';

            // 유사도 계산 전 로깅 (첫 번째와 마지막 임베딩만)
            if (
              allEmbeddings.indexOf(item) === 0 ||
              allEmbeddings.indexOf(item) === allEmbeddings.length - 1
            ) {
              console.log(`임베딩 #${item.id} 정보:`, {
                type: targetType,
                isArray: targetIsArray,
                length: targetLength,
              });
            }

            const similarity = calculateCosineSimilarity(queryEmbedding.embedding, item.embedding);

            return {
              embedding_id: item.id,
              similarity,
            };
          } catch (e) {
            console.error(`임베딩 #${item.id} 유사도 계산 오류:`, e);
            return null;
          }
        });

      // 타입 안전성을 위해 null 값 필터링을 별도 단계로 분리
      const validSimilarities: SimilarityResult[] = similarityResults
        .filter((item): item is SimilarityResult => item !== null && item.similarity >= 0.1)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3); // 상위 3개만 선택

      if (validSimilarities.length === 0) {
        setError('유사한 메모를 찾을 수 없습니다');
        return;
      }

      // 5단계: 유사한 임베딩에 연결된 메모 데이터 가져오기
      const { data: relatedMemos, error: relatedMemosError } = await supabase
        .from('memos')
        .select('id, title, embedding_id')
        .in(
          'embedding_id',
          validSimilarities.map((item) => item.embedding_id)
        );

      if (relatedMemosError) {
        throw new Error(`메모 데이터 조회 오류: ${relatedMemosError.message}`);
      }

      // 6단계: 결과 포맷팅
      const formattedResults = validSimilarities.map((similarity) => {
        // 해당 임베딩 ID를 사용하는 메모 찾기
        const memo = relatedMemos.find((m) => m.embedding_id === similarity.embedding_id);
        return {
          id: memo?.id || '',
          title: memo?.title || '제목 없음',
          similarity: similarity.similarity,
        };
      });

      setResults(formattedResults);
    } catch (err) {
      console.error('검색 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">벡터 유사도 검색</h1>

      <div className="mb-4">
        <label htmlFor="memoId" className="block text-sm font-medium mb-1">
          메모 ID 입력:
        </label>
        <div className="flex">
          <input
            id="memoId"
            type="text"
            value={memoId}
            onChange={(e) => setMemoId(e.target.value)}
            className="flex-grow p-2 border rounded-l"
            placeholder="검색할 메모의 UUID"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? '검색 중...' : '검색'}
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded mb-4">{error}</div>}

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">유사한 메모:</h2>
          <ul className="divide-y">
            {results.map((result, index) => (
              <li key={index} className="py-3">
                <p className="font-medium">{result.title}</p>
                <p className="text-sm text-gray-600">
                  유사도: {(result.similarity * 100).toFixed(2)}%
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
