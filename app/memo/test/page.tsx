'use client';

import React, { useState } from 'react';
import axios from 'axios';

export default function ExtractionTest() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('readability');
  
  // 테스트할 예시 사이트들
  const exampleSites = [
    { name: '네이버 블로그', url: 'https://blog.naver.com/PostView.naver?blogId=naver_diary&logNo=222689185406' },
    { name: '티스토리', url: 'https://cheese-cake.tistory.com/101' },
    { name: '브런치', url: 'https://brunch.co.kr/@tourism/91' },
    { name: '미디엄', url: 'https://medium.com/better-programming/clean-architecture-for-dummies-df6561d42c94' },
    { name: '뉴스기사', url: 'https://www.chosun.com/economy/tech_it/2023/06/04/HGRJPQAMUJWSOHXYYG4XHHJJUE/' },
  ];

  // URL 입력 처리
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  
  // 예시 사이트 선택 처리
  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl);
  };

  // 콘텐츠 추출 처리
  const handleExtract = async () => {
    if (!url) {
      setError('URL을 입력해주세요');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('/api/test-extraction', { url });
      setResult(response.data);
    } catch (error: any) {
      console.error('추출 오류:', error);
      setError(error.response?.data?.error || '콘텐츠 추출 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">웹페이지 콘텐츠 추출 테스트</h1>
      
      {/* URL 입력 영역 */}
      <div className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="URL을 입력하세요"
            className="flex-1 p-2 border border-gray-300 rounded-l"
          />
          <button
            onClick={handleExtract}
            disabled={isLoading}
            className={`px-4 py-2 rounded-r ${
              isLoading ? 'bg-gray-400' : 'bg-teal-500 hover:bg-teal-600'
            } text-white`}
          >
            {isLoading ? '추출 중...' : '추출'}
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
      
      {/* 예시 사이트 목록 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">예시 사이트:</h2>
        <div className="flex flex-wrap gap-2">
          {exampleSites.map((site, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(site.url)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              {site.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* 결과 표시 영역 */}
      {result && (
        <div className="border border-gray-300 rounded p-4">
          <h2 className="text-lg font-semibold mb-2">추출 결과:</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">URL: {result.url}</p>
            <p className="font-medium">제목: {result.title}</p>
            <p className="text-sm">
              <span className="mr-4">Readability 길이: {result.contentLength.readability}자</span>
              <span>Cheerio 길이: {result.contentLength.cheerio}자</span>
            </p>
          </div>
          
          {/* 탭 메뉴 */}
          <div className="flex border-b mb-4">
            <button
              className={`py-2 px-4 ${
                activeTab === 'readability' ? 'border-b-2 border-teal-500 font-medium' : ''
              }`}
              onClick={() => setActiveTab('readability')}
            >
              Readability 결과
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === 'cheerio' ? 'border-b-2 border-teal-500 font-medium' : ''
              }`}
              onClick={() => setActiveTab('cheerio')}
            >
              Cheerio 결과
            </button>
          </div>
          
          {/* 콘텐츠 표시 */}
          <div className="bg-gray-100 p-4 rounded max-h-80 overflow-y-auto whitespace-pre-line">
            {activeTab === 'readability' ? result.readabilityContent : result.cheerioContent}
          </div>
        </div>
      )}
    </div>
  );
}