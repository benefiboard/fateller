'use client';

import React, { useState } from 'react';

interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
}

export default function YoutubeTranscriptTest() {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [fullText, setFullText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // 비디오 ID 추출 함수
  const extractVideoId = (url: string): string | null => {
    if (url.length === 11) return url;

    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match && match[1] ? match[1] : null;
  };

  // URL 입력 처리
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setVideoUrl(newUrl);

    const id = extractVideoId(newUrl);
    setVideoId(id || '');
  };

  // 자막 가져오기 - 완전 클라이언트 측 접근법
  const fetchTranscript = async () => {
    if (!videoId) {
      setError('유효한 YouTube URL 또는 비디오 ID를 입력해주세요');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus('처리 시작...');
    setTranscript([]);
    setFullText('');
    setDebugInfo('');

    try {
      // 1. 임시 iframe 생성 (직접 브라우저에서 YouTube 로드)
      setStatus('YouTube 페이지 로드 중...');

      // CORS 문제를 해결하기 위해 임베디드 플레이어 사용
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      // iframe으로 YouTube 플레이어 로드
      const iframeHtml = `
        <iframe 
          id="youtube-transcript-iframe" 
          width="560" 
          height="315" 
          src="https://www.youtube.com/embed/${videoId}?cc_load_policy=1&cc_lang_pref=ko" 
          frameborder="0" 
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
      tempDiv.innerHTML = iframeHtml;

      // 3초 대기하여 자막 로드 (프레임이 로드되도록)
      setStatus('자막 데이터 로드 중 (3초 대기)...');
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 2. YouTube API 직접 호출
      setStatus('YouTube 자막 API 직접 호출 중...');

      // 다양한 URL 형식 시도
      const urls = [
        `/api/youtube-proxy?url=${encodeURIComponent(
          `https://www.youtube.com/api/timedtext?lang=ko&v=${videoId}`
        )}`,
        `/api/youtube-proxy?url=${encodeURIComponent(
          `https://www.youtube.com/api/timedtext?lang=en&v=${videoId}`
        )}`,
        `/api/youtube-proxy?url=${encodeURIComponent(
          `https://www.youtube.com/api/timedtext?v=${videoId}&kind=asr&lang=ko`
        )}`,
        `/api/youtube-proxy?url=${encodeURIComponent(
          `https://www.youtube.com/api/timedtext?v=${videoId}&kind=asr`
        )}`,
      ];

      let transcriptBody = '';
      let successUrl = '';

      // 각 URL 시도
      for (const url of urls) {
        try {
          setStatus(`URL 시도 중: ${url}`);
          const response = await fetch(url);

          if (response.ok) {
            const text = await response.text();
            if (text && text.includes('<text')) {
              transcriptBody = text;
              successUrl = url;
              break;
            }
          }
        } catch (e) {
          console.error('URL 시도 실패:', url, e);
        }
      }

      // 임시 요소 제거
      document.body.removeChild(tempDiv);

      // 자막을 찾을 수 없으면 특별한 접근법 시도
      if (!transcriptBody) {
        setStatus('일반 자막을 찾을 수 없어 대체 방법 시도 중...');

        // YouTube 비디오 페이지의 HTML 소스에서 직접 데이터 추출 시도
        const webPageUrl = `/api/youtube-proxy?url=${encodeURIComponent(
          `https://www.youtube.com/watch?v=${videoId}&cc_lang_pref=ko&cc_load_policy=1`
        )}`;
        const webPageResponse = await fetch(webPageUrl);
        const webPageHtml = await webPageResponse.text();

        // 자막 URL을 직접 찾는 정규식 시도
        const captionsRegex = /"captionTracks":\s*\[\s*\{\s*"baseUrl":\s*"([^"]+)"/;
        const match = webPageHtml.match(captionsRegex);

        if (match && match[1]) {
          const captionUrl = match[1].replace(/\\u0026/g, '&');
          setStatus(`자막 URL 발견: ${captionUrl.substring(0, 50)}...`);

          const captionResponse = await fetch(
            `/api/youtube-proxy?url=${encodeURIComponent(captionUrl)}`
          );
          const captionText = await captionResponse.text();

          if (captionText && captionText.includes('<text')) {
            transcriptBody = captionText;
            successUrl = captionUrl;
          }
        }
      }

      if (!transcriptBody) {
        throw new Error(
          '모든 자막 추출 방법이 실패했습니다. 이 동영상에는 자막이 없거나 접근할 수 없습니다.'
        );
      }

      setStatus(`자막 데이터 추출 성공 (URL: ${successUrl})`);

      // XML 파싱
      const regex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
      const results: TranscriptItem[] = [];
      let match;

      while ((match = regex.exec(transcriptBody)) !== null) {
        const text = match[3]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim();

        if (text) {
          results.push({
            text,
            duration: parseFloat(match[2]),
            offset: parseFloat(match[1]),
          });
        }
      }

      if (results.length === 0) {
        throw new Error('자막을 파싱할 수 없습니다.');
      }

      // 결과 설정
      setTranscript(results);
      setFullText(results.map((item) => item.text).join(' '));
      setStatus(`완료: ${results.length}개 자막 라인 추출됨`);
    } catch (err: any) {
      console.error('자막 처리 오류:', err);
      setError(err.message || '자막 처리 중 오류가 발생했습니다');
      setStatus('오류 발생');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">YouTube 자막 추출 테스트</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={videoUrl}
          onChange={handleUrlChange}
          placeholder="YouTube URL 또는 비디오 ID 입력"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={fetchTranscript}
          disabled={loading || !videoId}
          className={`px-4 py-2 rounded-md text-white ${
            loading || !videoId ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '처리 중...' : '자막 가져오기'}
        </button>
      </div>

      {videoId && <p className="text-sm text-gray-600 mb-4">인식된 비디오 ID: {videoId}</p>}

      {status && <div className="text-sm text-gray-600 mb-4">상태: {status}</div>}

      {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md">오류: {error}</div>}

      {transcript.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mt-8 mb-3">추출된 자막 ({transcript.length}줄)</h2>
          <div className="border border-gray-200 p-4 rounded-md bg-gray-50 max-h-96 overflow-y-auto mb-6">
            {transcript.map((item, index) => (
              <p key={index} className="my-2">
                {item.text}
              </p>
            ))}
          </div>

          <h2 className="text-xl font-semibold mb-3">전체 텍스트</h2>
          <textarea
            value={fullText}
            readOnly
            className="w-full h-48 p-3 border border-gray-300 rounded-md font-sans resize-y"
          />
        </>
      )}

      <div className="mt-6 text-gray-500 text-sm">
        <p className="font-medium">주요 특징:</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>클라이언트 측에서 YouTube 페이지 분석</li>
          <li>다양한 자막 접근 방법 시도</li>
          <li>Vercel 환경에서도 작동</li>
        </ul>
      </div>
    </div>
  );
}
