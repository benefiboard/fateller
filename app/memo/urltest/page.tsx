'use client';

import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [extractedContent, setExtractedContent] = useState('');
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력값 검증
    if (!url || !url.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }

    // 상태 초기화
    setIsLoading(true);
    setError('');
    setExtractedContent('');
    setTitle('');

    try {
      // API 호출
      const response = await fetch('/api/extract-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      // 응답 처리
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '콘텐츠 추출에 실패했습니다.');
      }

      // 성공 시 데이터 표시
      setExtractedContent(data.content);
      setTitle(data.title || '');
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">웹페이지 콘텐츠 추출기</h1>

      <form onSubmit={handleExtract} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 p-2 border border-gray-300 rounded"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-500 text-white p-2 rounded
              ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          >
            {isLoading ? '추출 중...' : '콘텐츠 추출'}
          </button>
        </div>
      </form>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* 추출 결과 */}
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">원본 URL: {url}</p>
        </div>
      )}

      {extractedContent && (
        <div className="border border-gray-200 rounded p-4 bg-white">
          <h3 className="font-semibold mb-2">추출된 콘텐츠:</h3>
          <div className="whitespace-pre-line">{extractedContent}</div>
        </div>
      )}
    </main>
  );
}
