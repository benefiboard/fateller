// utils/share.ts
import { toPng } from 'html-to-image';

/**
 * HTML 태그를 처리하는 함수 - <hi> 태그 등 특수 태그 처리
 */
const processHtmlTags = (text: string): string => {
  if (!text) return '';

  // <hi> 태그 처리 (하이라이팅을 위한 특수 태그)
  let processedText = text.replace(/<hi>(.*?)<\/hi>/g, '$1');

  // 일반 HTML 태그 제거
  return processedText.replace(/<[^>]*>/g, '');
};

/**
 * 리스트 기호 타입을 확인하고 반환
 */
const analyzeListPrefix = (text: string) => {
  if (!text) {
    return {
      hasPrefix: false,
      type: 'none',
      originalText: text,
      contentText: text,
      indentLevel: 0,
    };
  }

  // 앞쪽 공백 제거한 텍스트
  const trimmedText = text.trim();

  // 공백이 얼마나 있었는지 계산 (들여쓰기 레벨 판단에 도움)
  const leadingSpaces = text.length - text.trimStart().length;

  // 숫자 패턴 (예: "1. ", "2. ")
  const numberMatch = trimmedText.match(/^(\d+\.\s+)(.*)$/);
  if (numberMatch) {
    return {
      hasPrefix: true,
      type: 'number',
      originalText: text,
      contentText: numberMatch[2],
      indentLevel: Math.floor(leadingSpaces / 2),
    };
  }

  // 검은 원형 기호 (•)
  if (trimmedText.startsWith('• ')) {
    return {
      hasPrefix: true,
      type: 'bullet',
      originalText: text,
      contentText: trimmedText.substring(2),
      indentLevel: Math.floor(leadingSpaces / 2),
    };
  }

  // 빈 원형 기호 (◦)
  if (trimmedText.startsWith('◦ ')) {
    return {
      hasPrefix: true,
      type: 'circle',
      originalText: text,
      contentText: trimmedText.substring(2),
      indentLevel: Math.floor(leadingSpaces / 2) + 1,
    };
  }

  // 대시 기호 (-)
  if (trimmedText.startsWith('- ')) {
    return {
      hasPrefix: true,
      type: 'dash',
      originalText: text,
      contentText: trimmedText.substring(2),
      indentLevel: Math.floor(leadingSpaces / 2),
    };
  }

  // 별표 기호 (*)
  if (trimmedText.startsWith('* ')) {
    return {
      hasPrefix: true,
      type: 'asterisk',
      originalText: text,
      contentText: trimmedText.substring(2),
      indentLevel: Math.floor(leadingSpaces / 2),
    };
  }

  // 기호 없음
  return {
    hasPrefix: false,
    type: 'none',
    originalText: text,
    contentText: text,
    indentLevel: Math.floor(leadingSpaces / 2),
  };
};

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
 * 메모 콘텐츠를 일반 텍스트 형식으로 포맷팅합니다.
 * 섹션 헤더 없이 콘텐츠만 출력하고, 섹션 타이틀에는 넘버링을 추가합니다.
 */
export const formatMemoAsMarkdown = (memo: any, tabType: string): string => {
  let text = '';

  // 공통 헤더 - 제목만 유지
  text += `${memo.title || '제목 없음'}\n\n`;

  // 탭 유형에 따라 다른 포맷팅 적용
  switch (tabType) {
    case 'idea': // 아이디어(case 0)
      // 핵심 문장 - 섹션 제목 없이 내용만 추가
      text += `${processHtmlTags(memo.labeling?.key_sentence || '')}\n\n`;

      if (memo.labeling?.keywords && memo.labeling.keywords.length > 0) {
        // 키워드 - 섹션 제목 없이 내용만 추가
        text += `${memo.labeling.keywords.map((keyword: string) => `#${keyword}`).join(' ')}\n\n`;
      }
      break;

    case 'main': // 주요 내용(case 1)
      if (memo.thread && memo.thread.length > 0) {
        // 섹션 제목 없이 내용만 추가
        memo.thread.forEach((item: string, index: number) => {
          const cleanText = processHtmlTags(item);
          const prefixInfo = analyzeListPrefix(cleanText);

          if (prefixInfo.hasPrefix) {
            // 이미 기호가 있으면 들여쓰기 레벨에 맞게 처리
            const indentation = '  '.repeat(prefixInfo.indentLevel);
            text += `${indentation}${prefixInfo.originalText}\n`;
          } else {
            // 없으면 번호 추가
            text += `${index + 1}. ${cleanText}\n`;
          }
        });
        text += '\n';
      }
      break;

    case 'key': // 핵심 문장(case 2)
      try {
        let content = memo.tweet_main;
        let parsed = null;

        // JSON 파싱 시도
        if (typeof content === 'string' && content.trim().startsWith('{')) {
          try {
            parsed = JSON.parse(content);
          } catch (e) {
            parsed = null;
          }
        } else if (typeof content === 'object' && content !== null) {
          parsed = content;
        }

        if (parsed && parsed.sections && Array.isArray(parsed.sections)) {
          // 섹션 제목 없이 내용만 추가

          parsed.sections.forEach((section: any, sectionIndex: number) => {
            // 섹션 헤더를 넘버링과 함께 표시 (예: "1. 현황 및 배경")
            const sectionTitle = processHtmlTags(section.heading || '섹션');
            text += `${sectionIndex + 1}. ${sectionTitle.toUpperCase()}\n`;

            if (section.points && Array.isArray(section.points)) {
              section.points.forEach((point: string) => {
                const cleanPoint = processHtmlTags(point || '');
                const prefixInfo = analyzeListPrefix(cleanPoint);

                if (prefixInfo.hasPrefix) {
                  if (prefixInfo.type === 'circle') {
                    // '◦' 기호는 들여쓰기하여 계층 구조 표현
                    text += `    ${prefixInfo.originalText}\n`;
                  } else {
                    // 다른 기호는 그대로 표시
                    text += `${prefixInfo.originalText}\n`;
                  }
                } else {
                  // 기호가 없으면 '•' 추가
                  text += `• ${cleanPoint}\n`;
                }
              });
            }

            if (section.sub_sections && Array.isArray(section.sub_sections)) {
              section.sub_sections.forEach((sub: any) => {
                // 하위 섹션 헤더를 들여쓰기와 함께 표시
                const subTitle = processHtmlTags(sub.sub_heading || '하위 섹션');
                text += ` >> ${subTitle}\n`;

                if (sub.sub_points && Array.isArray(sub.sub_points)) {
                  sub.sub_points.forEach((point: string) => {
                    const cleanPoint = processHtmlTags(point || '');
                    const prefixInfo = analyzeListPrefix(cleanPoint);

                    if (prefixInfo.hasPrefix) {
                      if (prefixInfo.type === 'circle') {
                        // '◦' 기호는 들여쓰기하여 계층 구조 표현
                        text += `    ${prefixInfo.originalText}\n`;
                      } else {
                        // 다른 기호는 들여쓰기 레벨에 맞게 처리
                        const indentation = '  '.repeat(prefixInfo.indentLevel + 1);
                        text += `${indentation}${prefixInfo.originalText}\n`;
                      }
                    } else {
                      // 기호가 없고 하위 섹션이므로 '◦' 추가하고 들여쓰기
                      text += `    ◦ ${cleanPoint}\n`;
                    }
                  });
                }
              });
            }

            text += '\n';
          });
        } else {
          // 일반 문자열인 경우 또는 구조화된 데이터가 아닌 경우
          if (typeof content === 'string') {
            // 여러 줄로 분리하여 각 줄마다 분석
            const lines = content.split('\n');

            // 섹션 제목 없이 내용만 추가
            let sectionIndex = 0;
            lines.forEach((line) => {
              const cleanLine = processHtmlTags(line.trim());
              if (!cleanLine) return; // 빈 줄 무시

              const prefixInfo = analyzeListPrefix(cleanLine);

              if (prefixInfo.hasPrefix) {
                if (prefixInfo.type === 'bullet') {
                  // '•' 기호는 그대로 유지
                  text += `${prefixInfo.originalText}\n`;
                } else if (prefixInfo.type === 'circle') {
                  // '◦' 기호는 들여쓰기하여 계층 구조 표현
                  text += `    ${prefixInfo.originalText}\n`;
                } else {
                  // 다른 기호는 들여쓰기 레벨에 맞게 처리
                  const indentation = '  '.repeat(prefixInfo.indentLevel);
                  text += `${indentation}${prefixInfo.originalText}\n`;
                }
              } else {
                // 기호 없는 텍스트 - 섹션 타이틀로 간주하고 넘버링 추가
                sectionIndex++;
                text += `${sectionIndex}. ${cleanLine.toUpperCase()}\n`;
              }
            });

            text += '\n';
          } else {
            // 객체인 경우 JSON 문자열로 변환 (섹션 제목 없이)
            text += `${JSON.stringify(content, null, 2)}\n\n`;
          }
        }
      } catch (e) {
        // JSON 파싱 실패 시 단순 텍스트로 처리 (섹션 제목 없이)
        let content = memo.tweet_main;
        text += `${
          typeof content === 'string' ? processHtmlTags(content) : JSON.stringify(content)
        }\n\n`;
      }
      break;

    case 'original': // 원문(case 3)
      if (memo.original_url) {
        // '원본 링크' 제목 없이 URL만 추가
        text += `${memo.original_url}\n\n`;
      }

      if (memo.original_text) {
        // '원문 내용' 제목 없이 텍스트만 추가
        text += `${memo.original_text}\n\n`;
      }
      break;

    default:
      text += `${memo.title || '제목 없음'}\n\n`;
      break;
  }

  // 공통 푸터
  text += `---\nBrainLabel에서 공유됨 | ${new Date().toLocaleDateString('ko-KR')}`;

  return text;
};

/**
 * 모바일 기기에서 네이티브 공유 다이얼로그를 사용합니다.
 * PC 환경 및 URL이 없는 경우에도 적절히 처리합니다.
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
    // URL이 있는 경우에만 포함, 없으면 텍스트만 공유
    if (url) {
      await navigator.share({
        title,
        text,
        url,
      });
    } else {
      // URL 없이 텍스트만 공유
      await navigator.share({
        title,
        text,
      });
    }
    return true;
  } catch (error) {
    console.error('공유 중 오류 발생:', error);
    return false;
  }
};
