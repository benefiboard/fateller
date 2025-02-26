import React from 'react';
import { Edit, Trash2, RefreshCw } from 'lucide-react';
import { Memo, Profile } from '../utils/types';
import MemoContent from './MemoContent';
import MemoActionButtons from './MemoActionButtons';

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
  return (
    <div className="p-4">
      <div className="flex">
        {/* 프로필 이미지 */}
        <div className="mr-[6px]">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* 메모 콘텐츠 */}
        <div className="flex-1">
          {/* 헤더 - 이름, 카테고리, 시간 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-bold text-gray-900">{profile.name}</span>
              <span className="text-teal-500 ml-1 text-sm font-semibold">
                @{memo.labeling.category}
              </span>
              <span className="text-gray-500 ml-1 text-sm">· {memo.time}</span>
            </div>

            {/* 메모 관리 버튼 */}
            <div className="flex space-x-2">
              {/* 일반 수정 버튼 */}
              <button
                onClick={() => onEdit(memo)}
                className="text-gray-400 hover:text-teal-500 flex items-center text-xs"
                title="직접 수정"
              >
                <Edit size={16} className="mr-1" />
                <span>수정</span>
              </button>

              {/* AI 재분석 버튼 */}
              <button
                onClick={() => onAnalyze(memo)}
                className="text-gray-400 hover:text-blue-500 flex items-center text-xs"
                title="AI 재분석"
              >
                <RefreshCw size={16} className="mr-1" />
                <span>재분석</span>
              </button>

              {/* 삭제 버튼 */}
              <button
                onClick={() => memo.id && onDelete(memo.id)}
                className="text-gray-400 hover:text-red-500 flex items-center text-xs"
                title="삭제"
              >
                <Trash2 size={16} className="mr-1" />
                <span>삭제</span>
              </button>
            </div>
          </div>

          {/* 메모 콘텐츠 */}
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
          <MemoActionButtons memo={memo} onLike={onLike} onRetweet={onRetweet} onReply={onReply} />
        </div>
      </div>
    </div>
  );
};

export default MemoItem;
