//app/utils/embedding-manager.ts

import { createSupabaseServerClient } from '@/lib/supabse/server';

// 임베딩 생성 함수
export async function createEmbedding(textData: any) {
  try {
    // 임베딩 생성할 텍스트 준비
    const textToEmbed = [
      textData.title,
      typeof textData.tweetMain === 'object'
        ? JSON.stringify(textData.tweetMain)
        : textData.tweetMain,
      textData.keySentence,
      ...(Array.isArray(textData.thread) ? textData.thread : []),
      ...(Array.isArray(textData.keywords) ? textData.keywords : []),
    ]
      .filter(Boolean)
      .join(' ');

    if (!textToEmbed.trim()) {
      throw new Error('임베딩할 텍스트가 없습니다');
    }

    // OpenAI API로 임베딩 생성
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: textToEmbed.slice(0, 8000), // 입력 제한
      }),
    });

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.json();
      throw new Error(`임베딩 API 오류: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Supabase에 임베딩 저장
    const supabase = await createSupabaseServerClient();
    const { data: newEmbedding, error } = await supabase
      .from('memo_embeddings')
      .insert({
        embedding,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`임베딩 저장 오류: ${error.message}`);
    }

    return newEmbedding.id;
  } catch (error) {
    console.error('임베딩 생성 오류:', error);
    throw error;
  }
}

// 요약에 임베딩 연결 함수
export async function linkEmbeddingToSummary(summaryId: any, embeddingId: any) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('content_summaries')
    .update({ embedding_id: embeddingId })
    .eq('id', summaryId);

  if (error) {
    console.error('임베딩 연결 오류:', error);
    throw new Error(`임베딩 연결 실패: ${error.message}`);
  }

  return true;
}
