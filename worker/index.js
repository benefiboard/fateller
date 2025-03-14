/* 서비스 워커 코드 - JavaScript 버전 */

// 백그라운드 동기화 설정
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-memos') {
    event.waitUntil(syncMemos());
  }
});

// 오프라인 상태에서 저장된 메모를 동기화하는 함수
async function syncMemos() {
  try {
    // IndexedDB에서 동기화되지 않은 메모 가져오기 로직
    console.log('오프라인 메모 동기화 중...');
  } catch (error) {
    console.error('동기화 실패:', error);
  }
}

// 푸시 알림 수신 처리
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'BrainLabel 알림';
  const options = {
    body: data.body || '새로운 인사이트가 발견되었습니다.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // 열린 창이 없으면 새로운 창 열기
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }

      return Promise.resolve();
    })
  );
});

// 서비스 워커가 온라인으로 돌아왔을 때 실행할 작업
self.addEventListener('message', (event) => {
  if (event.data === 'ONLINE_AGAIN') {
    // 온라인 상태로 돌아왔을 때 동기화 작업 실행
    self.registration.sync.register('sync-memos').catch((err) => {
      console.error('동기화 등록 실패:', err);
    });
  }
});

// 특정 URL 패턴에 대한 맞춤형 캐싱 전략
self.addEventListener('fetch', (event) => {
  // BrainLabel 이미지 관련 요청을 위한 커스텀 캐싱
  if (event.request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    const cacheName = 'brainlabel-images';
    event.respondWith(
      caches
        .open(cacheName)
        .then(async (cache) => {
          const cacheResponse = await cache.match(event.request);
          if (cacheResponse) {
            // 캐시된 응답이 있으면 반환하되, 백그라운드에서 갱신
            event.waitUntil(
              fetch(event.request).then((response) => {
                cache.put(event.request, response.clone());
                return response;
              })
            );
            return cacheResponse;
          }

          // 캐시된 응답이 없으면 네트워크 요청하고 캐시
          const response = await fetch(event.request);
          cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => {
          // 오프라인이고 캐시도 없을 경우 기본 이미지 제공
          return caches.match('/icons/placeholder-image.jpg');
        })
    );
  }
});

// 백그라운드에서 정기적인 메모 인덱싱 작업
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-memos-index') {
    event.waitUntil(updateMemosSearchIndex());
  }
});

async function updateMemosSearchIndex() {
  try {
    // 인덱싱 작업 구현
    console.log('메모 검색 인덱스 업데이트 중...');
  } catch (error) {
    console.error('인덱스 업데이트 실패:', error);
  }
}
