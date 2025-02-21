// 'use client';

// // pages/index.js
// import { useState } from 'react';
// import Head from 'next/head';
// import {
//   Plus,
//   Search,
//   Tag,
//   Link2,
//   FileText,
//   Lightbulb,
//   BookOpen,
//   Briefcase,
//   Sparkles,
//   LineChart,
// } from 'lucide-react';

// interface Note {
//   id: number;
//   title: string;
//   content: string;
//   category: {
//     main: string;
//     sub: string;
//   };
//   keywords: string[];
//   keySentence: string;
//   type: string;
//   timestamp: string;
//   centerIdeas?: any[]; // centerIdeas 속성 추가 (선택적 속성으로)
// }

// export default function Home() {
//   // 상태 관리
//   const [activeTab, setActiveTab] = useState('all');
//   const [showModal, setShowModal] = useState(false);
//   const [noteContent, setNoteContent] = useState('');

//   // 예시 데이터 - 다양한 유형의 노트
//   const [notes, setNotes] = useState([
//     {
//       id: 1,
//       title: '플라톤의 이데아론 핵심 개념',
//       content:
//         '플라톤의 이데아론에서는 현실 세계의 모든 사물이 이데아(형상)의 모방이라고 주장한다. 이데아는 완전하고 불변하는 실재로, 우리가 인식하는 세계는 이데아의 그림자에 불과하다.',
//       category: { main: '학습/공부', sub: '개념/용어 정리' },
//       keywords: ['플라톤', '이데아', '철학'],
//       keySentence: '현실 세계의 모든 사물이 이데아(형상)의 모방이다',
//       centerIdeas: [
//         { id: 101, content: '이데아는 완전하고 불변하는 실재다', linked: true },
//         { id: 102, content: '현실 세계는 이데아의 그림자에 불과하다', linked: true },
//       ],
//       type: 'complex',
//       timestamp: '2024-02-20T09:30:00Z',
//     },
//     {
//       id: 2,
//       title: '주간 팀 미팅 메모',
//       content:
//         '마케팅 캠페인 일정 조정 필요, 신제품 출시 2주 연기, 사용자 피드백 설문조사 다음 주 실시 예정',
//       category: { main: '업무/프로젝트', sub: '회의/미팅 내용' },
//       keywords: ['마케팅', '신제품', '피드백'],
//       keySentence: '마케팅 캠페인 일정 조정과 신제품 출시 2주 연기 결정',
//       type: 'simple',
//       timestamp: '2024-02-19T14:00:00Z',
//     },
//     {
//       id: 3,
//       title: 'AI 기반 여행 가이드 앱 아이디어',
//       content:
//         '사용자의 여행 취향과 예산에 맞춘 맞춤형 여행 계획을 AI가 자동으로 생성해주는 앱. 현지 맛집, 숨겨진 명소 추천 기능 포함. 실시간 일정 조정 기능도 추가.',
//       category: { main: '영감/아이디어', sub: '창작 아이디어' },
//       keywords: ['AI', '여행', '맞춤형'],
//       keySentence: 'AI가 사용자 취향에 맞는 맞춤형 여행 계획을 자동 생성',
//       centerIdeas: [
//         { id: 201, content: 'AI 기반 맞춤형 여행 계획 자동 생성', linked: true },
//         { id: 202, content: '현지 맛집, 숨겨진 명소 추천 기능', linked: false },
//         { id: 203, content: '실시간 일정 조정 기능', linked: true },
//       ],
//       type: 'complex',
//       timestamp: '2024-02-18T10:15:00Z',
//     },
//     {
//       id: 4,
//       title: '인공지능 기술 관련 최신 연구 동향',
//       content:
//         '생성형 AI 모델의 발전으로 텍스트, 이미지, 음성 생성 능력이 급속도로 향상되고 있다. 특히 멀티모달 모델의 등장으로 다양한 형태의 데이터를 동시에 처리할 수 있게 되었다. 또한 강화학습을 통한 AI 모델의 자기개선 능력도 주목할 만한 발전을 보이고 있다.',
//       category: { main: '리서치/조사', sub: '시장/트렌드 조사' },
//       keywords: ['생성형AI', '멀티모달', '강화학습'],
//       keySentence: '생성형 AI와 멀티모달 모델의 발전이 주요 트렌드',
//       type: 'article',
//       timestamp: '2024-02-17T16:45:00Z',
//     },
//   ]);

//   // 노트 추가 함수
//   const addNote = () => {
//     if (noteContent.trim() === '') return;

//     // 간단한 자동 라벨링 (실제로는 AI가 처리)
//     const content = noteContent.toLowerCase();

//     // 기본 카테고리 결정 (간단한 키워드 기반)
//     let category = { main: '정보/자료', sub: '일반 정보' };
//     if (content.includes('회의') || content.includes('미팅')) {
//       category = { main: '업무/프로젝트', sub: '회의/미팅 내용' };
//     } else if (content.includes('아이디어') || content.includes('생각')) {
//       category = { main: '영감/아이디어', sub: '창작 아이디어' };
//     } else if (content.includes('공부') || content.includes('학습')) {
//       category = { main: '학습/공부', sub: '개념/용어 정리' };
//     }

//     // 제목 생성 (첫 10단어 또는 60자 이내)
//     const words = noteContent.split(' ');
//     const title =
//       words.slice(0, 10).join(' ').substring(0, 60) + (noteContent.length > 60 ? '...' : '');

//     // 간단한 키워드 추출
//     const keywords = ['키워드1', '키워드2', '키워드3']; // 실제로는 AI가 문맥 기반으로 추출

//     // 핵심 문장 추출 (첫 문장을 핵심 문장으로 가정)
//     const sentences = noteContent.split(/[.!?]/);
//     const keySentence = sentences[0].trim();

//     // 노트 타입 결정 (내용 길이와 구조에 따라)
//     const type = noteContent.length > 200 ? 'complex' : 'simple';

//     // 새 노트 객체 생성
//     const newNote = {
//       id: Date.now(),
//       title,
//       content: noteContent,
//       category,
//       keywords,
//       keySentence,
//       type,
//       timestamp: new Date().toISOString(),
//     };

//     // 중심 아이디어 추출 (복잡한 노트인 경우)
//     if (type === 'complex') {
//       newNote.centerIdeas = sentences
//         .slice(1, 4)
//         .map((sentence, index) => ({
//           id: Date.now() + index + 1,
//           content: sentence.trim(),
//           linked: Math.random() > 0.3, // 랜덤하게 연결 여부 결정 (실제로는 AI가 결정)
//         }))
//         .filter((idea) => idea.content.length > 0);
//     }

//     // 노트 추가
//     setNotes([newNote, ...notes]);

//     // 입력창 초기화 및 모달 닫기
//     setNoteContent('');
//     setShowModal(false);
//   };

//   // 카테고리별 아이콘 매핑
//   const categoryIcons = {
//     '학습/공부': <BookOpen size={18} className="text-blue-500" />,
//     '업무/프로젝트': <Briefcase size={18} className="text-purple-500" />,
//     '영감/아이디어': <Lightbulb size={18} className="text-yellow-500" />,
//     '리서치/조사': <LineChart size={18} className="text-green-500" />,
//   };

//   // 필터링된 노트 목록
//   const filteredNotes =
//     activeTab === 'all' ? notes : notes.filter((note) => note.type === activeTab);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Head>
//         <title>BrainLabeling</title>
//         <meta name="description" content="자동화된 생각 정리 서비스" />
//         <link rel="icon" href="/favicon.ico" />
//       </Head>

//       {/* 헤더 */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//           <div className="flex justify-between items-center">
//             <h1 className="text-2xl font-semibold text-gray-900">BrainLabeling</h1>
//             <button
//               onClick={() => setShowModal(true)}
//               className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//             >
//               <Plus size={18} className="mr-2" />새 생각 기록
//             </button>
//           </div>
//           <p className="mt-1 text-sm text-gray-500">
//             생각은 자동으로 정리됩니다. 당신은 그저 저장만 하세요.
//           </p>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* 필터 탭 */}
//         <div className="border-b border-gray-200 mb-6">
//           <nav className="-mb-px flex space-x-8">
//             <button
//               onClick={() => setActiveTab('all')}
//               className={`${
//                 activeTab === 'all'
//                   ? 'border-indigo-500 text-indigo-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
//             >
//               전체
//             </button>
//             <button
//               onClick={() => setActiveTab('simple')}
//               className={`${
//                 activeTab === 'simple'
//                   ? 'border-indigo-500 text-indigo-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
//             >
//               단순 메모
//             </button>
//             <button
//               onClick={() => setActiveTab('complex')}
//               className={`${
//                 activeTab === 'complex'
//                   ? 'border-indigo-500 text-indigo-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
//             >
//               복합 생각
//             </button>
//             <button
//               onClick={() => setActiveTab('article')}
//               className={`${
//                 activeTab === 'article'
//                   ? 'border-indigo-500 text-indigo-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
//             >
//               기사/자료
//             </button>
//           </nav>
//         </div>

//         {/* 노트 그리드 */}
//         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           {filteredNotes.map((note) => (
//             <div
//               key={note.id}
//               className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
//             >
//               <div className="px-4 py-5 sm:p-6">
//                 {/* 카테고리 및 타입 */}
//                 <div className="flex justify-between items-center mb-3">
//                   <div className="flex items-center text-sm text-gray-500">
//                     {categoryIcons[note.category.main] || (
//                       <Tag size={18} className="text-gray-400" />
//                     )}
//                     <span className="ml-1">
//                       {note.category.main} &gt; {note.category.sub}
//                     </span>
//                   </div>
//                   <span
//                     className={`px-2 py-1 text-xs rounded-full ${
//                       note.type === 'simple'
//                         ? 'bg-blue-100 text-blue-800'
//                         : note.type === 'complex'
//                         ? 'bg-purple-100 text-purple-800'
//                         : 'bg-green-100 text-green-800'
//                     }`}
//                   >
//                     {note.type === 'simple'
//                       ? '단순 메모'
//                       : note.type === 'complex'
//                       ? '복합 생각'
//                       : '기사/자료'}
//                   </span>
//                 </div>

//                 {/* 제목 */}
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">{note.title}</h3>

//                 {/* 핵심 문장 */}
//                 <p className="text-sm text-gray-700 italic mb-4">"{note.keySentence}"</p>

//                 {/* 본문 */}
//                 <p className="text-sm text-gray-600 mb-4 line-clamp-3">{note.content}</p>

//                 {/* 중심 아이디어 (복합 생각인 경우) */}
//                 {note.centerIdeas && note.centerIdeas.length > 0 && (
//                   <div className="mb-4">
//                     <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
//                       <Sparkles size={16} className="mr-1 text-purple-500" />
//                       중심 아이디어:
//                     </h4>
//                     <ul className="space-y-2">
//                       {note.centerIdeas.map((idea) => (
//                         <li key={idea.id} className="flex items-start">
//                           <div
//                             className={`flex-shrink-0 h-4 w-4 mt-0.5 rounded-full ${
//                               idea.linked ? 'bg-green-400' : 'bg-gray-300'
//                             }`}
//                           ></div>
//                           <p className="ml-2 text-sm text-gray-600">{idea.content}</p>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 {/* 키워드 */}
//                 <div className="flex flex-wrap gap-2 mt-4">
//                   {note.keywords.map((keyword, index) => (
//                     <span
//                       key={index}
//                       className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
//                     >
//                       # {keyword}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               {/* 관련 링크 (복합 생각인 경우) */}
//               {note.centerIdeas && note.centerIdeas.filter((idea) => idea.linked).length > 0 && (
//                 <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
//                   <div className="flex items-center">
//                     <Link2 size={16} className="text-gray-400" />
//                     <span className="ml-2 text-xs text-gray-500">
//                       {note.centerIdeas.filter((idea) => idea.linked).length}개의 연결된 생각
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </main>

//       {/* 새 생각 추가 모달 */}
//       {showModal && (
//         <div className="fixed z-10 inset-0 overflow-y-auto">
//           <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
//             <div className="fixed inset-0 transition-opacity" aria-hidden="true">
//               <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
//             </div>

//             <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
//               &#8203;
//             </span>

//             <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
//               <div>
//                 <div className="mt-3 text-center sm:mt-0 sm:text-left">
//                   <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
//                     <FileText size={20} className="mr-2 text-indigo-500" />새 생각 기록하기
//                   </h3>
//                   <div className="mt-2">
//                     <p className="text-sm text-gray-500">
//                       당신의 생각을 자유롭게 작성하세요. AI가 자동으로 분류하고 정리해 드립니다.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-5">
//                 <textarea
//                   className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
//                   placeholder="생각, 아이디어, 정보 등을 자유롭게 작성하세요..."
//                   value={noteContent}
//                   onChange={(e) => setNoteContent(e.target.value)}
//                 ></textarea>
//               </div>
//               <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
//                 <button
//                   type="button"
//                   className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
//                   onClick={addNote}
//                 >
//                   저장
//                 </button>
//                 <button
//                   type="button"
//                   className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
//                   onClick={() => setShowModal(false)}
//                 >
//                   취소
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
