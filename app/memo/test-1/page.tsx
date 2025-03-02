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
  const [debugData, setDebugData] = useState<any>(null);

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

  // 자막 메타데이터 직접 가져오기
  const getTranscriptMetadata = async () => {
    // 유사 진짜 브라우저 요청을 생성
    const url = `/api/youtube-proxy?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}&hl=ko`
    )}`;
    const response = await fetch(url);
    const html = await response.text();

    // JSON 데이터 추출을 위한 패턴
    const patterns = [
      /ytInitialPlayerResponse\s*=\s*({.+?});/,
      /ytInitialPlayerResponse\s*=\s*({[\s\S]+?});/,
      /\("ytInitialPlayerResponse"\)\s*&&\s*\("ytInitialPlayerResponse"\)\s*\|\|\s*({[\s\S]+?});/,
    ];

    let playerResponse = null;

    // 각 패턴 시도
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          playerResponse = JSON.parse(match[1]);
          break;
        } catch (e) {
          console.error('JSON 파싱 실패:', e);
        }
      }
    }

    if (!playerResponse) {
      throw new Error('YouTube 플레이어 응답을 찾을 수 없습니다');
    }

    // 디버깅을 위해 데이터 저장
    setDebugData(playerResponse);

    return playerResponse;
  };

  // 새로운 자막 추출 방법
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
      // 1. 메타데이터에서 자막 정보 가져오기
      setStatus('YouTube 메타데이터 분석 중...');
      const playerData = await getTranscriptMetadata();

      // 2. 자막 URL 추출
      const captions = playerData?.captions?.playerCaptionsTracklistRenderer;

      if (!captions || !captions.captionTracks || captions.captionTracks.length === 0) {
        throw new Error('이 동영상에는 자막이 없습니다');
      }

      // 3. 한국어 또는 영어 자막 선택 (있는 경우)
      const tracks = captions.captionTracks;
      let selectedTrack = tracks[0]; // 기본값

      // 선호 언어 순서
      const preferredLangs = ['ko', 'en'];

      for (const lang of preferredLangs) {
        const track = tracks.find((t: any) => t.languageCode === lang);
        if (track) {
          selectedTrack = track;
          break;
        }
      }

      setStatus(`자막 다운로드 중 (${selectedTrack.languageCode})...`);

      // 4. 자막 내용 가져오기
      const transcriptUrl = selectedTrack.baseUrl;
      const proxyUrl = `/api/youtube-proxy?url=${encodeURIComponent(transcriptUrl)}`;

      const transcriptResponse = await fetch(proxyUrl);
      const transcriptXml = await transcriptResponse.text();

      if (!transcriptXml || transcriptXml.length === 0) {
        throw new Error('자막 데이터를 다운로드할 수 없습니다');
      }

      // 5. XML 파싱
      setStatus('자막 파싱 중...');
      const regex = /<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>/g;
      const results: TranscriptItem[] = [];
      let match;

      while ((match = regex.exec(transcriptXml)) !== null) {
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

      // 6. 결과 설정
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

      {debugData && (
        <div className="mt-8">
          <details className="border border-gray-200 rounded-md p-2">
            <summary className="font-medium cursor-pointer">디버그 데이터 (확장)</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
              <ul>
                <li>비디오 ID: {videoId}</li>
                <li>응답 데이터 존재: {debugData ? '예' : '아니오'}</li>
                <li>자막 데이터 존재: {debugData?.captions ? '예' : '아니오'}</li>
                {debugData?.captions?.playerCaptionsTracklistRenderer?.captionTracks && (
                  <li>
                    사용 가능한 자막 언어:
                    {debugData.captions.playerCaptionsTracklistRenderer.captionTracks
                      .map((t: any) => t.languageCode)
                      .join(', ')}
                  </li>
                )}
              </ul>
            </div>
          </details>
        </div>
      )}

      <div className="mt-6 text-gray-500 text-sm">
        <p className="font-medium">실패한 경우 다음을 시도해보세요:</p>
        <ul className="list-disc ml-6 space-y-1">
          <li>자막이 있는 다른 영상 시도 (예: 유명 뮤직비디오, 공식 채널 영상)</li>
          <li>영어 자막이 있는 영상 시도</li>
          <li>URL 전체 복사 (https://www.youtube.com/watch?v=ID 형식)</li>
        </ul>
      </div>
    </div>
  );
}
