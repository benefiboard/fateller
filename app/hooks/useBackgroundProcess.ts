// app/hooks/useBackgroundProcess.ts
import { useState, useCallback, useEffect } from 'react';
import { backgroundTaskManager } from '../utils/backgroundTaskManager';

export default function useBackgroundProcess() {
  // 작업이 종료될 때 호출할 콜백 함수
  const registerCleanup = useCallback(() => {
    return () => {
      // 컴포넌트 언마운트 시 모든 작업 정리
      backgroundTaskManager.cancelAllTasks();
    };
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(registerCleanup, [registerCleanup]);

  // URL 처리 함수
  const processUrl = useCallback((url: string, options: any = {}) => {
    const taskId = options.taskId || `task-${Date.now()}`;
    backgroundTaskManager.createTask(taskId, { initialData: { url } });

    backgroundTaskManager.processUrl(taskId, url, {
      onStateChange: options.onStateChange,
      onComplete: options.onComplete,
      onError: options.onError,
    });

    return taskId;
  }, []);

  // 작업 취소 함수
  const cancelTask = useCallback((taskId: string) => {
    backgroundTaskManager.cancelTask(taskId);
  }, []);

  return {
    processUrl,
    cancelTask,
    cancelAllTasks: backgroundTaskManager.cancelAllTasks.bind(backgroundTaskManager),
  };
}
