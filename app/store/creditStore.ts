// app/store/creditStore.ts
import { create } from 'zustand';

interface CreditState {
  creditsRemaining: number;
  lastReset: string;
  isLoading: boolean;
  fetchCredits: () => Promise<void>;
  updateCredits: (newCreditsRemaining: number) => void;
}

export const useCreditStore = create<CreditState>((set) => ({
  creditsRemaining: 10, // 기본값
  lastReset: new Date().toISOString().split('T')[0],
  isLoading: false,

  fetchCredits: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/credits');
      if (response.ok) {
        const data = await response.json();
        set({
          creditsRemaining: data.remaining,
          lastReset: data.lastReset,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('크레딧 정보를 가져오는 중 오류 발생:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateCredits: (newCreditsRemaining) => {
    set({ creditsRemaining: newCreditsRemaining });
  },
}));
