// store/memosStore.ts
import { create } from 'zustand';
import { Memo } from '@/app/utils/types';

interface MemosState {
  memos: Memo[];
  setMemos: (memos: Memo[]) => void;
  updateMemo: (updatedMemo: Memo) => void;
  removeMemo: (id: string) => void;
}

export const useMemosStore = create<MemosState>((set) => ({
  memos: [],
  setMemos: (memos) => set({ memos }),
  updateMemo: (updatedMemo) =>
    set((state) => ({
      memos: state.memos.map((memo) => (memo.id === updatedMemo.id ? updatedMemo : memo)),
    })),
  removeMemo: (id) =>
    set((state) => ({
      memos: state.memos.filter((memo) => memo.id !== id),
    })),
}));
