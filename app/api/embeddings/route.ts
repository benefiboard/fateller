// app/api/embeddings/route.ts
import { createSupabaseServerClient } from '@/lib/supabse/server';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { memo_id } = await request.json();

    if (!memo_id) {
      return NextResponse.json({ error: '메모 ID가 필요합니다' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // 메모 데이터 가져오기
    const { data: memo, error: memoError } = await supabase
      .from('memos')
      .select('title, tweet_main, thread, category, keywords, key_sentence')
      .eq('id', memo_id)
      .single();

    if (memoError) {
      console.error('메모 데이터 조회 오류:', memoError);
      return NextResponse.json({ error: '메모를 찾을 수 없습니다' }, { status: 404 });
    }

    // 임베딩에 사용할 텍스트 생성 (요약 정보 조합)
    const textToEmbed = [
      memo.title,
      memo.tweet_main,
      memo.key_sentence,
      ...memo.thread,
      ...(memo.keywords || []),
    ]
      .filter(Boolean)
      .join(' ');

    if (!textToEmbed.trim()) {
      return NextResponse.json({ error: '임베딩할 텍스트가 없습니다' }, { status: 400 });
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
        input: textToEmbed.slice(0, 8000), // 입력 길이 제한 (필요시 조정)
      }),
    });

    if (!embeddingResponse.ok) {
      const errorData = await embeddingResponse.json();
      console.error('OpenAI 임베딩 API 오류:', errorData);
      return NextResponse.json(
        { error: `임베딩 생성 실패: ${errorData.error?.message || '알 수 없는 오류'}` },
        { status: embeddingResponse.status }
      );
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Supabase에 임베딩 저장 (upsert 사용하여 기존 데이터 업데이트)
    const { error: upsertError } = await supabase.from('memo_embeddings').upsert(
      {
        id: memo_id,
        embedding,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (upsertError) {
      console.error('임베딩 저장 오류:', upsertError);
      return NextResponse.json({ error: '임베딩 저장 실패' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      memo_id,
      vector_dimensions: embedding.length,
    });
  } catch (error: any) {
    console.error('임베딩 처리 중 오류:', error);
    return NextResponse.json({ error: `임베딩 처리 실패: ${error.message}` }, { status: 500 });
  }
}
