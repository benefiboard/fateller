//app/utils/content-source-manager.ts

import { createSupabaseServerClient } from '@/lib/supabse/server';
import { normalizeUrl, detectUrlType } from './url-normalizer';

// 콘텐츠 소스 조회 또는 생성 함수
export async function getOrCreateContentSource(originalUrl: string) {
  const supabase = await createSupabaseServerClient();

  // URL 정규화
  const canonicalUrl = normalizeUrl(originalUrl);

  console.log(`URL 정규화: ${originalUrl} → ${canonicalUrl}`);

  // 이미 존재하는 소스 조회
  const { data: existingSource, error: sourceError } = await supabase
    .from('content_sources')
    .select('*')
    .eq('canonical_url', canonicalUrl)
    .single();

  // 기존 소스가 있으면 접근 카운트 증가 후 반환
  if (existingSource && !sourceError) {
    console.log(`기존 소스 발견 (ID: ${existingSource.id}), 접근 카운트 증가`);

    // 접근 카운트 증가 및 업데이트 시간 갱신
    await supabase
      .from('content_sources')
      .update({
        access_count: existingSource.access_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSource.id);

    return {
      existingSource: true,
      source: existingSource,
    };
  }

  // 기존 소스가 없으면 null 반환 (실제 추출은 API에서 수행)
  return {
    existingSource: false,
    canonicalUrl,
  };
}

// 콘텐츠 소스 저장 함수
export async function saveContentSource(sourceData: any) {
  const supabase = await createSupabaseServerClient();

  const { data: newSource, error } = await supabase
    .from('content_sources')
    .insert({
      canonical_url: sourceData.canonicalUrl,
      source_type: sourceData.sourceType,
      content: sourceData.content,
      title: sourceData.title || null,
      image_url: sourceData.imageUrl || null,
      access_count: 1,
    })
    .select()
    .single();

  if (error) {
    console.error('콘텐츠 소스 저장 오류:', error);
    throw new Error(`콘텐츠 소스 저장 실패: ${error.message}`);
  }

  return newSource;
}
