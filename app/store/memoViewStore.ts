// app/store/memoViewStore.ts
import { create } from 'zustand';

interface MemoViewState {
  selectedMemoId: string | null;
  setSelectedMemoId: (id: string | null) => void;
}

export const useMemoViewStore = create<MemoViewState>((set) => ({
  selectedMemoId: null,
  setSelectedMemoId: (id) => set({ selectedMemoId: id }),
}));
