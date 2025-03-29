// app/store/navigationStore.ts
import { create } from 'zustand';

interface NavigationState {
  lastViewedMemoId: string | null;
  hasScrolledTo: string | null;
  setLastViewedMemoId: (id: string) => void;
  markAsScrolled: (id: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  // 마지막으로 본 메모 ID
  lastViewedMemoId: null,

  // 스크롤이 완료된 메모 ID (중복 스크롤 방지용)
  hasScrolledTo: null,

  // 메모 ID 저장 함수
  setLastViewedMemoId: (id) => {
    // ID 저장하고 스크롤 상태 초기화
    set({
      lastViewedMemoId: id,
      hasScrolledTo: null,
    });
  },

  // 스크롤 완료 표시 함수
  markAsScrolled: (id) => set({ hasScrolledTo: id }),
}));
