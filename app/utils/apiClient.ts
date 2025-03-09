// utils/apiClient.ts
type RequestCache = {
  [url: string]: {
    timestamp: number;
    promise: Promise<any>;
  };
};

// API 요청 캐시: 동일 URL 요청을 캐싱해서 중복 호출 방지
const requestCache: RequestCache = {};

// 캐시 유효 시간 (ms)
const CACHE_TTL = 5000; // 5초

/**
 * 중복 API 요청을 방지하는 fetch 래퍼
 */
export const fetchWithCache = async (url: string, options: RequestInit = {}) => {
  // 캐시 키 생성 (URL + body로 구성하여 동일 API에 다른 파라미터는 별도 요청으로 처리)
  const body = options.body ? options.body.toString() : '';
  const cacheKey = `${url}:${body}`;
  const now = Date.now();

  // 캐시 클린업
  Object.keys(requestCache).forEach((key) => {
    if (now - requestCache[key].timestamp > CACHE_TTL) {
      delete requestCache[key];
    }
  });

  // 이미 진행 중인 동일 요청이 있는지 확인
  if (requestCache[cacheKey]) {
    console.log('동일한 API 요청이 이미 진행 중입니다. 중복 요청 방지:', cacheKey);
    return requestCache[cacheKey].promise;
  }

  // 새 요청 실행 및 캐싱
  const fetchPromise = fetch(url, options).then(async (response) => {
    // 요청 완료 후 캐시에서 제거 (성공이든 실패든)
    setTimeout(() => {
      delete requestCache[cacheKey];
    }, 100); // 약간의 버퍼 시간을 두어 동일 시점에 여러 요청이 들어오는 경우 방지

    // 응답 처리
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      throw new Error(errorData.error || `API 요청 실패: ${response.status}`);
    }

    return response.json();
  });

  // 요청을 캐시에 저장
  requestCache[cacheKey] = {
    timestamp: now,
    promise: fetchPromise,
  };

  return fetchPromise;
};

/**
 * extract-and-analyze API를 위한 전용 함수
 */
export const extractAndAnalyze = async (text: string) => {
  return fetchWithCache('/api/extract-and-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
};

/**
 * labeling API를 위한 전용 함수
 */
export const labelContent = async (text: string, originalTitle = '', originalImage = '') => {
  return fetchWithCache('/api/labeling', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, originalTitle, originalImage }),
  });
};
