// utils/requestTracker.ts - 수정된 버전
export const RequestTracker = {
  _processing: new Map<string, number>(),

  isProcessing(url: string): boolean {
    const now = Date.now();
    this._cleanup(now);
    return this._processing.has(url);
  },

  startProcessing(url: string): void {
    this._processing.set(url, Date.now());
  },

  finishProcessing(url: string): void {
    this._processing.delete(url);
  },

  // 오래된 항목 정리 - ES5 호환 버전
  _cleanup(currentTime: number): void {
    const TIMEOUT = 30000; // 30초

    // Map.entries() 대신 Array.from 사용
    const entries = Array.from(this._processing.keys());

    // 각 URL 확인 및 만료된 항목 제거
    entries.forEach((url) => {
      const timestamp = this._processing.get(url);
      if (timestamp && currentTime - timestamp > TIMEOUT) {
        this._processing.delete(url);
      }
    });
  },
};
