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
  const [transcriptData, setTranscriptData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoId.trim()) return;

    setIsLoading(true);
    setError('');
    setTranscriptData(null);

    try {
      const response = await fetch(`/api/iitranscript?videoId=${encodeURIComponent(videoId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '자막을 가져오는데 실패했습니다');
      }

      setTranscriptData(data);
      console.log('받아온 자막 데이터:', data); // 콘솔에 데이터 출력
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // 시간을 00:00 형식으로 변환
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

      {transcriptData && (
        <div>
          <h2 className="text-xl font-semibold mb-2">{transcriptData.videoTitle}</h2>
          <p className="mb-4">언어: {transcriptData.selectedLanguage}</p>

          <div className="border rounded p-4 bg-gray-50 max-h-[500px] overflow-y-auto">
            <h3 className="font-medium mb-2">자막 내용:</h3>

            {transcriptData.transcript &&
              transcriptData.transcript.map((segment: any, index: number) => (
                <div key={index} className="mb-2 p-2 border-b">
                  <div className="text-sm text-gray-500 mb-1">
                    {formatTime(segment.start_ms)} - {formatTime(segment.end_ms)}
                  </div>
                  <p>{segment.text}</p>
                </div>
              ))}

            {(!transcriptData.transcript || transcriptData.transcript.length === 0) && (
              <p>자막 데이터가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
