// app/utils/backgroundTaskManager.ts - 수정된 버전

import { extractAndAnalyze } from '../utils/apiClient';

// 타입 정의 추가
export type TaskStatus = 'extracting' | 'processing' | 'analyzing' | 'completed' | 'error';
export type TaskCallback = (taskId: string, status: TaskStatus, data?: any) => void;
export type CompleteCallback = (taskId: string, data: any) => void;
export type ErrorCallback = (taskId: string, message: string) => void;

export interface TaskCallbacks {
  onStateChange?: TaskCallback;
  onComplete?: CompleteCallback;
  onError?: ErrorCallback;
}

// 백그라운드 작업 관리자
class BackgroundTaskManager {
  private tasks = new Map<string, any>();
  private timers = new Map<string, NodeJS.Timeout[]>();

  // 작업 생성
  createTask(taskId: string, options: any = {}) {
    // 작업 정보 초기화
    this.tasks.set(taskId, {
      id: taskId,
      status: 'idle',
      data: options.initialData || {},
      timestamps: {
        created: Date.now(),
      },
    });

    // 해당 작업의 타이머 배열 초기화
    this.timers.set(taskId, []);

    return taskId;
  }

  // 타이머 설정 및 관리
  setTaskTimer(taskId: string, callback: () => void, delay: number) {
    const timerId = setTimeout(callback, delay);

    // 작업별 타이머 추적
    if (this.timers.has(taskId)) {
      this.timers.get(taskId)?.push(timerId);
    } else {
      this.timers.set(taskId, [timerId]);
    }

    return timerId;
  }

  // URL 추출 및 처리 실행 - 변수명 일관성 수정
  async processUrl(taskId: string, url: string, callbacks: TaskCallbacks = {}) {
    try {
      const { onStateChange, onComplete, onError } = callbacks;

      // 상태 변경 알림
      onStateChange?.(taskId, 'extracting', { message: '내용 추출 중...' });

      // API 호출 - 변수명 extractData로 통일
      const extractData = await extractAndAnalyze(url);

      // 처리 단계로 전환 - extractData로 통일
      onStateChange?.(taskId, 'processing', {
        message: '데이터 정제 중...',
        extractData: extractData,
      });

      // 분석 단계로 전환 - extractData로 통일
      this.setTaskTimer(
        taskId,
        () => {
          onStateChange?.(taskId, 'analyzing', {
            message: 'AI 분석 중...',
            extractData: extractData,
          });

          // 완료 처리 - extractData로 통일
          this.setTaskTimer(
            taskId,
            () => {
              onStateChange?.(taskId, 'completed', { extractData });
              onComplete?.(taskId, extractData);

              // 메모리에서 완료된 작업 정리
              this.setTaskTimer(taskId, () => this.clearTask(taskId), 3000);
            },
            2000
          );
        },
        2000
      );

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      callbacks.onError?.(taskId, errorMessage);
      return false;
    }
  }

  // 작업 취소
  cancelTask(taskId: string) {
    // 작업의 모든 타이머 정리
    if (this.timers.has(taskId)) {
      this.timers.get(taskId)?.forEach((id) => clearTimeout(id));
      this.timers.delete(taskId);
    }

    // 작업 정보 삭제
    this.tasks.delete(taskId);
  }

  // 모든 작업 취소
  cancelAllTasks() {
    // 모든 타이머 정리
    this.timers.forEach((timerIds) => {
      timerIds.forEach((id) => clearTimeout(id));
    });

    // 모든 작업 정보 정리
    this.timers.clear();
    this.tasks.clear();
  }

  // 작업 정리
  private clearTask(taskId: string) {
    this.cancelTask(taskId);
  }
}

// 싱글톤 인스턴스 export
export const backgroundTaskManager = new BackgroundTaskManager();
