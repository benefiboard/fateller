//app/store/creditStore.ts

'use client';

import { create } from 'zustand';

type CreditListener = (credits: number) => void;

// 타입이 지정된 리스너 배열
let listeners: CreditListener[] = [];

// 마지막 API 호출 시간을 저장할 변수
let lastFetchTime = 0;
const FETCH_COOLDOWN = 2000; // 2초 간격 제한

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
    // 이미 로딩 중이면 중복 호출 방지
    if (get().isLoading) return;

    // API 호출 간격 제한 (1초)
    const now = Date.now();
    if (now - lastFetchTime < FETCH_COOLDOWN) return;
    lastFetchTime = now;

    set({ isLoading: true });
    try {
      const response = await fetch('/api/credits', {
        headers: { 'Cache-Control': 'no-cache' },
        // 중복 요청 방지를 위한 캐시 방지 헤더
      });

      if (response.ok) {
        const data = await response.json();

        // 변경된 값이 있을 때만 상태 업데이트
        const current = get();
        if (current.creditsRemaining !== data.remaining || current.lastReset !== data.lastReset) {
          set({
            creditsRemaining: data.remaining,
            lastReset: data.lastReset,
          });
        }
      }
    } catch (error) {
      console.error('크레딧 정보를 가져오는 중 오류 발생:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateCredits: (newCreditsRemaining) => {
    // 값이 변경된 경우에만 상태 업데이트 및 리스너 알림
    if (get().creditsRemaining !== newCreditsRemaining) {
      set({ creditsRemaining: newCreditsRemaining });

      // 등록된 모든 리스너에게 알림
      listeners.forEach((listener) => listener(newCreditsRemaining));
    }
  },

  // 리스너 등록 함수 추가
  subscribe: (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
}));
