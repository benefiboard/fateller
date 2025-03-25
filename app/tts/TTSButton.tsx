//app/tts/TTSButton.tsx

'use client';

import { useState } from 'react';
import TTSDialog from './TTSDialog';
import { Speaker, Volume, Volume2 } from 'lucide-react';

interface TTSButtonProps {
  text?: string;
  displayText?: string; // 새로 추가: 시각적 표시용 텍스트
  className?: string;
  buttonText?: string;
}

export default function TTSButton({
  text = '',
  displayText = '', // 시각적 표시용 텍스트 (없으면 text와 동일)
  className = '',
  buttonText = '음성으로 듣기',
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
      <Volume2 className="text-gray-400 cursor-pointer" onClick={openDialog} />

      <TTSDialog isOpen={isDialogOpen} onClose={closeDialog} initialText={text} />
    </>
  );
}
