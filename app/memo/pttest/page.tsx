'use client';

import React, { useState } from 'react';
import axios from 'axios';

export default function PuppeteerExtractionTest() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('readability');

  // 테스트할 예시 사이트들
  const exampleSites = [
    { name: '티스토리', url: 'https://cheese-cake.tistory.com/101' },
    { name: '브런치', url: 'https://brunch.co.kr/@tourism/91' },
    {
      name: '미디엄',
      url: 'https://medium.com/better-programming/clean-architecture-for-dummies-df6561d42c94',
    },
    {
      name: '뉴스기사',
      url: 'https://www.chosun.com/economy/tech_it/2023/06/04/HGRJPQAMUJWSOHXYYG4XHHJJUE/',
    },
    { name: '교보문고', url: 'https://product.kyobobook.co.kr/detail/S000001952006' },
    { name: '카카오뉴스', url: 'https://v.daum.net/v/20230814153054636' },
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
      const response = await axios.post('/api/extract-puppeteer', { url });
      setResult(response.data);
    } catch (error: any) {
      console.error('추출 오류:', error);
      // 네이버 블로그 오류 특별 처리
      if (error.response?.data?.unsupportedSite) {
        setError('⚠️ 네이버 블로그는 현재 지원되지 않습니다. 다른 사이트를 이용해주세요.');
      } else {
        setError(error.response?.data?.error || '콘텐츠 추출 중 오류가 발생했습니다');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Puppeteer 웹페이지 콘텐츠 추출 테스트</h1>
      <p className="mb-4 text-gray-600">
        실제 브라우저(Puppeteer)를 사용하여 JavaScript로 렌더링된 콘텐츠도 추출할 수 있습니다
      </p>

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
        <p className="text-sm text-gray-500 mt-1">※ 첫 실행 시 10~30초 정도 소요될 수 있습니다</p>
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
            {result.metaDescription && (
              <p className="text-sm text-gray-600 mt-1">설명: {result.metaDescription}</p>
            )}
            <p className="text-sm mt-2">
              <span className="mr-4">Readability 길이: {result.contentLength.readability}자</span>
              <span>직접 추출 길이: {result.contentLength.directExtracted}자</span>
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
                activeTab === 'direct' ? 'border-b-2 border-teal-500 font-medium' : ''
              }`}
              onClick={() => setActiveTab('direct')}
            >
              직접 추출 결과
            </button>
          </div>

          {/* 콘텐츠 표시 */}
          <div className="bg-gray-100 p-4 rounded max-h-80 overflow-y-auto whitespace-pre-line">
            {activeTab === 'readability'
              ? result.readabilityContent
              : result.directExtractedContent}
          </div>
        </div>
      )}
    </div>
  );
}
