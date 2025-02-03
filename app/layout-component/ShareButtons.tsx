// ShareButtons.tsx
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, Share2, Check, Copy } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ShareButtonsProps {
  targetElementId?: string;
  title: string;
  content: string;
  fileName?: string;
  className?: string;
  showDownload?: boolean;
  isReady?: boolean;
}

export const ShareButtons = ({
  targetElementId,
  title,
  content,
  fileName = 'image',
  className = '',
  showDownload = true,
  isReady = false,
}: ShareButtonsProps) => {
  const [isCopying, setIsCopying] = useState(false);

  const formatDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day}_${hours}:${minutes}`;
  };

  const getShareText = (text: string) => {
    return `${title}\n${text}_${formatDate()}\n#위썸 #에브리데이위썸 #www.wissome.com`;
  };

  // 이미지 캡처 유틸리티 함수
  const captureImage = async () => {
    if (!targetElementId) return null;
    const element = document.getElementById(targetElementId);
    if (!element) return null;

    try {
      // 원본 이미지 캡처
      const originalDataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        skipAutoScale: true,
        style: {
          transform: 'scale(1)',
        },
      });

      // 새 캔버스 생성
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');

      // 원본 이미지 로드
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = originalDataUrl;
      });

      if (ctx) {
        const scale = Math.min(1000 / img.width, 1000 / img.height);
        const x = (1000 - img.width * scale) / 2;
        const y = (1000 - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      }

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('이미지 캡처 중 오류 발생:', error);
      return null;
    }
  };

  // 이미지 다운로드 함수
  const handleDownload = async () => {
    if (!isReady) {
      alert('컨텐츠가 준비되지 않았습니다.');
      return;
    }

    try {
      const dataUrl = await captureImage();
      if (!dataUrl) {
        throw new Error('이미지 생성 실패');
      }

      const link = document.createElement('a');
      link.download = `${fileName}_${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('이미지 저장 중 오류 발생:', error);
      alert('이미지 저장 중 오류가 발생했습니다.');
    }
  };

  // SNS 공유 함수
  const handleShare = async () => {
    if (!isReady) {
      alert('컨텐츠가 준비되지 않았습니다.');
      return;
    }

    try {
      let shareData: any = {
        title,
        text: getShareText(content),
      };

      if (targetElementId) {
        const dataUrl = await captureImage();
        if (dataUrl) {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
          shareData.files = [file];
        }
      }

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(getShareText(content));
        alert('공유하기가 지원되지 않아 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.error('공유 중 오류 발생:', error);
      alert('공유 중 오류가 발생했습니다.');
    }
  };
  // 클립보드 복사 함수
  const handleCopy = async () => {
    if (!isReady) {
      alert('컨텐츠가 준비되지 않았습니다.');
      return;
    }

    try {
      setIsCopying(true);

      if (targetElementId) {
        const dataUrl = await captureImage();
        if (dataUrl) {
          try {
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const clipboardItem = new ClipboardItem({
              'image/png': blob,
            });
            await navigator.clipboard.write([clipboardItem]);
            await navigator.clipboard.writeText(getShareText(content));
            alert('이미지와 텍스트가 클립보드에 복사되었습니다.');
          } catch (imageError) {
            console.error('Image copy failed:', imageError);
            await navigator.clipboard.writeText(getShareText(content));
            alert('텍스트만 복사되었습니다. (이미지 복사 실패)');
          }
        } else {
          await navigator.clipboard.writeText(getShareText(content));
          alert('텍스트만 복사되었습니다. (이미지 캡처 실패)');
        }
      } else {
        await navigator.clipboard.writeText(getShareText(content));
        alert('텍스트가 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.error('복사 중 오류 발생:', error);
      try {
        await navigator.clipboard.writeText(getShareText(content));
        alert('텍스트만 복사되었습니다.');
      } catch (finalError) {
        alert('클립보드 복사 중 오류가 발생했습니다.');
      }
    } finally {
      setTimeout(() => setIsCopying(false), 1000);
    }
  };

  return (
    <div
      className={`grid ${
        showDownload && targetElementId ? 'grid-cols-3' : 'grid-cols-2'
      } gap-1 ${className}`}
    >
      {showDownload && targetElementId && (
        <Button
          onClick={handleDownload}
          variant="outline"
          className="w-full border-brand-200 text-sm tracking-tighter text-brand-600 hover:bg-brand-50"
          disabled={!isReady}
        >
          <span className="flex items-center justify-center gap-1">
            <DownloadIcon className="w-4 h-4" />
            저장
          </span>
        </Button>
      )}
      <Button
        onClick={handleShare}
        variant="outline"
        className="w-full border-brand-200 text-brand-600 hover:bg-brand-50"
        disabled={!isReady}
      >
        <span className="flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          공유
        </span>
      </Button>
      <Button
        onClick={handleCopy}
        variant="outline"
        className="w-full border-brand-200 text-brand-600 hover:bg-brand-50"
        disabled={!isReady || isCopying}
      >
        <span className="flex items-center justify-center gap-2">
          {isCopying ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          복사
        </span>
      </Button>
    </div>
  );
};
