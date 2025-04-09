//app/test/basic-short/page.tsx

'use client';

import { useState } from 'react';

// 작가 스타일 목록 정의
const AUTHOR_STYLES = [
  { id: 'default', name: '기본 스타일' },
  { id: 'feynman', name: '리차드 파인만 - 명쾌하고 친근한 설명' },
  { id: 'eagleman', name: '데이비드 이글먼 - 과학과 철학의 융합' },
  { id: 'yoosimin', name: '유시민 - 논리적이고 체계적인 설명' },
  { id: 'kimyoungha', name: '김영하 - 간결하고 날카로운 통찰' },
  { id: 'haruki', name: '무라카미 하루키 - 몽환적이고 감성적인 묘사' },
];

export default function TestPage() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [authorStyle, setAuthorStyle] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url) {
      setError('유튜브 URL을 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          title: title || undefined,
          authorStyle: authorStyle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '요약 중 오류가 발생했습니다');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || '요약 요청 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedAuthorName = () => {
    const author = AUTHOR_STYLES.find((a) => a.id === authorStyle);
    return author ? author.name : '기본 스타일';
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">유튜브 자막 요약 테스트</h1>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded shadow-sm">
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium mb-1">
            유튜브 URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            커스텀 제목 (선택사항)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="요약에 반영할 커스텀 제목 (비워두면 유튜브 제목 사용)"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="authorStyle" className="block text-sm font-medium mb-1">
            작가 스타일
          </label>
          <select
            id="authorStyle"
            value={authorStyle}
            onChange={(e) => setAuthorStyle(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {AUTHOR_STYLES.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            선택한 작가의 말투와 문체로 요약 결과가 생성됩니다.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 rounded ${
            isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isLoading ? '요약 중...' : '요약하기'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {result && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">요약 결과</h2>

          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-4">
            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-2">비디오 정보</h3>
              <p className="text-xl font-bold">{result.videoTitle}</p>
              <p className="mt-2 text-sm text-gray-500">자막 길이: {result.transcript.length} 자</p>
              <p className="mt-1 text-sm text-gray-500">작가 스타일: {getSelectedAuthorName()}</p>
            </div>

            {result.thumbnailUrl && (
              <div className="md:col-span-1">
                <img
                  src={result.thumbnailUrl}
                  alt="비디오 썸네일"
                  className="w-full rounded shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Gemini 요약 결과 (원본 JSON)</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-y-auto overflow-x-hidden max-h-[800px] text-sm whitespace-pre-wrap">
              {JSON.stringify(result.summary, null, 2)}
            </pre>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">원본 자막</h3>
            <details>
              <summary className="cursor-pointer p-2 bg-gray-100 rounded">
                원본 자막 보기 (클릭하여 펼치기)
              </summary>
              <div className="mt-2 p-4 bg-gray-50 rounded overflow-auto max-h-[400px] whitespace-pre-wrap">
                {result.transcript}
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
