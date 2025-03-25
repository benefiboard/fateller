//app/store/creditStore.ts

import { create } from 'zustand';

type CreditListener = (credits: number) => void;

// 타입이 지정된 리스너 배열
let listeners: CreditListener[] = [];

interface CreditState {
  creditsRemaining: number;
  lastReset: string;
  isLoading: boolean;
  fetchCredits: () => Promise<void>;
  updateCredits: (newCreditsRemaining: number) => void;
  subscribe: (listener: CreditListener) => () => void;
}
export const useCreditStore = create<CreditState>((set, get) => ({
  creditsRemaining: 10,
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

    // 등록된 모든 리스너에게 알림
    listeners.forEach((listener) => listener(newCreditsRemaining));
  },

  // 리스너 등록 함수 추가
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
}));
