// app/layout-component/GlobalComposer.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import ComposerModal from '../ui/ComposerModal';
import { MessageCirclePlus, ChevronsUp } from 'lucide-react';
import { Profile } from '../utils/types';
import { useComposerStore } from '../store/composerStore';

export default function GlobalComposer(): JSX.Element {
  const { isOpen, mode, editingMemoId, closeComposer, handleNewMemo } = useComposerStore();
  const { memoHandlers } = useComposerStore();

  // 스크롤 상태 관리
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // 프로필 정보
  const profile: Profile = {
    name: 'BrainLabel',
    username: '@brainlabel_ai',
    avatar: '/avatar_base.svg',
  };

  // 스크롤 리스너
  useEffect(() => {
    const handleScroll = (): void => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 최상단으로 스크롤
  const handleScrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 현재 수정 중인 메모 찾기
  const editingMemo = useMemo(() => {
    if (editingMemoId && memoHandlers?.memos) {
      return memoHandlers.memos.find((memo) => memo.id === editingMemoId);
    }
    return undefined;
  }, [editingMemoId, memoHandlers?.memos]);

  return (
    <>
      {/* 플로팅 액션 버튼들 */}
      <div className="fixed flex flex-col gap-2 bottom-20 right-4 z-10 md:bottom-8">
        {showScrollTop && (
          <button
            onClick={handleScrollToTop}
            className="w-12 h-12 rounded-full bg-emerald-400 text-white flex items-center justify-center shadow-lg lg:w-14 lg:h-14"
          >
            <ChevronsUp size={24} className="lg:hidden" />
            <ChevronsUp size={32} className="hidden lg:block" />
          </button>
        )}

        <button
          onClick={handleNewMemo}
          className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg lg:w-14 lg:h-14"
        >
          <MessageCirclePlus size={24} className="lg:hidden" />
          <MessageCirclePlus size={32} className="hidden lg:block" />
        </button>
      </div>

      {/* 글로벌 ComposerModal */}
      {isOpen && memoHandlers && (
        <ComposerModal
          isOpen={isOpen}
          mode={mode}
          editingMemo={editingMemo}
          onClose={closeComposer}
          onSubmit={memoHandlers.onSubmit}
          onBackgroundProcess={memoHandlers.onBackgroundProcess}
          onBackgroundProcessWithAlert={memoHandlers.onBackgroundProcessWithAlert}
          profile={profile}
        />
      )}
    </>
  );
}
