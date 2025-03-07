// app/hooks/usePendingMemos.ts
'use client';

import { useState } from 'react';

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
  const addPendingMemo = (inputText: string): string => {
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
  };

  // 메모 상태 업데이트
  const updatePendingMemo = (
    id: string,
    updates: Partial<Omit<PendingMemo, 'id' | 'createdAt'>>
  ) => {
    setPendingMemos((prev) =>
      prev.map((memo) => (memo.id === id ? { ...memo, ...updates } : memo))
    );
  };

  // 완료된 메모 제거
  const removePendingMemo = (id: string) => {
    setPendingMemos((prev) => prev.filter((memo) => memo.id !== id));
  };

  return {
    pendingMemos,
    addPendingMemo,
    updatePendingMemo,
    removePendingMemo,
  };
};

export default usePendingMemos;
