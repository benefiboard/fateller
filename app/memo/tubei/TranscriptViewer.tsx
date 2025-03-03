// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';

// interface TranscriptSegment {
//   text: string;
//   start_ms: number;
//   end_ms: number;
// }

// interface TranscriptViewerProps {
//   transcript: TranscriptSegment[];
//   videoId: string;
// }

// export default function TranscriptViewer({ transcript, videoId }: TranscriptViewerProps) {
//   const [activeSegment, setActiveSegment] = useState<number | null>(null);

//   // 시간을 00:00 형식으로 변환
//   const formatTime = (ms: number): string => {
//     const totalSeconds = Math.floor(ms / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   };

//   // 특정 시간에 YouTube 영상으로 이동하는 URL 생성
//   const getYouTubeTimeLink = (ms: number): string => {
//     const seconds = Math.floor(ms / 1000);
//     return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
//   };

//   // 자막 내용이 없는 경우
//   if (!transcript || transcript.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-lg text-gray-600">이 동영상에 대한 자막이 없습니다.</p>
//       </div>
//     );
//   }

//   // 자막 검색 기능 (향후 확장 가능)
//   // const searchTranscript = (query: string) => {
//   //   // 검색 로직 구현
//   // };

//   return (
//     <div>
//       <div className="mb-4">
//         <h3 className="text-lg font-medium mb-2">자막 내용</h3>
//         {/* 여기에 검색 기능 추가 가능 */}
//       </div>

//       <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
//         {transcript.map((segment, index) => (
//           <div
//             key={index}
//             className={`p-3 rounded transition-colors cursor-pointer ${
//               activeSegment === index ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
//             }`}
//             onClick={() => setActiveSegment(index === activeSegment ? null : index)}
//           >
//             <div className="flex justify-between items-center mb-1">
//               <Link
//                 href={getYouTubeTimeLink(segment.start_ms)}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:underline text-sm"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 {formatTime(segment.start_ms)} - {formatTime(segment.end_ms)}
//               </Link>
//             </div>
//             <p className="text-gray-800">{segment.text}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
