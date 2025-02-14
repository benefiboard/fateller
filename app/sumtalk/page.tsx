'use client';

import { useState, useEffect } from 'react';
import OpenAI from 'openai';
import createSupabaseBrowserClient from '@/lib/supabse/client';

interface SearchResult {
  id: string;
  content: string;
  similarity: number;
}

interface FormattedResult {
  id: string;
  content: string;
  similarity?: number;
  type: 'summary' | 'result';
}

const supabase = createSupabaseBrowserClient();

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true,
});

export default function SumTalk() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FormattedResult[]>([]);
  const [loading, setLoading] = useState(false);

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
                '당신은 자연어 분석 전문가입니다. 메시지의 컨텍스트와 의미를 정확하게 파악해주세요.',
            },
            {
              role: 'user',
              content: `다음 메시지를 분석하여 JSON 형식으로 응답해주세요:
             메시지: ${content}
             
             다음 형식으로 응답해주세요:
             {
               "category": "메시지의 카테고리",
               "tags": ["관련 키워드나 태그들"],
               "summary": "메시지의 요약",
               "sentiment": "감정 분석 결과"
             }`,
            },
          ],
          max_tokens: 1000,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) throw new Error('GPT API 요청 실패');

      const data = await response.json();
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
      // 1. GPT-4로 메시지 분석
      const analysis = await analyzeMessage(message);

      // 2. 메시지 저장
      const { data: messageData, error: messageError } = await supabase
        .from('messages_t')
        .insert([
          {
            content: message,
            analysis: analysis,
          },
        ])
        .select()
        .single();

      if (messageError) throw messageError;

      // 3. 임베딩 생성 및 저장
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: message,
        encoding_format: 'float',
      });

      const { error: embeddingError } = await supabase.from('embeddings_t').insert([
        {
          message_id: messageData.id,
          embedding: embedding.data[0].embedding,
          basic_category: analysis?.category || '기본',
        },
      ]);

      if (embeddingError) throw embeddingError;

      // 4. UI 업데이트
      setMessages((prev) => [...prev, { ...messageData, analysis }]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 지능형 검색
  const handleSearch = async () => {
    setLoading(true);
    try {
      // 1. GPT-4로 검색 의도 파악
      const searchIntentResult = await fetch('https://api.openai.com/v1/chat/completions', {
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
                '당신은 검색 의도 분석 전문가입니다. 사용자의 검색 의도를 정확하게 파악해주세요.',
            },
            {
              role: 'user',
              content: `다음 검색어의 의도를 분석하여 JSON 형식으로 응답해주세요:
             검색어: ${searchQuery}
             
             다음 형식으로 응답해주세요:
             {
               "intent": "검색 의도",
               "keywords": ["핵심 키워드"],
               "context": "검색 컨텍스트"
             }`,
            },
          ],
          max_tokens: 1000,
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      });

      const intentData = await searchIntentResult.json();
      const intentAnalysis = JSON.parse(intentData.choices[0].message.content);
      console.log('Search Intent:', intentAnalysis);

      // 2. 검색어 임베딩
      const searchEmbedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: searchQuery,
        encoding_format: 'float',
      });

      // 3. 벡터 검색
      const { data: results, error } = await supabase.rpc('match_messages', {
        query_embedding: searchEmbedding.data[0].embedding,
        match_threshold: 0.3,
        match_count: 5,
      });

      if (error) throw error;
      console.log('Vector Search Results:', results);

      // 4. GPT-4로 검색 결과 요약
      if (results && results.length > 0) {
        const summaryResult = await fetch('https://api.openai.com/v1/chat/completions', {
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
                  '당신은 검색 결과 요약 전문가입니다. 검색 결과를 사용자가 이해하기 쉽게 요약해주세요.',
              },
              {
                role: 'user',
                content: `다음 검색 결과를 요약하여 JSON 형식으로 응답해주세요:
               검색어: ${searchQuery}
               검색결과: ${JSON.stringify(results)}
               
               다음 형식으로 응답해주세요:
               {
                 "summary": "검색 결과 요약",
                 "highlights": ["주요 포인트"],
                 "suggestion": "추가 검색 제안"
               }`,
              },
            ],
            max_tokens: 1000,
            temperature: 0.2,
            response_format: { type: 'json_object' },
          }),
        });

        const summaryData = await summaryResult.json();
        const summaryAnalysis = JSON.parse(summaryData.choices[0].message.content);
        console.log('Summary Analysis:', summaryAnalysis);

        const formattedResults = [
          {
            id: 'summary',
            content: summaryAnalysis.summary,
            type: 'summary',
          },
          ...results.map((result: SearchResult) => ({
            id: result.id,
            content: result.content,
            similarity: result.similarity,
            type: 'result',
          })),
        ];

        console.log('Formatted Results:', formattedResults);
        setSearchResults(formattedResults);
      } else {
        setSearchResults([]);
      }
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
            <div>{msg.content}</div>
            {msg.analysis && (
              <div className="mt-1 text-sm text-gray-600">
                <div>카테고리: {msg.analysis.category}</div>
                <div>태그: {msg.analysis.tags.join(', ')}</div>
                <div>감정: {msg.analysis.sentiment}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 검색 결과 */}
      <div>
        <h2 className="text-xl font-bold mb-2">검색 결과</h2>
        {searchResults.length > 0 ? (
          searchResults.map((result) => (
            <div
              key={result.id}
              className={`p-4 mb-2 rounded-lg ${
                result.type === 'summary'
                  ? 'bg-violet-50 border border-violet-200'
                  : 'border border-gray-200'
              }`}
            >
              {result.type === 'summary' ? (
                <>
                  <h3 className="font-semibold mb-2">요약</h3>
                  <div>{result.content}</div>
                </>
              ) : (
                <>
                  <div className="text-gray-700">{result.content}</div>
                  {result.similarity && (
                    <div className="text-sm text-gray-500 mt-1">
                      유사도: {Math.round(result.similarity * 100)}%
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-gray-500 text-center p-4">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
}
