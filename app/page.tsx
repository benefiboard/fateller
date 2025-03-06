//app/page.tsx

'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

// UI 컴포넌트 임포트
import Header from './ui/Header';
import MemoItem from './ui/MemoItem';
import Notification from './ui/Notification';
import BottomNavigation from './ui/BottomNavigation';
import ComposerModal from './ui/ComposerModal';

// 훅 임포트
import useMemos from './hooks/useMemos';
import useMemosState from './hooks/useMemosState';
import useNotification from './hooks/useNotification';

// 프로필 정보
const profile = {
  name: 'BrainLabel',
  username: '@brainlabel_ai',
  avatar: 'https://placehold.co/40x40',
  verified: true,
};

const MemoPage: React.FC = () => {
  // 컴포저 모달 상태
  const [showComposer, setShowComposer] = useState(false);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<'direct' | 'analyze'>('direct');

  // 메모 관련 훅
  const {
    memos,
    isLoading,
    error: memosError,
    createMemo,
    updateMemoWithAI,
    updateMemoDirect,
    deleteMemo,
    likeMemo,
    retweetMemo,
    replyToMemo,
  } = useMemos();

  // 메모 상태 훅
  const { memoStates, toggleThread, toggleLabeling, toggleOriginal } = useMemosState(memos);

  // 알림 훅
  const { notification, showNotification } = useNotification();

  // 모달 열기 핸들러
  const handleOpenComposer = (mode: 'direct' | 'analyze', memoId?: string) => {
    if (!memoId && mode === 'direct') {
      showNotification('새 메모는 AI 분석 모드로만 작성할 수 있습니다.', 'error');
      return;
    }

    setEditMode(mode);
    setEditingMemoId(memoId || null);
    setShowComposer(true);
  };

  // 모달 닫기 핸들러
  const handleCloseComposer = () => {
    setShowComposer(false);
    setEditingMemoId(null);
  };

  // 메모 제출 처리
  const handleSubmit = async (data: any) => {
    try {
      if (data.mode === 'analyze') {
        if (editingMemoId) {
          await updateMemoWithAI(editingMemoId, data.text, {
            isUrl: data.isUrl,
            sourceUrl: data.sourceUrl,
          });
          showNotification('메모가 성공적으로 업데이트되었습니다.', 'success');
        } else {
          await createMemo(data.text, {
            isUrl: data.isUrl,
            sourceUrl: data.sourceUrl,
          });
          showNotification('새 메모가 성공적으로 생성되었습니다.', 'success');
        }
      } else if (data.mode === 'direct' && editingMemoId) {
        await updateMemoDirect(editingMemoId, {
          title: data.title,
          tweet_main: data.tweet_main,
          thread: data.thread,
          category: data.category,
          keywords: data.keywords,
          key_sentence: data.key_sentence,
        });
        showNotification('메모가 성공적으로 업데이트되었습니다.', 'success');
      }

      handleCloseComposer();
    } catch (error: any) {
      showNotification(`오류가 발생했습니다: ${error.message}`, 'error');
    }
  };

  // 메모 편집 핸들러
  const handleEdit = (memo: any) => {
    handleOpenComposer('direct', memo.id);
  };

  // 메모 분석 핸들러
  const handleAnalyze = (memo: any) => {
    handleOpenComposer('analyze', memo.id);
  };

  // 메모 삭제 핸들러
  const handleDelete = async (id: string) => {
    try {
      await deleteMemo(id);
      showNotification('메모가 삭제되었습니다.', 'success');
    } catch (error: any) {
      showNotification(`삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white overflow-hidden shadow-md min-h-screen tracking-tighter leading-snug">
      {/* 헤더 */}
      <Header />

      {/* 알림 메시지 */}
      {notification && <Notification message={notification.message} type={notification.type} />}

      {/* 메모 작성 버튼 */}
      {!showComposer && (
        <div className="fixed bottom-20 right-4 z-10">
          <button
            onClick={() => handleOpenComposer('analyze')}
            className="w-12 h-12 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg"
          >
            <MessageCircle size={24} />
          </button>
        </div>
      )}

      {/* 메모 작성/편집 모달 */}
      {showComposer && (
        <ComposerModal
          isOpen={showComposer}
          mode={editMode}
          editingMemo={editingMemoId ? memos.find((m) => m.id === editingMemoId) : undefined}
          onClose={handleCloseComposer}
          onSubmit={handleSubmit}
          profile={profile}
        />
      )}

      {/* 메모 목록 */}
      <div className="divide-y divide-gray-200">
        {memos.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
            <p>아직 메모가 없습니다. 첫 번째 메모를 작성해보세요!</p>
          </div>
        ) : (
          memos.map((memo) => (
            <MemoItem
              key={memo.id}
              memo={memo}
              profile={profile}
              memoState={
                memo.id
                  ? memoStates[memo.id] || {
                      expanded: false,
                      showLabeling: false,
                      showOriginal: false,
                    }
                  : { expanded: false, showLabeling: false, showOriginal: false }
              }
              onToggleThread={toggleThread}
              onToggleLabeling={toggleLabeling}
              onToggleOriginal={toggleOriginal}
              onEdit={handleEdit}
              onAnalyze={handleAnalyze}
              onDelete={handleDelete}
              //onLike={likeMemo}
              //onRetweet={retweetMemo}
              //onReply={replyToMemo}
            />
          ))
        )}
      </div>

      {/* 바텀 네비게이션 */}
      <BottomNavigation />
    </div>
  );
};

export default MemoPage;
