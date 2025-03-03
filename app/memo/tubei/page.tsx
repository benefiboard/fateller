// 'use client';

// import { useState, useEffect } from 'react';

// export default function TubeiPage() {
//   const [transcriptData, setTranscriptData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   async function fetchYouTubeTranscript(videoId, language) {
//     setLoading(true);
//     setError(null);

//     try {
//       // This would be your API endpoint that uses youtubei.js on the server side
//       const response = await fetch(`/api/iitranscript?videoId=${videoId}&language=${language}`);

//       if (!response.ok) {
//         throw new Error(`Failed to fetch transcript: ${response.statusText}`);
//       }

//       const data = await response.json();
//       setTranscriptData(data);
//     } catch (err) {
//       console.error('Error fetching transcript:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     // Fetch transcript on component mount if needed
//     // fetchYouTubeTranscript('hePb00CqvP0', 'Hebrew');
//   }, []);

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">YouTube Transcript Viewer</h1>

//       <div className="mb-6">
//         <div className="flex gap-4 mb-4">
//           <input
//             type="text"
//             placeholder="YouTube Video ID"
//             className="border p-2 flex-grow"
//             id="videoId"
//             defaultValue="hePb00CqvP0"
//           />
//           <input
//             type="text"
//             placeholder="Language (optional)"
//             className="border p-2 w-40"
//             id="language"
//             defaultValue="Hebrew"
//           />
//           <button
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//             onClick={() => {
//               const videoId = document.getElementById('videoId').value;
//               const language = document.getElementById('language').value;
//               fetchYouTubeTranscript(videoId, language);
//             }}
//           >
//             Fetch Transcript
//           </button>
//         </div>
//       </div>

//       {loading && <p>Loading transcript...</p>}

//       {error && (
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
//           <p>{error}</p>
//         </div>
//       )}

//       {transcriptData && (
//         <div>
//           <h2 className="text-xl font-semibold mb-2">Transcript ({transcriptData.language})</h2>
//           <div className="border p-4 bg-gray-50 max-h-96 overflow-y-auto">
//             {transcriptData.segments.map((segment, index) => (
//               <div key={index} className="mb-2">
//                 <span className="text-gray-500 text-sm">
//                   {Math.floor(segment.start_ms / 1000)}s - {Math.floor(segment.end_ms / 1000)}s
//                 </span>
//                 <p>{segment.text}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import { useState } from 'react';

export default function Home() {
  const [videoId, setVideoId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoId.trim()) return;

    setIsLoading(true);
    setError('');
    setTranscript('');
    setVideoTitle('');

    try {
      const response = await fetch(`/api/iitranscript?videoId=${encodeURIComponent(videoId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '자막을 가져오는데 실패했습니다');
      }

      // 비디오 제목 설정
      setVideoTitle(data.videoTitle || '제목 없음');

      // 각 세그먼트의 text 부분만 추출해서 연결
      if (data.transcript && Array.isArray(data.transcript)) {
        const fullText = data.transcript
          .map((segment: any) => {
            // 여러 형태의 자막 데이터 구조 처리
            if (segment.snippet && segment.snippet.text) {
              return segment.snippet.text;
            } else if (segment.text) {
              return segment.text;
            } else if (segment.snippet && typeof segment.snippet === 'object') {
              // 중첩된 객체 구조 처리
              return segment.snippet.text || '';
            }
            return '';
          })
          .filter((text: string) => text.trim() !== '') // 빈 문자열 제거
          .join(' '); // 공백으로 연결

        setTranscript(fullText);
      } else {
        setError('자막 데이터가 없습니다');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">YouTube 자막 추출기</h1>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={videoId}
            onChange={(e) => setVideoId(e.target.value)}
            placeholder="YouTube 비디오 ID 입력 (예: dQw4w9WgXcQ)"
            className="flex-1 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
          >
            {isLoading ? '로딩 중...' : '자막 가져오기'}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {videoTitle && <h2 className="text-xl font-semibold mb-2">{videoTitle}</h2>}

      {transcript && (
        <div className="border rounded p-4 bg-gray-50 mt-4">
          <h3 className="font-medium mb-2">전체 자막 내용:</h3>
          <div className="whitespace-pre-line">{transcript}</div>
        </div>
      )}
    </main>
  );
}
