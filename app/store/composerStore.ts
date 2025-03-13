// app/store/composerStore.ts
import { create } from 'zustand';
import { Memo } from '@/app/utils/types';

// 스토어 상태 타입 정의
interface ComposerState {
  // 모달 상태
  isOpen: boolean;
  mode: 'direct' | 'analyze';
  editingMemoId: string | null;

  // 콜백 관련 의존성
  memoHandlers: {
    onSubmit: (data: any) => Promise<void>;
    onBackgroundProcess: (data: any) => Promise<void>;
    onBackgroundProcessWithAlert: (data: any, message: string) => void;
    memos: Memo[];
    deleteMemo: (id: string) => Promise<void>;
  } | null;

  // 액션 함수들
  setMemoHandlers: (handlers: NonNullable<ComposerState['memoHandlers']>) => void;
  openComposer: (mode: 'direct' | 'analyze', memoId?: string | null) => void;
  closeComposer: () => void;
  handleEdit: (memo: Memo) => void;
  handleAnalyze: (memo: Memo) => void;
  handleNewMemo: () => void;
}

// 핸들러 비교 함수 수정 - memos는 비교하지 않음
function areHandlersEqual(prev: any, next: any): boolean {
  if (!prev || !next) return prev === next;

  // 핵심 함수만 비교하고 memos는 비교하지 않음
  return (
    prev.onSubmit === next.onSubmit &&
    prev.onBackgroundProcess === next.onBackgroundProcess &&
    prev.onBackgroundProcessWithAlert === next.onBackgroundProcessWithAlert &&
    prev.deleteMemo === next.deleteMemo
    // memos는 비교하지 않음 - 이게 무한 루프의 주요 원인
  );
}

export const useComposerStore = create<ComposerState>((set, get) => ({
  // 모달 상태
  isOpen: false,
  mode: 'analyze',
  editingMemoId: null,

  // 콜백 관련 의존성들
  memoHandlers: null,

  // 의존성 설정 함수 - 깊은 비교 사용
  setMemoHandlers: (handlers) => {
    // 이전 핸들러와 깊은 비교
    const prevHandlers = get().memoHandlers;

    // 핸들러가 없거나 변경되었을 때만 업데이트
    if (!prevHandlers || !areHandlersEqual(prevHandlers, handlers)) {
      // console.log('핸들러 업데이트됨');
      // handlers.memos 속성 처리 - 수정 중요!
      set({
        memoHandlers: {
          ...handlers,
          memos: [], // 항상 빈 배열 사용 - 무한 루프 방지
        },
      });
    }
  },

  // 모달 열기 함수
  openComposer: (mode, memoId = null) => {
    if (!memoId && mode === 'direct') {
      console.error('새 메모는 AI 분석 모드로만 작성할 수 있습니다.');
      return;
    }

    set({
      isOpen: true,
      mode,
      editingMemoId: memoId,
    });
  },

  // 모달 닫기 함수
  closeComposer: () => set({ isOpen: false }),

  // 액션 함수들
  handleEdit: (memo) => {
    if (memo && memo.id) {
      get().openComposer('direct', memo.id);
    }
  },

  handleAnalyze: (memo) => {
    if (memo && memo.id) {
      get().openComposer('analyze', memo.id);
    }
  },

  // 신규 메모 생성 액션
  handleNewMemo: () => {
    get().openComposer('analyze', null);
  },
}));
