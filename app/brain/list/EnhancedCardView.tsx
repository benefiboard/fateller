// 'use client';

// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { ArrowRight, Bookmark, BookCheck, DownloadCloud, ChevronLeft } from 'lucide-react';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';

// // 애니메이션 변형 설정
// const slideVariants = {
//   enter: (direction) => ({
//     x: direction > 0 ? 1000 : -1000,
//     opacity: 0,
//   }),
//   center: {
//     x: 0,
//     opacity: 1,
//   },
//   exit: (direction) => ({
//     x: direction < 0 ? 1000 : -1000,
//     opacity: 0,
//   }),
// };

// // 카드 컴포넌트
// const EnhancedCardView = ({ card }) => {
//   // 카드 상태 관리: 'default', 'ideas', 'children', 'original'
//   const [viewState, setViewState] = useState('default');
//   // 애니메이션 방향 관리 (1: 오른쪽에서 왼쪽, -1: 왼쪽에서 오른쪽)
//   const [direction, setDirection] = useState(1);

//   // 다음 상태로 이동
//   const moveToNextState = () => {
//     setDirection(1);
//     if (viewState === 'default') setViewState('ideas');
//     else if (viewState === 'ideas') setViewState('children');
//     else if (viewState === 'children') setViewState('original');
//     else setViewState('default');
//   };

//   // 이전 상태로 이동
//   const moveToPrevState = () => {
//     setDirection(-1);
//     if (viewState === 'original') setViewState('children');
//     else if (viewState === 'children') setViewState('ideas');
//     else if (viewState === 'ideas') setViewState('default');
//     else setViewState('original');
//   };

//   // 카테고리 색상 매핑
//   const getCategoryColor = (category) => {
//     const categoryColors = {
//       '학습/공부': 'bg-blue-100 text-blue-800',
//       '업무/프로젝트': 'bg-purple-100 text-purple-800',
//       '영감/아이디어': 'bg-yellow-100 text-yellow-800',
//       '문제해결/의사결정': 'bg-red-100 text-red-800',
//       '리서치/조사': 'bg-green-100 text-green-800',
//       '개인/일상': 'bg-orange-100 text-orange-800',
//       '정보/자료': 'bg-gray-100 text-gray-800',
//     };

//     return categoryColors[category] || 'bg-gray-100 text-gray-800';
//   };

//   return (
//     <div className="flex flex-col tracking-tighter">
//       {/* 카드 헤더와 본문 */}
//       <div className="relative aspect-square bg-blue-50/75 p-4 flex flex-col overflow-hidden">
//         {/* 상단: 카테고리 및 북마크 */}
//         <div className="flex items-center justify-between z-10">
//           <p className="whitespace-pre-line text-sm">{`${card.category_main || '미분류'} > ${
//             card.category_sub || '미분류'
//           }`}</p>
//           <Bookmark className="w-8 h-8 text-gray-600" />
//         </div>

//         {/* 네비게이션 버튼 */}
//         {viewState !== 'default' && (
//           <button
//             onClick={moveToPrevState}
//             className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md z-20"
//           >
//             <ChevronLeft className="w-6 h-6 text-gray-700" />
//           </button>
//         )}

//         {/* 콘텐츠 영역 */}
//         <AnimatePresence custom={direction} mode="wait">
//           {/* 기본 뷰 - 카드 정보 */}
//           {viewState === 'default' && (
//             <motion.div
//               key="default"
//               custom={direction}
//               variants={slideVariants}
//               initial="enter"
//               animate="center"
//               exit="exit"
//               transition={{ type: 'tween', duration: 0.5 }}
//               className="flex-1 flex flex-col"
//             >
//               <div className="flex-1 flex gap-2 items-center">
//                 <p className="flex-1 text-2xl font-semibold whitespace-pre-line">{card.title}</p>
//                 <button onClick={moveToNextState}>
//                   <ArrowRight className="w-8 h-8 text-gray-600" />
//                 </button>
//               </div>
//               <hr className="mb-2 border-gray-400" />
//               <div className="flex items-center gap-4">
//                 <p className="italic tracking-tighter">
//                   "{card.key_sentence || '키 문장이 없습니다.'}"
//                 </p>
//               </div>
//               <hr className="mt-2 border-gray-400" />
//             </motion.div>
//           )}

//           {/* 중심 아이디어 뷰 */}
//           {viewState === 'ideas' && (
//             <motion.div
//               key="ideas"
//               custom={direction}
//               variants={slideVariants}
//               initial="enter"
//               animate="center"
//               exit="exit"
//               transition={{ type: 'tween', duration: 0.5 }}
//               className="flex-1 flex flex-col"
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-semibold">중심 아이디어</h3>
//                 <button onClick={moveToNextState}>
//                   <ArrowRight className="w-8 h-8 text-gray-600" />
//                 </button>
//               </div>
//               <div className="flex-1 overflow-auto">
//                 <ul className="space-y-4">
//                   {card.children &&
//                     card.children.map((child) => (
//                       <li key={child.id} className="flex items-start">
//                         <div
//                           className={`flex-shrink-0 h-4 w-4 mt-1 rounded-full ${
//                             child.is_linked ? 'bg-green-400' : 'bg-gray-300'
//                           }`}
//                         ></div>
//                         <div className="ml-3 text-gray-700">
//                           <p className="font-medium">{child.center_idea || child.title}</p>
//                         </div>
//                       </li>
//                     ))}
//                 </ul>
//               </div>
//             </motion.div>
//           )}

//           {/* 자식 카드 뷰 */}
//           {viewState === 'children' && (
//             <motion.div
//               key="children"
//               custom={direction}
//               variants={slideVariants}
//               initial="enter"
//               animate="center"
//               exit="exit"
//               transition={{ type: 'tween', duration: 0.5 }}
//               className="flex-1 flex flex-col"
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-semibold">자식 카드</h3>
//                 <button onClick={moveToNextState}>
//                   <ArrowRight className="w-8 h-8 text-gray-600" />
//                 </button>
//               </div>
//               <div className="flex-1 overflow-auto">
//                 {card.children && card.children.length > 0 ? (
//                   <div className="space-y-4">
//                     {card.children.map((child) => (
//                       <div key={child.id} className="border border-indigo-100 rounded shadow-sm">
//                         <div className="py-2 px-3 bg-indigo-50/50">
//                           <p className="text-sm font-medium">{child.title}</p>
//                         </div>
//                         <div className="py-2 px-3">
//                           <p className="text-sm text-gray-600 mb-2">{child.content}</p>
//                           <div className="flex flex-wrap gap-1">
//                             {child.keywords?.map((keyword, idx) => (
//                               <span
//                                 key={idx}
//                                 className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
//                               >
//                                 # {keyword}
//                               </span>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-10 text-gray-500">자식 카드가 없습니다.</div>
//                 )}
//               </div>
//             </motion.div>
//           )}

//           {/* 원문 뷰 */}
//           {viewState === 'original' && (
//             <motion.div
//               key="original"
//               custom={direction}
//               variants={slideVariants}
//               initial="enter"
//               animate="center"
//               exit="exit"
//               transition={{ type: 'tween', duration: 0.5 }}
//               className="flex-1 flex flex-col"
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-xl font-semibold">원문</h3>
//                 <button onClick={moveToNextState}>
//                   <ArrowRight className="w-8 h-8 text-gray-600" />
//                 </button>
//               </div>
//               <div className="flex-1 overflow-auto">
//                 <p className="text-gray-700 whitespace-pre-line">{card.content}</p>
//               </div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>

//       {/* 카드 푸터 */}
//       <div className="relative aspect-[6/1] grid grid-cols-12 border-gray-200 border rounded-b-2xl">
//         <div className="col-span-2 flex items-center justify-center">
//           <DownloadCloud className="w-8 h-8 text-gray-600" />
//         </div>
//         <div className="col-span-7 flex flex-wrap gap-2 p-2 items-center overflow-hidden">
//           {card.keywords &&
//             card.keywords.map((keyword, idx) => (
//               <span
//                 key={idx}
//                 className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100"
//               >
//                 # {keyword}
//               </span>
//             ))}
//         </div>
//         <div className="col-span-3 flex items-center justify-center">
//           <p className="p-2 px-4 bg-black text-sm text-white rounded-full">더보기</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EnhancedCardView;
