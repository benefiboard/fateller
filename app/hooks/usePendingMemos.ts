// app/hooks/usePendingMemos.ts
'use client';

import { useState, useCallback } from 'react';

export type PendingMemoStatus = 'extracting' | 'analyzing' | 'completed' | 'error';

export interface PendingMemo {
  id: string;
  status: PendingMemoStatus;
  inputText: string;
  extractedData?: {
    title?: string;
    imageUrl?: string;
    content?: string;
    sourceUrl?: string;
  };
  error?: string;
  createdAt: Date;
}

const usePendingMemos = () => {
  const [pendingMemos, setPendingMemos] = useState<PendingMemo[]>([]);

  // 대기 중인 메모 추가
  const addPendingMemo = useCallback((inputText: string): string => {
    const id = `pending-${Date.now()}`;
    setPendingMemos((prev) => [
      ...prev,
      {
        id,
        status: 'extracting',
        inputText,
        createdAt: new Date(),
      },
    ]);
    return id;
  }, []);

  // 메모 상태 업데이트
  const updatePendingMemo = useCallback(
    (id: string, updates: Partial<Omit<PendingMemo, 'id' | 'createdAt'>>) => {
      setPendingMemos((prev) =>
        prev.map((memo) => (memo.id === id ? { ...memo, ...updates } : memo))
      );
    },
    []
  );

  // 완료된 메모 제거
  const removePendingMemo = useCallback((id: string) => {
    setPendingMemos((prev) => prev.filter((memo) => memo.id !== id));
  }, []);

  // 모든 대기 메모 제거 (새로 추가)
  const removeAllPendingMemos = useCallback(() => {
    setPendingMemos([]);
  }, []);

  return {
    pendingMemos,
    addPendingMemo,
    updatePendingMemo,
    removePendingMemo,
    removeAllPendingMemos, // 여기에 내보내기 추가
  };
};

export default usePendingMemos;
