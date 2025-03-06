// app/ui/MemoItem.tsx
'use client';

import React, { useState } from 'react';
import { MoreHorizontal, Heart, Repeat, MessageCircle, Share } from 'lucide-react';
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
  onLike: (id: string) => void;
  onRetweet: (id: string) => void;
  onReply: (id: string) => void;
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
  onLike,
  onRetweet,
  onReply,
}) => {
  // 옵션 드롭다운 상태
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // 좋아요, 리트윗, 댓글 수 (기본값)
  const stats = memo.stats || { likes: 0, retweets: 0, replies: 0 };

  return (
    <article className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex">
        {/* 프로필 이미지 */}
        <div className="mr-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* 메모 내용 */}
        <div className="flex-1 min-w-0">
          {/* 헤더 - 이름, 카테고리, 시간 및 옵션 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <span className="font-bold text-gray-900 mr-1 hover:underline">{profile.name}</span>
              <span className="text-gray-500 text-sm">
                @{profile.username?.replace('@', '') || 'brainlabel_ai'} · {memo.time || '방금 전'}
              </span>
            </div>

            {/* 옵션 메뉴 */}
            <div className="relative">
              <button
                onClick={toggleOptions}
                className="text-gray-500 hover:text-emerald-400 p-1 rounded-full hover:bg-emerald-50"
              >
                <MoreHorizontal size={18} />
              </button>

              {/* 드롭다운 메뉴 */}
              {showOptions && (
                <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(memo);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      직접 수정
                    </button>
                    <button
                      onClick={() => {
                        onAnalyze(memo);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      AI 재분석
                    </button>
                    <button
                      onClick={() => {
                        memo.id && onDelete(memo.id);
                        setShowOptions(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      삭제하기
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

          {/* 액션 버튼 */}
          <div className="flex justify-between mt-3 max-w-md pr-8">
            <button
              onClick={() => memo.id && onReply(memo.id)}
              className="flex items-center text-gray-500 hover:text-emerald-400 group"
            >
              <div className="p-2 rounded-full group-hover:bg-emerald-50 mr-1">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm">{stats.replies}</span>
            </button>

            <button
              onClick={() => memo.id && onRetweet(memo.id)}
              className="flex items-center text-gray-500 hover:text-green-500 group"
            >
              <div className="p-2 rounded-full group-hover:bg-green-50 mr-1">
                <Repeat size={18} />
              </div>
              <span className="text-sm">{stats.retweets}</span>
            </button>

            <button
              onClick={() => memo.id && onLike(memo.id)}
              className={`flex items-center ${
                memo.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              } group`}
            >
              <div
                className={`p-2 rounded-full ${
                  memo.liked ? 'bg-red-50' : 'group-hover:bg-red-50'
                } mr-1`}
              >
                <Heart size={18} fill={memo.liked ? 'currentColor' : 'none'} />
              </div>
              <span className="text-sm">{stats.likes}</span>
            </button>

            <button className="flex items-center text-gray-500 hover:text-emerald-400 group">
              <div className="p-2 rounded-full group-hover:bg-emerald-50">
                <Share size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default MemoItem;
