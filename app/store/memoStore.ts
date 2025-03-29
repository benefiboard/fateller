// store/memoStore.ts
import { create } from 'zustand';
import { Memo } from '@/app/utils/types';

interface MemoStore {
  memos: Record<string, Memo>; // id를 키로 사용하는 메모 맵
  currentMemo: Memo | null;
  setMemos: (memos: Memo[]) => void;
  setCurrentMemo: (memo: Memo | null) => void;
}

export const useMemoStore = create<MemoStore>((set) => ({
  memos: {},
  currentMemo: null,
  setMemos: (memos) =>
    set((state) => ({
      memos: {
        ...state.memos,
        ...Object.fromEntries(memos.map((memo) => [memo.id, memo])),
      },
    })),
  setCurrentMemo: (memo) => set({ currentMemo: memo }),
}));
