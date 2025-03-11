//app/utils/url-normalizer.ts

// 다양한 URL 형식을 표준화하는 함수
export function normalizeUrl(url: string): string {
  try {
    // 1. URL 객체 생성 (유효하지 않은 URL은 예외 발생)
    const urlObj = new URL(url);

    // 2. 프로토콜 정규화 (http → https)
    urlObj.protocol = 'https:';

    // 3. 유튜브 URL 정규화
    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be') {
      // 유튜브 ID 추출
      let videoId = null;

      // youtu.be 형식
      if (urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.substring(1);
      }
      // youtube.com/watch?v= 형식
      else if (urlObj.pathname.includes('/watch')) {
        videoId = urlObj.searchParams.get('v');
      }
      // youtube.com/embed/ 형식
      else if (urlObj.pathname.includes('/embed/')) {
        videoId = urlObj.pathname.split('/embed/')[1];
      }

      // 유효한 ID면 표준 형식으로 변환
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
    }

    // 4. 네이버 블로그 정규화 (모바일 ↔ PC)
    if (urlObj.hostname === 'm.blog.naver.com' || urlObj.hostname === 'blog.naver.com') {
      // 경로에서 사용자명과 포스트 ID 추출 (/사용자명/포스트ID)
      const pathParts = urlObj.pathname.split('/').filter(Boolean);

      if (pathParts.length >= 2) {
        const username = pathParts[0];
        const postId = pathParts[1];

        // 항상 PC 버전 URL로 통일
        return `https://blog.naver.com/${username}/${postId}`;
      }
    }

    // 5. UTM 추적 파라미터 제거
    const paramsToRemove = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ocid',
      'ref',
      'source',
    ];

    paramsToRemove.forEach((param) => {
      urlObj.searchParams.delete(param);
    });

    // 6. 최종 정규화된 URL 반환
    return urlObj.toString();
  } catch (e) {
    console.error('URL 정규화 오류:', e);
    return url; // 오류 발생 시 원래 URL 반환
  }
}

// URL 타입 감지 함수
export function detectUrlType(url: string): 'youtube' | 'naver_blog' | 'website' {
  try {
    const urlObj = new URL(url);

    if (urlObj.hostname.includes('youtube.com') || urlObj.hostname === 'youtu.be') {
      return 'youtube';
    } else if (urlObj.hostname === 'blog.naver.com' || urlObj.hostname === 'm.blog.naver.com') {
      return 'naver_blog';
    } else {
      return 'website';
    }
  } catch (e) {
    return 'website'; // 파싱 실패 시 기본값
  }
}
