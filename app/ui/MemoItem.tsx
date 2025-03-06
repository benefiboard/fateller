// // app/ui/MemoItem.tsx
// 'use client';

// import React, { useState } from 'react';
// import {
//   MoreHorizontal,
//   Heart,
//   Repeat,
//   MessageCircle,
//   Share,
//   Pencil,
//   RotateCcw,
//   Eraser,
// } from 'lucide-react';
// import { Memo, Profile } from '../utils/types';
// import MemoContent from './MemoContent';

// interface MemoItemProps {
//   memo: Memo;
//   profile: Profile;
//   memoState: {
//     expanded: boolean;
//     showLabeling: boolean;
//     showOriginal: boolean;
//   };
//   onToggleThread: (id: string) => void;
//   onToggleLabeling: (id: string) => void;
//   onToggleOriginal: (id: string) => void;
//   onEdit: (memo: Memo) => void;
//   onAnalyze: (memo: Memo) => void;
//   onDelete: (id: string) => void;
//   onLike: (id: string) => void;
//   onRetweet: (id: string) => void;
//   onReply: (id: string) => void;
// }

// const MemoItem: React.FC<MemoItemProps> = ({
//   memo,
//   profile,
//   memoState,
//   onToggleThread,
//   onToggleLabeling,
//   onToggleOriginal,
//   onEdit,
//   onAnalyze,
//   onDelete,
//   onLike,
//   onRetweet,
//   onReply,
// }) => {
//   // 옵션 드롭다운 상태
//   const [showOptions, setShowOptions] = useState(false);

//   const toggleOptions = () => {
//     setShowOptions(!showOptions);
//   };

//   // 좋아요, 리트윗, 댓글 수 (기본값)
//   const stats = memo.stats || { likes: 0, retweets: 0, replies: 0 };

//   return (
//     <article className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
//       <div className="flex">
//         {/* 프로필 이미지 */}
//         <div className="mr-3 flex-shrink-0">
//           <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
//             <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
//           </div>
//         </div>

//         {/* 메모 내용 */}
//         <div className="flex-1 min-w-0">
//           {/* 헤더 - 이름, 카테고리, 시간 및 옵션 */}
//           <div className="flex items-start justify-between">
//             <div className="flex items-center">
//               <span className="font-bold text-gray-900 mr-1 hover:underline">{profile.name}</span>
//               <span className="text-gray-500 text-sm">
//                 @{profile.username?.replace('@', '') || 'brainlabel_ai'} · {memo.time || '방금 전'}
//               </span>
//             </div>

//             {/* 옵션 메뉴 */}
//             <div className="relative">
//               <button
//                 onClick={toggleOptions}
//                 className="text-gray-500 hover:text-emerald-400 p-1 rounded-full hover:bg-emerald-50"
//               >
//                 <MoreHorizontal size={18} />
//               </button>

//               {/* 드롭다운 메뉴 */}
//               {showOptions && (
//                 <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-10">
//                   <div className="py-1">
//                     <button
//                       onClick={() => {
//                         onEdit(memo);
//                         setShowOptions(false);
//                       }}
//                       className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       <Pencil size={18} className="text-gray-600" />

//                       <p>수정 하기</p>
//                     </button>
//                     <button
//                       onClick={() => {
//                         onAnalyze(memo);
//                         setShowOptions(false);
//                       }}
//                       className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       <Share size={18} className="text-gray-600" />

//                       <p>공유 하기</p>
//                     </button>
//                     <button
//                       onClick={() => {
//                         onAnalyze(memo);
//                         setShowOptions(false);
//                       }}
//                       className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       <RotateCcw size={18} className="text-gray-600" />

//                       <p>AI 재분석</p>
//                     </button>
//                     <button
//                       onClick={() => {
//                         memo.id && onDelete(memo.id);
//                         setShowOptions(false);
//                       }}
//                       className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                     >
//                       <Eraser size={18} className="text-gray-600" />

//                       <p>삭제 하기</p>
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* 메모 내용 */}
//           <MemoContent
//             memo={memo}
//             expanded={memoState.expanded}
//             showLabeling={memoState.showLabeling}
//             showOriginal={memoState.showOriginal}
//             onToggleThread={() => memo.id && onToggleThread(memo.id)}
//             onToggleLabeling={() => memo.id && onToggleLabeling(memo.id)}
//             onToggleOriginal={() => memo.id && onToggleOriginal(memo.id)}
//           />

//           {/* 액션 버튼 */}
//           {/* <div className="flex justify-between mt-3 max-w-md pr-8">
//             <button
//               onClick={() => memo.id && onReply(memo.id)}
//               className="flex items-center text-gray-500 hover:text-emerald-400 group"
//             >
//               <div className="p-2 rounded-full group-hover:bg-emerald-50 mr-1">
//                 <MessageCircle size={18} />
//               </div>
//               <span className="text-sm">{stats.replies}</span>
//             </button>

//             <button
//               onClick={() => memo.id && onRetweet(memo.id)}
//               className="flex items-center text-gray-500 hover:text-green-500 group"
//             >
//               <div className="p-2 rounded-full group-hover:bg-green-50 mr-1">
//                 <Repeat size={18} />
//               </div>
//               <span className="text-sm">{stats.retweets}</span>
//             </button>

//             <button
//               onClick={() => memo.id && onLike(memo.id)}
//               className={`flex items-center ${
//                 memo.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
//               } group`}
//             >
//               <div
//                 className={`p-2 rounded-full ${
//                   memo.liked ? 'bg-red-50' : 'group-hover:bg-red-50'
//                 } mr-1`}
//               >
//                 <Heart size={18} fill={memo.liked ? 'currentColor' : 'none'} />
//               </div>
//               <span className="text-sm">{stats.likes}</span>
//             </button>

//             <button className="flex items-center text-gray-500 hover:text-emerald-400 group">
//               <div className="p-2 rounded-full group-hover:bg-emerald-50">
//                 <Share size={18} />
//               </div>
//             </button>
//           </div> */}
//         </div>
//       </div>
//     </article>
//   );
// };

// export default MemoItem;

// app/ui/MemoItem.tsx
'use client';

import React, { useState } from 'react';
import {
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  Share,
  BookmarkPlus,
  Network,
  Lightbulb,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { Memo, Profile } from '../utils/types';
import MemoContent from './MemoContent';

interface MemoItemProps {
  memo: Memo;
  profile: Profile;
  memoState: {
    expanded: boolean;
    showLabeling: boolean;
    showOriginal: boolean;
  };
  onToggleThread: (id: string) => void;
  onToggleLabeling: (id: string) => void;
  onToggleOriginal: (id: string) => void;
  onEdit: (memo: Memo) => void;
  onAnalyze: (memo: Memo) => void;
  onDelete: (id: string) => void;
  onShare?: (memo: Memo) => void; // 공유 기능 추가
  onFindRelated?: (id: string) => void; // 관련 메모 찾기 기능 추가
  onGenerateInsight?: (id: string) => void; // 인사이트 생성 기능 추가
}

const MemoItem: React.FC<MemoItemProps> = ({
  memo,
  profile,
  memoState,
  onToggleThread,
  onToggleLabeling,
  onToggleOriginal,
  onEdit,
  onAnalyze,
  onDelete,
  onShare,
  onFindRelated,
  onGenerateInsight,
}) => {
  // 옵션 드롭다운 상태
  const [showOptions, setShowOptions] = useState(false);

  // 새로운 상태: 저장됨 표시
  const [isSaved, setIsSaved] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // 처리 함수들
  const handleShare = () => {
    if (onShare && memo) {
      onShare(memo);
    }
    setShowOptions(false);
  };

  const handleFindRelated = () => {
    if (onFindRelated && memo.id) {
      onFindRelated(memo.id);
    }
    setShowOptions(false);
  };

  const handleGenerateInsight = () => {
    if (onGenerateInsight && memo.id) {
      onGenerateInsight(memo.id);
    }
    setShowOptions(false);
  };

  // 저장 토글
  const toggleSave = () => {
    setIsSaved(!isSaved);
    // 여기에 저장 API 호출 또는 상태 업데이트 로직 추가
  };

  // 원본 URL로 이동하는 함수
  const openOriginalSource = () => {
    if (memo.original_text && isValidUrl(memo.original_text)) {
      window.open(memo.original_text, '_blank');
    }
  };

  // URL 유효성 검사
  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <article className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex">
        {/* 카테고리 아이콘 (프로필 이미지 대신) */}
        <div className="mr-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Tag size={20} />
          </div>
        </div>

        {/* 메모 내용 */}
        <div className="flex-1 min-w-0">
          {/* 헤더 - 카테고리, 시간 및 옵션 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <span className="font-bold text-emerald-600 text-sm px-2 py-0.5 bg-emerald-50 rounded-full mr-2">
                {memo.labeling?.category || '미분류'}
              </span>
              <span className="text-gray-500 text-sm">{memo.time || '방금 전'}</span>
            </div>

            {/* 옵션 메뉴 */}
            <div className="relative">
              <button
                onClick={toggleOptions}
                className="text-gray-500 hover:text-emerald-400 p-1 rounded-full hover:bg-emerald-50"
              >
                <MoreHorizontal size={18} />
              </button>

              {/* 드롭다운 메뉴 - 지식 관리 시스템에 맞게 수정 */}
              {showOptions && (
                <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-52 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(memo);
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Pencil size={16} className="text-gray-600" />
                      <p>메모 수정</p>
                    </button>

                    <button
                      onClick={handleShare}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Share size={16} className="text-gray-600" />
                      <p>공유하기</p>
                    </button>

                    <button
                      onClick={() => {
                        onAnalyze(memo);
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <RotateCcw size={16} className="text-gray-600" />
                      <p>AI 재분석</p>
                    </button>

                    <button
                      onClick={handleFindRelated}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Network size={16} className="text-gray-600" />
                      <p>관련 메모 찾기</p>
                    </button>

                    <button
                      onClick={handleGenerateInsight}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Lightbulb size={16} className="text-gray-600" />
                      <p>인사이트 생성</p>
                    </button>

                    <button
                      onClick={() => {
                        memo.id && onDelete(memo.id);
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} className="text-red-600" />
                      <p>삭제하기</p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 메모 내용 */}
          <MemoContent
            memo={memo}
            expanded={memoState.expanded}
            showLabeling={memoState.showLabeling}
            showOriginal={memoState.showOriginal}
            onToggleThread={() => memo.id && onToggleThread(memo.id)}
            onToggleLabeling={() => memo.id && onToggleLabeling(memo.id)}
            onToggleOriginal={() => memo.id && onToggleOriginal(memo.id)}
          />

          {/* 지식 관리 액션 버튼 - 주석 처리된 트위터 스타일 버튼을 대체 */}
          {/* <div className="flex justify-between mt-3   text-sm text-gray-500">
           
            <button
              onClick={toggleSave}
              className="flex items-center hover:text-emerald-600 transition-colors"
            >
              <BookmarkPlus size={18} className={isSaved ? 'text-emerald-500 mr-1' : 'mr-1'} />
              <span>{isSaved ? '저장됨' : '저장'}</span>
            </button>

           
            <button
              onClick={handleFindRelated}
              className="flex items-center hover:text-emerald-600 transition-colors"
            >
              <Network size={18} className="mr-1" />
              <span>관련 메모</span>
            </button>

            
            <button
              onClick={handleGenerateInsight}
              className="flex items-center hover:text-emerald-600 transition-colors"
            >
              <Lightbulb size={18} className="mr-1" />
              <span>인사이트</span>
            </button>

            
            {memo.original_text && isValidUrl(memo.original_text) && (
              <button
                onClick={openOriginalSource}
                className="flex items-center hover:text-emerald-600 transition-colors"
              >
                <ExternalLink size={18} className="mr-1" />
                <span>원본</span>
              </button>
            )}
          </div> */}

          {/* 유사도 표시 및 연결된 메모 개수 (필요시 활성화) */}
          {/*
          <div className="mt-2 text-xs flex items-center text-gray-500">
            <Network size={14} className="mr-1" />
            <span>8개의 메모와 연결됨</span>
            <span className="mx-2">•</span>
            <span>유사도 92%</span>
          </div>
          */}
        </div>
      </div>
    </article>
  );
};

export default MemoItem;
