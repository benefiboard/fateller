'use client';

import React, { useState, useCallback } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Memo } from '../utils/types';
import useMemos from '../hooks/useMemos';
import dynamic from 'next/dynamic';
import useNotification from '../hooks/useNotification';

// 동적으로 ComposerModal 불러오기
const ComposerModal = dynamic(() => import('../ui/ComposerModal'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-center mt-2">로딩 중...</p>
      </div>
    </div>
  ),
});

interface ModifyMemoButtonProps {
  memo: Memo;
  onMemoUpdated?: (updatedMemo?: Memo, isDeleted?: boolean) => void; // 타입 업데이트
  buttonStyle?: 'icon' | 'text' | 'full';
  customClassName?: string;
}

const ModifyMemoButton: React.FC<ModifyMemoButtonProps> = ({
  memo,
  onMemoUpdated,
  buttonStyle = 'icon',
  customClassName = '',
}) => {
  // 상태 관리
  const [showOptions, setShowOptions] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  // 필요한 훅 불러오기
  const { updateMemoDirect, deleteMemo } = useMemos();
  const { showNotification } = useNotification();

  // 현재 사용자 정보 (간단한 예시)
  const profile = {
    name: 'User',
    username: '@user',
    avatar: '/avatar_base.svg',
  };

  // 옵션 메뉴 토글
  const toggleOptions = useCallback(() => {
    setShowOptions((prev) => !prev);
  }, []);

  // 메모 수정 처리
  const handleEdit = useCallback(() => {
    setShowComposer(true);
    setShowOptions(false);
  }, []);

  // 컴포저 모달 닫기
  const handleCloseComposer = useCallback(() => {
    setShowComposer(false);
  }, []);

  // 메모 수정 제출 처리
  const handleSubmit = useCallback(
    async (data: any) => {
      try {
        if (data.mode === 'direct' && memo.id) {
          // updateMemoDirect가 업데이트된 메모를 반환하지 않는다면
          // 수동으로 업데이트된 메모 객체를 생성
          await updateMemoDirect(memo.id, {
            title: data.title,
            tweet_main: data.tweet_main,
            thread: data.thread,
            category: data.category,
            keywords: data.keywords,
            key_sentence: data.key_sentence,
            purpose: data.purpose || '일반',
          });

          // 메모 객체 수동 업데이트
          const updatedMemoData = {
            ...memo,
            title: data.title,
            tweet_main: data.tweet_main,
            thread: data.thread,
            labeling: {
              ...memo.labeling,
              category: data.category,
              keywords: data.keywords,
              key_sentence: data.key_sentence,
            },
            purpose: data.purpose || '일반',
          };

          showNotification('메모가 성공적으로 업데이트되었습니다.', 'success');
          if (onMemoUpdated) {
            onMemoUpdated(updatedMemoData, false);
          }
        }
        handleCloseComposer();
      } catch (error: any) {
        showNotification(`오류가 발생했습니다: ${error.message}`, 'error');
      }
    },
    [memo, updateMemoDirect, showNotification, handleCloseComposer, onMemoUpdated]
  );

  // 메모 삭제 처리
  // 메모 삭제 처리
  const handleDelete = useCallback(async () => {
    if (!memo.id) return;

    try {
      // 삭제 전에 메모 정보 복사 (필요한 속성만)
      const memoForCallback = {
        id: memo.id,
        // 다른 필수 속성들 추가
        labeling: {
          category: memo.labeling?.category || '',
          keywords: memo.labeling?.keywords || [],
          key_sentence: memo.labeling?.key_sentence || '',
        },
      };

      await deleteMemo(memo.id);
      showNotification('메모가 삭제되었습니다.', 'success');

      if (onMemoUpdated) {
        // 필수 속성이 포함된 메모 객체 전달
        onMemoUpdated(memoForCallback as Memo, true);
      }
    } catch (error: any) {
      showNotification(`삭제 중 오류가 발생했습니다: ${error.message}`, 'error');
    }
    setShowOptions(false);
  }, [memo, deleteMemo, showNotification, onMemoUpdated]);

  // 버튼 스타일에 따른 클래스 결정
  const getButtonClass = () => {
    if (customClassName) return customClassName;

    switch (buttonStyle) {
      case 'text':
        return 'flex items-center gap-1 text-gray-600 hover:text-emerald-600 px-2 py-1 rounded';
      case 'full':
        return 'w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100';
      case 'icon':
      default:
        return 'text-gray-500 hover:text-emerald-400 p-1 rounded-full hover:bg-emerald-50';
    }
  };

  // 버튼 내용 렌더링
  const renderButtonContent = () => {
    switch (buttonStyle) {
      case 'text':
        return (
          <>
            <MoreHorizontal size={16} />
            <span>옵션</span>
          </>
        );
      case 'full':
        return (
          <>
            <MoreHorizontal size={18} />
            <span>메모 옵션</span>
          </>
        );
      case 'icon':
      default:
        return <MoreHorizontal size={18} />;
    }
  };

  return (
    <div className="relative">
      {/* 메인 버튼 */}
      <button onClick={toggleOptions} className={getButtonClass()} aria-label="메모 옵션">
        {renderButtonContent()}
      </button>

      {/* 드롭다운 메뉴 */}
      {showOptions && (
        <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-52 z-10">
          <div className="py-1">
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Pencil size={16} className="text-gray-600" />
              <p>메모수정</p>
            </button>

            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} className="text-red-600" />
              <p>삭제하기</p>
            </button>
          </div>
        </div>
      )}

      {/* 메모 작성/편집 모달 */}
      {showComposer && (
        <ComposerModal
          isOpen={showComposer}
          mode="direct"
          editingMemo={memo}
          onClose={handleCloseComposer}
          onSubmit={handleSubmit}
          profile={profile}
        />
      )}
    </div>
  );
};

export default ModifyMemoButton;
