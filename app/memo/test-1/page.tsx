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

  // 비디오 ID 추출 함수
  const extractVideoId = (url: string): string | null => {
    if (url.length === 11) return url; // 이미 ID인 경우

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

  // 자막 가져오기
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

    try {
      // 1. 비디오 페이지 가져오기
      setStatus('YouTube 페이지 로드 중...');
      const videoPageUrl = `/api/youtube-proxy?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${videoId}`
      )}`;
      const videoPageResponse = await fetch(videoPageUrl);

      if (!videoPageResponse.ok) {
        throw new Error(`YouTube 페이지 로드 실패: ${videoPageResponse.status}`);
      }

      const videoPageBody = await videoPageResponse.text();
      setStatus('캡션 데이터 분석 중...');

      // 2. 캡션 데이터 추출
      const splittedHTML = videoPageBody.split('"captions":');

      if (splittedHTML.length <= 1) {
        throw new Error('자막 정보를 찾을 수 없습니다');
      }

      // 3. JSON 파싱
      const captionsJSON = splittedHTML[1].split(',"videoDetails')[0].replace(/\n/g, '');
      let captions;

      try {
        captions = JSON.parse(captionsJSON)?.['playerCaptionsTracklistRenderer'];
      } catch (e) {
        throw new Error('자막 정보 파싱 실패');
      }

      if (!captions || !('captionTracks' in captions) || captions.captionTracks.length === 0) {
        throw new Error('이 동영상에는 자막이 없습니다');
      }

      // 4. 언어 선택 (한국어 우선, 없으면 첫 번째 언어)
      let selectedTrack = captions.captionTracks[0];
      const koTrack = captions.captionTracks.find((track: any) => track.languageCode === 'ko');
      if (koTrack) selectedTrack = koTrack;

      setStatus(`자막 다운로드 중... (언어: ${selectedTrack.languageCode})`);

      // 5. 자막 XML 가져오기
      const transcriptURL = selectedTrack.baseUrl;
      const transcriptProxyUrl = `/api/youtube-proxy?url=${encodeURIComponent(transcriptURL)}`;
      const transcriptResponse = await fetch(transcriptProxyUrl);

      if (!transcriptResponse.ok) {
        throw new Error(`자막 다운로드 실패: ${transcriptResponse.status}`);
      }

      const transcriptBody = await transcriptResponse.text();
      setStatus('자막 파싱 중...');

      // 6. XML 파싱
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
        throw new Error('자막을 파싱할 수 없습니다');
      }

      // 7. 결과 설정
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

          <div className="mt-4 text-gray-600 text-sm">
            <p>* 이 기능은 각 사용자의 IP를 통해 YouTube에 접근하여 자막을 추출합니다.</p>
            <p>
              * 모든 처리는 클라이언트-사이드에서 이루어지므로 Vercel 서버 IP 차단 문제를 피할 수
              있습니다.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
