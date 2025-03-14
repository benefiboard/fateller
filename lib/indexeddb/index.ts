'use client';

// IndexedDB를 사용하기 위한 유틸리티 함수들

const DB_NAME = 'brainlabel-offline-db';
const DB_VERSION = 1;
const MEMO_STORE = 'memos';
const SYNC_QUEUE_STORE = 'sync-queue';

/**
 * IndexedDB 데이터베이스를 초기화합니다.
 */
export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('이 브라우저는 IndexedDB를 지원하지 않습니다.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(new Error('IndexedDB 데이터베이스를 열 수 없습니다.'));
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 메모 저장소 생성
      if (!db.objectStoreNames.contains(MEMO_STORE)) {
        const memoStore = db.createObjectStore(MEMO_STORE, { keyPath: 'id' });
        memoStore.createIndex('modifiedAt', 'modifiedAt', { unique: false });
        memoStore.createIndex('categoryId', 'categoryId', { unique: false });
      }

      // 동기화 대기열 저장소 생성
      if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
        const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        syncStore.createIndex('operation', 'operation', { unique: false });
        syncStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * 메모를 오프라인 저장소에 저장합니다.
 */
export async function saveMemoOffline(memo: any): Promise<any> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEMO_STORE], 'readwrite');
    const store = transaction.objectStore(MEMO_STORE);

    // 현재 타임스탬프 추가
    const memoWithTimestamp = {
      ...memo,
      modifiedAt: new Date().toISOString(),
      _offlineCreated: !memo.id, // 새로 생성된 메모인지 표시
    };

    // 임시 ID 생성 (서버에서 생성되지 않은 경우)
    if (!memoWithTimestamp.id) {
      memoWithTimestamp.id = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    const request = store.put(memoWithTimestamp);

    request.onsuccess = () => {
      // 동기화 대기열에 추가
      addToSyncQueue({
        operation: memoWithTimestamp._offlineCreated ? 'create' : 'update',
        memoId: memoWithTimestamp.id,
        data: memoWithTimestamp,
        createdAt: new Date().toISOString(),
      });

      resolve(memoWithTimestamp);
    };

    request.onerror = () => {
      reject(new Error('메모를 오프라인 저장소에 저장하지 못했습니다.'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * 메모를 오프라인 저장소에서 가져옵니다.
 */
export async function getMemoOffline(id: string): Promise<any> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEMO_STORE], 'readonly');
    const store = transaction.objectStore(MEMO_STORE);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error('메모를 오프라인 저장소에서 가져오지 못했습니다.'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * 모든 메모를 오프라인 저장소에서 가져옵니다.
 */
export async function getAllMemosOffline(): Promise<any[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([MEMO_STORE], 'readonly');
    const store = transaction.objectStore(MEMO_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error('메모를 오프라인 저장소에서 가져오지 못했습니다.'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * 동기화 대기열에 작업을 추가합니다.
 */
export async function addToSyncQueue(operation: any): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);

    const request = store.add(operation);

    request.onsuccess = () => {
      resolve();
      // 백그라운드 동기화 등록 시도
      if (navigator.serviceWorker && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          // TypeScript 오류 방지를 위한 타입 체크 및 안전한 접근
          if ('sync' in registration) {
            (registration as any).sync.register('sync-memos').catch((err: Error) => {
              console.error('백그라운드 동기화 등록 실패:', err);
            });
          }
        });
      }
    };

    request.onerror = () => {
      reject(new Error('동기화 대기열에 작업을 추가하지 못했습니다.'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * 동기화 대기열에서 작업을 가져옵니다.
 */
export async function getSyncQueue(): Promise<any[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(new Error('동기화 대기열을 가져오지 못했습니다.'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * 동기화 대기열에서 작업을 제거합니다.
 */
export async function removeFromSyncQueue(id: number): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error('동기화 대기열에서 작업을 제거하지 못했습니다.'));
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * 오프라인 상태를 확인합니다.
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * 오프라인 상태 변경을 감지하는 이벤트 리스너를 등록합니다.
 */
export function registerOfflineListeners(onOffline: () => void, onOnline: () => void): () => void {
  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);

  // 정리 함수 반환
  return () => {
    window.removeEventListener('offline', onOffline);
    window.removeEventListener('online', onOnline);
  };
}
