'use client';

import { useState } from 'react';
import TTSDialog from './TTSDialog';
import { CirclePlay, Volume2 } from 'lucide-react';

interface TTSButtonProps {
  text?: string;
  displayText?: string;
  className?: string;
  buttonText?: string;
  showLabel?: boolean; // 듣기 라벨 표시 여부
  originalImage?: string; // 이미지 URL
}

export default function TTSButtonMainMemo({
  text = '',
  displayText = '',
  className = '',
  buttonText = '음성으로 듣기',
  showLabel = false,
  originalImage = '', // 기본값 설정
}: TTSButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-1 cursor-pointer" onClick={openDialog}>
        <CirclePlay className="text-emerald-600 w-5 h-5 -mt-1" />
        {/* <Volume2 className="text-emerald-600 w-6 h-6" /> */}
        {showLabel && <p className="text-emerald-600 font-semibold">요약재생</p>}
      </div>

      <TTSDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        initialText={text}
        originalImage={originalImage}
      />
    </>
  );
}
