import { useState, useEffect } from 'react';
import { Memo, MemoState } from '../utils/types';

export const useMemosState = (memos: Memo[]) => {
  // 각 메모에 대한 상태를 객체로 관리
  const [memoStates, setMemoStates] = useState<Record<string, MemoState>>({});

  // memos가 변경될 때 memoStates 초기화
  useEffect(() => {
    const initialStates: Record<string, MemoState> = {};
    memos.forEach((memo) => {
      if (memo.id) {
        // 기존 상태 유지하거나 새로 초기화
        initialStates[memo.id] = memoStates[memo.id] || {
          expanded: false,
          showLabeling: false,
          showOriginal: false,
        };
      }
    });
    setMemoStates(initialStates);
  }, [memos]);

  // 메모의 주요내용 토글 함수
  const toggleThread = (id: string): void => {
    setMemoStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], expanded: !prev[id].expanded },
    }));
  };

  // 메모의 요약 토글 함수
  const toggleLabeling = (id: string): void => {
    setMemoStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], showLabeling: !prev[id].showLabeling },
    }));
  };

  // 원문 토글 함수
  const toggleOriginal = (id: string): void => {
    setMemoStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], showOriginal: !prev[id].showOriginal },
    }));
  };

  return {
    memoStates,
    toggleThread,
    toggleLabeling,
    toggleOriginal,
  };
};

export default useMemosState;
