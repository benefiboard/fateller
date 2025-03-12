// app/store/searchStore.ts 파일 생성
import { create } from 'zustand';

interface SearchState {
  searchVisible: boolean;
  toggleSearch: () => void;
  showSearch: () => void;
  hideSearch: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchVisible: false,
  toggleSearch: () => set((state) => ({ searchVisible: !state.searchVisible })),
  showSearch: () => set({ searchVisible: true }),
  hideSearch: () => set({ searchVisible: false }),
}));
