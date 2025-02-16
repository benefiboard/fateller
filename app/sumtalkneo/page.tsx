'use client';

import { useState, useEffect } from 'react';
import OpenAI from 'openai';
import createSupabaseBrowserClient from '@/lib/supabse/client';

interface AnalyzedContent {
  keywords: string[];
  key_sentences: string[];
  theme: string;
  title: string;
  body: string[];
}

interface SearchResult {
  id: string;
  original_content: string;
  analysis_content: AnalyzedContent;
  similarity: number;
}

interface FormattedResult {
  id: string;
  original_content: string;
  analysis_content: AnalyzedContent;
  similarity: number;
}

const supabase = createSupabaseBrowserClient();

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true,
});

export default function SumTalkNeo() {
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
                '당신은 텍스트를 요약하는 전문가입니다. 아래 단계를 따라 텍스트를 요약하고 JSON 형식으로 출력해주세요.',
            },
            {
              role: 'user',
              content: `다음 내용을 분석하여 JSON 형식으로 응답해주세요:
              내용: ${content}
              
              분석 규칙:
              1. 본질 파악
              - 글의 근원적 주장을 한 문장으로 정의
              - 구체적 사실들에서 공통분모를 찾기
              - 전체 내용을 하나의 그림으로 표현
              
              2. 정보 정제
              - 불필요한 내용 제거
              - 비슷한 내용은 통합
              
              3. 핵심 요소 추출
              - 중요 키워드 선별
              - 핵심문장 강조
              - 주제문 특별 표시
              
              4. 우선순위 설정
              - 중요한 것부터 배치
              - 순차적 정리

              응답 형식:
              {
                "keywords": ["핵심 단어1", "핵심 단어2", ...],
                "key_sentences": ["중요 문장1", "중요 문장2", ...],
                "theme": "글의 핵심 주제",
                "title": "직관적인 제목",
                "body": ["가장 중요한 내용", "두 번째로 중요한 내용", ...]
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
      // 1. 원본 메시지 저장
      const { data: originalMessage, error: messageError } = await supabase
        .from('messages_neo')
        .insert([{ content: message }])
        .select()
        .single();

      if (messageError) throw messageError;

      // 2. GPT-4로 메시지 분석
      const analyzedContent = await analyzeMessage(message);

      // 3. 분석된 내용 저장
      const { error: analysisError } = await supabase.from('analyzed_content_neo').insert([
        {
          message_id: originalMessage.id,
          keywords: analyzedContent.keywords,
          key_sentences: analyzedContent.key_sentences,
          theme: analyzedContent.theme,
          title: analyzedContent.title,
          body: analyzedContent.body,
        },
      ]);

      if (analysisError) throw analysisError;

      // 4. 임베딩 생성
      const originalEmbedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: message,
        encoding_format: 'float',
      });

      const analysisEmbedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: `
          제목: ${analyzedContent.title}
          주제: ${analyzedContent.theme}
          키워드: ${analyzedContent.keywords.join(', ')}
          핵심문장: ${analyzedContent.key_sentences.join(' ')}
          내용: ${analyzedContent.body.join(' ')}
        `.trim(),
        encoding_format: 'float',
      });

      // 5. 임베딩 저장
      const { error: embeddingError } = await supabase.from('embeddings_neo').insert([
        {
          message_id: originalMessage.id,
          original_embedding: originalEmbedding.data[0].embedding,
          analysis_embedding: analysisEmbedding.data[0].embedding,
        },
      ]);

      if (embeddingError) throw embeddingError;

      // 6. UI 업데이트
      setMessages((prev) => [...prev, { ...originalMessage, analyzed: analyzedContent }]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 검색 함수
  const handleSearch = async () => {
    setLoading(true);
    try {
      // 1. 검색어 분석
      const analyzedQuery = await analyzeMessage(searchQuery);

      // 2. 검색어 임베딩 생성
      const searchEmbedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: `
          제목: ${analyzedQuery.title}
          주제: ${analyzedQuery.theme}
          키워드: ${analyzedQuery.keywords.join(', ')}
          핵심문장: ${analyzedQuery.key_sentences.join(' ')}
          내용: ${analyzedQuery.body.join(' ')}
        `.trim(),
        encoding_format: 'float',
      });

      // 3. Supabase 검색 함수 호출
      const { data: results, error } = await supabase.rpc('match_analyzed_content_neo', {
        query_embedding: searchEmbedding.data[0].embedding,
        similarity_threshold: 0.1,
        match_count: 5,
      });

      if (error) throw error;

      // 4. 결과 포맷팅
      const formattedResults = results.map((result: SearchResult) => ({
        id: result.id,
        original_content: result.original_content,
        analysis_content: result.analysis_content,
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
            {msg.analyzed && (
              <div className="mt-1 text-sm text-gray-600">
                <div className="font-medium">{msg.analyzed.title}</div>
                <div className="mb-1">주제: {msg.analyzed.theme}</div>
                <div className="mb-1">키워드: {msg.analyzed.keywords.join(', ')}</div>
                <div className="mb-1">핵심 문장:</div>
                <ul className="list-disc pl-5 mb-1">
                  {msg.analyzed.key_sentences.map((sentence: string, index: number) => (
                    <li key={index}>{sentence}</li>
                  ))}
                </ul>
                <div>본문:</div>
                <ul className="list-decimal pl-5">
                  {msg.analyzed.body.map((paragraph: string, index: number) => (
                    <li key={index}>{paragraph}</li>
                  ))}
                </ul>
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
            <div key={result.id} className="p-4 mb-2 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2">{result.analysis_content.title}</h3>
              <div className="text-gray-700 mb-2">
                <div className="mb-1">주제: {result.analysis_content.theme}</div>
                <div className="mb-1">키워드: {result.analysis_content.keywords.join(', ')}</div>
                <div className="mb-1">핵심 문장:</div>
                <ul className="list-disc pl-5 mb-1">
                  {result.analysis_content.key_sentences.map((sentence, index) => (
                    <li key={index}>{sentence}</li>
                  ))}
                </ul>
              </div>
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
