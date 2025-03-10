// utils/share.ts
import { toPng } from 'html-to-image';

// utils/share.ts - DOM 요소 캡처 함수 수정

/**
 * DOM 요소를 이미지로 캡처하여 다운로드합니다.
 * @param element 캡처할 DOM 요소 (ref.current)
 * @param fileName 다운로드될 파일 이름 (확장자 제외)
 */
export const captureElementAsImage = async (
  element: HTMLElement | null,
  fileName: string = 'shared_content'
): Promise<boolean> => {
  if (!element) {
    console.error('캡처할 요소가 없습니다');
    return false;
  }

  // 공유 버튼을 찾아서 임시로 숨김
  const shareButtons = element.querySelectorAll('.share-button');
  const originalShareButtonStyles: string[] = [];

  shareButtons.forEach((button) => {
    originalShareButtonStyles.push((button as HTMLElement).style.display);
    (button as HTMLElement).style.display = 'none';
  });

  // 원래 스타일 저장
  const originalPadding = element.style.padding;
  const originalBorderRadius = element.style.borderRadius;
  const originalBackgroundColor = element.style.backgroundColor;

  // 스타일 적용
  element.style.padding = '16px';
  element.style.borderRadius = '0.5rem'; // rounded-lg와 동일
  element.style.backgroundColor = '#ffffff'; // 배경색 지정 (선택적)

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
      skipAutoScale: true,
      style: {
        transform: 'scale(1)',
      },
    });

    // 스타일 복원
    element.style.padding = originalPadding;
    element.style.borderRadius = originalBorderRadius;
    element.style.backgroundColor = originalBackgroundColor;

    // 공유 버튼 스타일 복원
    shareButtons.forEach((button, index) => {
      (button as HTMLElement).style.display = originalShareButtonStyles[index];
    });

    const link = document.createElement('a');
    const date = new Date().toLocaleDateString('ko-KR').replace(/\./g, '').replace(/ /g, '');
    link.download = `${fileName}_${date}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('이미지 생성 중 오류 발생:', error);

    // 오류 발생 시에도 스타일 복원
    element.style.padding = originalPadding;
    element.style.borderRadius = originalBorderRadius;
    element.style.backgroundColor = originalBackgroundColor;

    shareButtons.forEach((button, index) => {
      (button as HTMLElement).style.display = originalShareButtonStyles[index];
    });

    return false;
  }
};

/**
 * DOM 요소를 이미지로 캡처하여 클립보드에 복사합니다.
 * @param element 캡처할 DOM 요소 (ref.current)
 */
export const copyElementAsImage = async (element: HTMLElement | null): Promise<boolean> => {
  if (!element) {
    console.error('캡처할 요소가 없습니다');
    return false;
  }

  // 공유 버튼을 찾아서 임시로 숨김
  const shareButtons = element.querySelectorAll('.share-button');
  const originalShareButtonStyles: string[] = [];

  shareButtons.forEach((button) => {
    originalShareButtonStyles.push((button as HTMLElement).style.display);
    (button as HTMLElement).style.display = 'none';
  });

  // 원래 스타일 저장
  const originalPadding = element.style.padding;
  const originalBorderRadius = element.style.borderRadius;
  const originalBackgroundColor = element.style.backgroundColor;

  // 스타일 적용
  element.style.padding = '16px';
  element.style.borderRadius = '0.5rem'; // rounded-lg와 동일
  element.style.backgroundColor = '#ffffff'; // 배경색 지정 (선택적)

  try {
    const dataUrl = await toPng(element, {
      quality: 1.0,
      pixelRatio: 2,
    });

    // 스타일 복원
    element.style.padding = originalPadding;
    element.style.borderRadius = originalBorderRadius;
    element.style.backgroundColor = originalBackgroundColor;

    // 공유 버튼 스타일 복원
    shareButtons.forEach((button, index) => {
      (button as HTMLElement).style.display = originalShareButtonStyles[index];
    });

    // 클립보드에 이미지 복사 시도
    const blob = await fetch(dataUrl).then((res) => res.blob());

    try {
      // 최신 클립보드 API 사용
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      return true;
    } catch (clipboardError) {
      console.error('클립보드 복사 실패:', clipboardError);

      // 대체 방법: 사용자에게 이미지를 수동으로 복사하도록 안내
      const img = document.createElement('img');
      img.src = dataUrl;
      img.style.position = 'fixed';
      img.style.pointerEvents = 'none';
      img.style.top = '-9999px';
      document.body.appendChild(img);

      // 이미지 선택
      const range = document.createRange();
      range.selectNode(img);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);

      // 복사 명령
      const success = document.execCommand('copy');
      window.getSelection()?.removeAllRanges();
      document.body.removeChild(img);

      return success;
    }
  } catch (error) {
    console.error('이미지 생성 중 오류 발생:', error);

    // 오류 발생 시에도 스타일 복원
    element.style.padding = originalPadding;
    element.style.borderRadius = originalBorderRadius;
    element.style.backgroundColor = originalBackgroundColor;

    shareButtons.forEach((button, index) => {
      (button as HTMLElement).style.display = originalShareButtonStyles[index];
    });

    return false;
  }
};
/**
 * 텍스트를 클립보드에 복사합니다.
 */
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('텍스트 복사 중 오류 발생:', error);

    // 대체 방법
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    return success;
  }
};

/**
 * 메모 콘텐츠를 마크다운 형식으로 포맷팅합니다.
 */
export const formatMemoAsMarkdown = (memo: any, tabType: string): string => {
  let markdown = '';

  // 공통 헤더
  markdown += `# ${memo.title || '제목 없음'}\n\n`;

  // 탭 유형에 따라 다른 포맷팅 적용
  switch (tabType) {
    case 'idea': // 아이디어(case 0)
      markdown += `## 핵심 문장\n\n${memo.labeling?.key_sentence || ''}\n\n`;

      if (memo.labeling?.keywords && memo.labeling.keywords.length > 0) {
        markdown += `## 키워드\n\n${memo.labeling.keywords
          .map((keyword: string) => `#${keyword}`)
          .join(' ')}\n\n`;
      }
      break;

    case 'main': // 주요 내용(case 1)
      if (memo.thread && memo.thread.length > 0) {
        markdown += `## 주요 내용\n\n`;
        memo.thread.forEach((item: string, index: number) => {
          markdown += `${index + 1}. ${item.replace(/<[^>]*>/g, '')}\n`;
        });
        markdown += '\n';
      }
      break;

    case 'key': // 핵심 문장(case 2)
      // JSON 형식인 경우
      try {
        if (typeof memo.tweet_main === 'string' && memo.tweet_main.trim().startsWith('{')) {
          const parsed = JSON.parse(memo.tweet_main);
          if (parsed.sections && Array.isArray(parsed.sections)) {
            parsed.sections.forEach((section: any) => {
              markdown += `## ${section.heading || '섹션'}\n\n`;

              if (section.points && Array.isArray(section.points)) {
                section.points.forEach((point: string) => {
                  markdown += `- ${point.replace(/<[^>]*>/g, '')}\n`;
                });
                markdown += '\n';
              }

              if (section.sub_sections && Array.isArray(section.sub_sections)) {
                section.sub_sections.forEach((sub: any) => {
                  markdown += `### ${sub.sub_heading || '하위 섹션'}\n\n`;

                  if (sub.sub_points && Array.isArray(sub.sub_points)) {
                    sub.sub_points.forEach((point: string) => {
                      markdown += `  - ${point.replace(/<[^>]*>/g, '')}\n`;
                    });
                    markdown += '\n';
                  }
                });
              }
            });
          }
        } else {
          // 일반 문자열인 경우
          markdown += `## 핵심 문장\n\n${memo.tweet_main.replace(/<[^>]*>/g, '')}\n\n`;
        }
      } catch (e) {
        // JSON 파싱 실패 시 일반 텍스트로 처리
        markdown += `## 핵심 문장\n\n${memo.tweet_main.replace(/<[^>]*>/g, '')}\n\n`;
      }
      break;

    case 'original': // 원문(case 3)
      if (memo.original_url) {
        markdown += `## 원본 링크\n\n${memo.original_url}\n\n`;
      }

      if (memo.original_text) {
        markdown += `## 원문 내용\n\n${memo.original_text}\n\n`;
      }
      break;

    default:
      markdown += `${memo.title || '제목 없음'}\n\n`;
      break;
  }

  // 공통 푸터
  markdown += `---\nBrainLabel에서 공유됨 | ${new Date().toLocaleDateString()}`;

  return markdown;
};

/**
 * 모바일 기기에서 네이티브 공유 다이얼로그를 사용합니다.
 */
export const useNativeShare = async (
  title: string,
  text: string,
  url?: string
): Promise<boolean> => {
  if (!navigator.share) {
    return false;
  }

  try {
    await navigator.share({
      title,
      text,
      url,
    });
    return true;
  } catch (error) {
    console.error('공유 중 오류 발생:', error);
    return false;
  }
};
