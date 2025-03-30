// app/ui/ShareButton.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Share, Download, Copy, Link, Image, FileText, X, Check, Share2 } from 'lucide-react';
import {
  captureElementAsImage,
  copyElementAsImage,
  copyTextToClipboard,
  formatMemoAsMarkdown,
  useNativeShare,
} from '../utils/share';

// 공유 타입 정의
type ShareType = 'image' | 'text' | 'link';

interface ShareButtonProps {
  // 공유할 메모 데이터
  memo: any;
  // 현재 활성화된 탭 (idea, main, key, original)
  tabType: 'idea' | 'main' | 'key' | 'original' | 'thought';
  // 캡처할 요소의 ref
  contentRef: React.RefObject<HTMLElement>;
  // 버튼 스타일
  buttonClassName?: string;
  // 공유 성공 시 콜백
  onShareSuccess?: (type: ShareType) => void;
  // 공유 실패 시 콜백
  onShareError?: (type: ShareType, error: string) => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  memo,
  tabType,
  contentRef,
  buttonClassName = 'text-gray-400',
  onShareSuccess,
  onShareError,
}) => {
  // 드롭다운 상태 관리
  const [isOpen, setIsOpen] = useState(false);
  // 공유 결과 메시지 관리
  const [shareResult, setShareResult] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({
    show: false,
    success: false,
    message: '',
  });

  // 드롭다운 ref
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 결과 메시지 자동 숨김
  useEffect(() => {
    if (shareResult.show) {
      const timer = setTimeout(() => {
        setShareResult((prev) => ({ ...prev, show: false }));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [shareResult.show]);

  // 이미지로 다운로드
  const handleDownloadImage = async () => {
    // 드롭다운 메뉴 닫기 (가장 먼저 실행)
    setIsOpen(false);

    if (!contentRef.current) {
      showResult(false, '캡처할 요소를 찾을 수 없습니다.');
      return;
    }

    try {
      const fileName = `BrainLabeling_${tabType}_${memo.id || new Date().getTime()}`;
      const success = await captureElementAsImage(contentRef.current, fileName);

      if (success) {
        showResult(true, '이미지가 다운로드되었습니다.');
        onShareSuccess?.('image');
      } else {
        showResult(false, '이미지 다운로드에 실패했습니다.');
        onShareError?.('image', '이미지 생성 실패');
      }
    } catch (error) {
      showResult(false, '이미지 생성 중 오류가 발생했습니다.');
      onShareError?.('image', '예기치 않은 오류');
    }
  };

  // 이미지를 클립보드에 복사
  const handleCopyImage = async () => {
    // 드롭다운 메뉴 닫기 (가장 먼저 실행)
    setIsOpen(false);

    if (!contentRef.current) {
      showResult(false, '캡처할 요소를 찾을 수 없습니다.');
      return;
    }

    try {
      const success = await copyElementAsImage(contentRef.current);

      if (success) {
        showResult(true, '이미지가 클립보드에 복사되었습니다.');
        onShareSuccess?.('image');
      } else {
        showResult(false, '이미지 복사에 실패했습니다.');
        onShareError?.('image', '클립보드 접근 거부');
      }
    } catch (error) {
      showResult(false, '이미지 복사 중 오류가 발생했습니다.');
      onShareError?.('image', '예기치 않은 오류');
    }
  };

  // 텍스트를 클립보드에 복사
  const handleCopyText = async () => {
    try {
      const formattedText = formatMemoAsMarkdown(memo, tabType);
      const success = await copyTextToClipboard(formattedText);

      if (success) {
        showResult(true, '텍스트가 클립보드에 복사되었습니다.');
        onShareSuccess?.('text');
      } else {
        showResult(false, '텍스트 복사에 실패했습니다.');
        onShareError?.('text', '클립보드 접근 거부');
      }
    } catch (error) {
      showResult(false, '텍스트 복사 중 오류가 발생했습니다.');
      onShareError?.('text', '예기치 않은 오류');
    }

    setIsOpen(false);
  };

  // 링크 복사 (메모의 원본 URL이 있는 경우)
  const handleCopyLink = async () => {
    if (!memo.original_url) {
      showResult(false, '복사할 링크가 없습니다.');
      return;
    }

    try {
      const success = await copyTextToClipboard(memo.original_url);

      if (success) {
        showResult(true, '링크가 클립보드에 복사되었습니다.');
        onShareSuccess?.('link');
      } else {
        showResult(false, '링크 복사에 실패했습니다.');
        onShareError?.('link', '클립보드 접근 거부');
      }
    } catch (error) {
      showResult(false, '링크 복사 중 오류가 발생했습니다.');
      onShareError?.('link', '예기치 않은 오류');
    }

    setIsOpen(false);
  };

  // 네이티브 공유 (모바일 환경)
  const handleNativeShare = async () => {
    const formattedText = formatMemoAsMarkdown(memo, tabType);

    try {
      // 원문 URL이 없는 경우 URL 매개변수 없이 호출
      const shareUrl = memo.original_url || undefined;

      const success = await useNativeShare(
        memo.title || 'BrainLabeling 공유',
        formattedText,
        shareUrl
      );

      if (success) {
        showResult(true, '공유 성공!');
        onShareSuccess?.('text');
      } else {
        // 네이티브 공유가 지원되지 않는 경우(PC) 텍스트 복사로 대체
        handleCopyText();
      }
    } catch (error) {
      showResult(false, '공유 중 오류가 발생했습니다.');
      onShareError?.('text', '예기치 않은 오류');
      // 오류 발생 시 텍스트 복사 시도
      handleCopyText();
    }

    setIsOpen(false);
  };

  // 결과 메시지 표시
  const showResult = (success: boolean, message: string) => {
    setShareResult({
      show: true,
      success,
      message,
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 공유 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`share-button flex flex-col items-center  p-1 rounded-full hover:bg-gray-100 transition-colors ${buttonClassName}`}
        aria-label="공유 옵션"
      >
        <Share2 size={20} />
        {/* <p className="text-xs  tracking-tighter">공유</p> */}
      </button>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="py-1">
            {/* 네이티브 공유 (모바일 환경에서만 표시) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Share size={16} className="mr-2 text-emerald-500" />
                <span>공유하기</span>
              </button>
            )}

            {/* 이미지 다운로드 */}
            <button
              onClick={handleDownloadImage}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Download size={16} className="mr-2 text-emerald-500" />
              <span>이미지 다운로드</span>
            </button>

            {/* 이미지 복사 */}
            <button
              onClick={handleCopyImage}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Image size={16} className="mr-2 text-emerald-500" />
              <span>이미지 복사</span>
            </button>

            {/* 텍스트 복사 */}
            <button
              onClick={handleCopyText}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <FileText size={16} className="mr-2 text-emerald-500" />
              <span>텍스트 복사</span>
            </button>

            {/* 링크 복사 (원본 URL이 있는 경우만) */}
            {memo.original_url && (
              <button
                onClick={handleCopyLink}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Link size={16} className="mr-2 text-emerald-500" />
                <span>원본 링크 복사</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 결과 메시지 */}
      {shareResult.show && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg z-50 flex items-center text-sm ${
            shareResult.success ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {shareResult.success ? (
            <Check size={16} className="mr-2" />
          ) : (
            <X size={16} className="mr-2" />
          )}
          <span>{shareResult.message}</span>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
