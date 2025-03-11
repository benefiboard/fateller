//app/utils/summary-manager.ts

import { createSupabaseServerClient } from '@/lib/supabse/server';

// 요약 조회 또는 생성 준비 함수
export async function getContentSummary(sourceId: string, purpose: string = '일반') {
  const supabase = await createSupabaseServerClient();

  // 기존 요약 조회
  const { data: existingSummary, error: summaryError } = await supabase
    .from('content_summaries')
    .select('*')
    .eq('source_id', sourceId)
    .eq('purpose', purpose)
    .single();

  // 기존 요약이 있으면 반환
  if (existingSummary && !summaryError) {
    console.log(`기존 요약 발견 (ID: ${existingSummary.id}), 캐시 활용`);
    return {
      existingSummary: true,
      summary: existingSummary,
    };
  }

  // 기존 요약이 없으면 소스 정보 조회
  const { data: sourceData, error: sourceError } = await supabase
    .from('content_sources')
    .select('*')
    .eq('id', sourceId)
    .single();

  if (sourceError || !sourceData) {
    console.error('소스 정보 조회 오류:', sourceError);
    throw new Error('요약할 콘텐츠 소스를 찾을 수 없습니다');
  }

  // 요약 생성이 필요함을 알리는 결과 반환
  return {
    existingSummary: false,
    source: sourceData,
    purpose,
  };
}

// 요약 결과 저장 함수
export async function saveSummary(summaryData: any) {
  const supabase = await createSupabaseServerClient();

  const { data: newSummary, error } = await supabase
    .from('content_summaries')
    .insert({
      source_id: summaryData.sourceId,
      purpose: summaryData.purpose,
      title: summaryData.title,
      tweet_main: summaryData.tweetMain,
      hashtags: summaryData.hashtags || [],
      thread: summaryData.thread || [],
      category: summaryData.category || '미분류',
      keywords: summaryData.keywords || [],
      key_sentence: summaryData.keySentence || '',
      embedding_id: summaryData.embeddingId || null,
    })
    .select()
    .single();

  if (error) {
    console.error('요약 저장 오류:', error);
    throw new Error(`요약 저장 실패: ${error.message}`);
  }

  return newSummary;
}
