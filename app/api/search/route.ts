//app/api/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabse/server';

export async function POST(request: NextRequest) {
  try {
    const { query, user_id } = await request.json();
    const supabase = await createSupabaseServerClient();

    // 검색 임베딩 생성
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error('임베딩 생성 실패');
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // 1. 사용자 메모에서 개별 임베딩 검색
    const { data: userMemoResults } = await supabase.rpc('search_memos', {
      query_embedding: embedding,
      similarity_threshold: 0.7,
      match_count: 5,
      user_id_filter: user_id,
    });

    // 2. content_summaries 테이블에서 공유 임베딩 검색
    const { data: summaryResults } = await supabase.rpc('search_content_summaries', {
      query_embedding: embedding,
      similarity_threshold: 0.7,
      match_count: 5,
    });

    // 3. 공유 임베딩 검색 결과로 사용자 메모 찾기
    let relatedMemos = [];
    if (summaryResults && summaryResults.length > 0) {
      // 검색된 요약에서 소스 ID 추출
      const sourceIds = summaryResults.map((item: any) => item.source_id).filter(Boolean);

      if (sourceIds.length > 0) {
        // 사용자가 해당 소스를 참조하는 메모 검색
        const { data: relatedMemoData } = await supabase
          .from('memos')
          .select('*')
          .in('source_id', sourceIds)
          .eq('user_id', user_id);

        if (relatedMemoData) {
          relatedMemos = relatedMemoData;
        }
      }
    }

    // 4. 결과 합치기 및 중복 제거
    const combinedResults = [...(userMemoResults || []), ...relatedMemos];
    const uniqueResults = combinedResults.filter(
      (memo, index, self) => index === self.findIndex((m) => m.id === memo.id)
    );

    // 5. 결과 반환
    return NextResponse.json({ results: uniqueResults });
  } catch (error) {
    console.error('검색 오류:', error);
    return NextResponse.json({ error: '검색 중 오류가 발생했습니다' }, { status: 500 });
  }
}
