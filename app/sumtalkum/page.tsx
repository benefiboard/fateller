'use client';

import { useState, useEffect } from 'react';
import OpenAI from 'openai';
import createSupabaseBrowserClient from '@/lib/supabse/client';

interface RefinedMessage {
  id: string;
  title: string;
  summary: string;
  category: string;
  keywords: string[];
}

interface SearchResult {
  id: string;
  original_content: string; // 원본 내용
  refined_title: string; // 정제된 제목
  refined_summary: string; // 정제된 요약
  similarity: number;
}

interface FormattedResult {
  id: string;
  refined_title: string;
  refined_summary: string;
  original_content: string;
  similarity: number;
}

const supabase = createSupabaseBrowserClient();

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true,
});

export default function SumTalkUm() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FormattedResult[]>([]);
  const [loading, setLoading] = useState(false);

  const now = new Date();

  // 메시지 분석 함수
  const analyzeMessage = async (content: string) => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                '당신은 제텔카스텐 전문가입니다. 사용자가 제공하는 어떤 텍스트라도 아래 형식의 제텔카스텐 노트로 변환해주세요.',
            },
            {
              role: 'user',
              content: `다음 내용을 분석하여 반드시 JSON 형식으로 응답해주세요:
              내용: ${content}

제목 : [내용의 핵심을 직관적인 제목으로 요약 + 최대한 간결하고 명확]
Tag : [#핵심키워드 형식으로 3-5개]
요약 : [입력 텍스트의 핵심 아이디어를 정리한 내용]
카테고리 : [자료의 출처 정보]
==========

규칙:
2. 입력 내용의 핵심을 직관적인 제목으로 요약 + 최대한 간결하고 명확하게 작성
3. Tag는 반드시 #으로 시작하며 핵심 개념만 추출
4. 요약은 명확하고 간결하게 정리
5. 출처는 가능한 자세히 기록

예시 입력:
"창의성은 기존의 정보를 새로운 맥락에서 재해석하는 능력이다. - 김정운 교수"

예시 출력:
==========
"title" : 창의성은 기존 정보를 재해석하고 연결하는 것
"keywords" : [#창의성 #정보 #맥락]
"summary" : 창의성은 완전히 새로운 것을 만드는 것이 아니라, 기존 정보를 새로운 맥락에서 재해석하고 연결하는 능력이다.
"category" : 김정운 교수
==========`,
            },
          ],
          //           messages: [
          //             {
          //               role: 'system',
          //               content:
          //                 '당신은 제텔카스텐 방식의 노트 작성을 도와주는 AI입니다.유저가 짧고 단순한 메모를 입력하면, 이를 체계적인 제텔카스텐 카드의 내용으로 변환해. ',
          //             },
          //             {
          //               role: 'user',
          //               content: `다음 내용을 분석하여 반드시 JSON 형식으로 응답해주세요:
          //               내용: ${content}

          //               0.id생성은 ${now.toISOString()} 을 사용해
          //               1제목 생성:
          //    - 입력 내용의 핵심을 직관적인 제목으로 요약해.
          //    - 최대한 간결하고 명확하게 작성해.
          // 2️.내용 확장:
          //    - 입력 텍스트의 핵심 아이디어를 정리한 내용 생각은 명확하고 간결하게 정리.
          //    - 맥락이나 상황을 파악할수 있으면 내용에 간단하게 넣어.
          // 3.핵심 태그 자동 추출:
          //    - 주요 키워드를 자동으로 태그 형태(#)로 정리해.
          //    - 3~5개 태그를 생성해.
          // 4.질문 확장:
          //    - 유저가 생각을 확장할 수 있도록 최소 2개 이상의 질문을 생성해.
          //    - 질문은 "왜?", "어떻게?" 등의 형식으로 작성해.
          // 5.출처 처리:
          //    - 출처는 가능한 자세히 기록
          // 6.JSON 형식의 출력:
          //    - 아래 형식에 맞춰 JSON으로 변환해.

          //               응답 형식:
          //               {
          //   "id": "YYYYMMDD-HHMM",
          //   "title": "제목",
          //   "content": "입력 텍스트의 핵심 아이디어를 정리한 내용",
          //   "tags": "#핵심키워드 형식으로 3-5개",
          //   "questions": [
          //     "질문 1",
          //     "질문 2"
          //   ],
          //   "source": "출처 정보"
          // }`,
          //             },
          //           ],
          max_tokens: 1000,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) throw new Error('GPT API 요청 실패');

      const data = await response.json();
      console.log('GPT 카드 분석 결과:', data);
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error('GPT 분석 중 오류:', error);
      throw error;
    }
  };

  // 메시지 저장 및 분석
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 원본 메시지 저장
      const { data: originalMessage, error: messageError } = await supabase
        .from('messages_um')
        .insert([{ content: message }])
        .select()
        .single();

      if (messageError) throw messageError;

      // 2. GPT-4로 메시지 분석
      const refinedContent = await analyzeMessage(message);

      // 3. 정제된 메시지 저장
      const { error: refinedError } = await supabase.from('refined_messages_um').insert([
        {
          message_id: originalMessage.id,
          title: refinedContent.title,
          summary: refinedContent.summary,
          category: refinedContent.category,
          keywords: refinedContent.keywords,
        },
      ]);

      if (refinedError) throw refinedError;

      // 4. 임베딩 생성
      const originalEmbedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: message,
        encoding_format: 'float',
      });

      const refinedEmbedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: `
      제목: ${refinedContent.title}
      요약: ${refinedContent.summary}
      키워드: ${refinedContent.keywords.join(', ')}
      카테고리: ${refinedContent.category}
        `.trim(),
        encoding_format: 'float',
      });

      // 5. 임베딩 저장
      const { error: embeddingError } = await supabase.from('embeddings_um').insert([
        {
          message_id: originalMessage.id,
          original_embedding: originalEmbedding.data[0].embedding,
          refined_embedding: refinedEmbedding.data[0].embedding,
        },
      ]);

      if (embeddingError) throw embeddingError;

      // 6. UI 업데이트
      setMessages((prev) => [...prev, { ...originalMessage, refined: refinedContent }]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 단순화된 검색 함수
  const handleSearch = async () => {
    setLoading(true);
    try {
      console.log('1. 검색 시작:', searchQuery);

      // 1. 임베딩 생성 전 확인
      console.log('2. 임베딩 생성 시작');
      const searchEmbedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: searchQuery,
        encoding_format: 'float',
      });
      console.log('3. 임베딩 생성 완료', searchEmbedding.data[0].embedding.length);

      // 2. Supabase 함수 호출 확인
      console.log('4. Supabase 함수 호출 시작', {
        query_embedding: searchEmbedding.data[0].embedding,
        similarity_threshold: 0.1, // 이름 수정
        match_count: 5,
      });

      const { data: results, error } = await supabase.rpc('match_messages_um', {
        query_embedding: searchEmbedding.data[0].embedding,
        similarity_threshold: 0.1, // 이름 수정
        match_count: 5,
      });

      console.log('5. Supabase 결과:', results);
      console.log('6. Supabase 에러:', error);

      if (error) throw error;

      // 3. 결과 포맷팅
      const formattedResults = results.map((result: SearchResult) => ({
        id: result.id,
        original_content: result.original_content,
        refined_title: result.refined_title,
        refined_summary: result.refined_summary,
        similarity: result.similarity,
      }));

      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 메시지 입력 */}
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="메시지를 입력하세요..."
          disabled={loading}
        />
        <button
          type="submit"
          className={`mt-2 px-4 py-2 ${loading ? 'bg-gray-500' : 'bg-blue-500'} text-white rounded`}
          disabled={loading}
        >
          {loading ? '처리중...' : '전송'}
        </button>
      </form>

      {/* 검색 */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="검색어를 입력하세요..."
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          className={`mt-2 px-4 py-2 ${
            loading ? 'bg-gray-500' : 'bg-green-500'
          } text-white rounded`}
          disabled={loading}
        >
          {loading ? '검색중...' : '검색'}
        </button>
      </div>

      {/* 메시지 목록 */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">메시지 목록</h2>
        {messages.map((msg) => (
          <div key={msg.id} className="p-2 border-b">
            <div className="mb-2">{msg.content}</div>
            {msg.refined && (
              <div className="mt-1 text-sm text-gray-600">
                <div className="font-medium">{msg.refined.title}</div>
                <div>{msg.refined.summary}</div>
                <div>카테고리: {msg.refined.category}</div>
                <div>키워드: {msg.refined.keywords.join(', ')}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 검색 결과 */}
      {/* 검색 결과 */}
      <div>
        <h2 className="text-xl font-bold mb-2">검색 결과</h2>
        {searchResults.length > 0 ? (
          searchResults.map((result) => (
            <div key={result.id} className="p-4 mb-2 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">{result.refined_title}</h3>
              <div className="text-gray-700 mb-2">{result.refined_summary}</div>
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">원본 보기</summary>
                <div className="mt-2 p-2 bg-gray-50 rounded">{result.original_content}</div>
              </details>
              <div className="text-sm text-gray-500 mt-1">
                유사도: {Math.round(result.similarity * 100)}%
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center p-4">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
