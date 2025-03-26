'use client';

import { useState } from 'react';
import TTSDialog from './TTSDialog';
import { Volume2 } from 'lucide-react';

interface TTSButtonProps {
  text?: string;
  displayText?: string;
  className?: string;
  buttonText?: string;
  showLabel?: boolean; // Add option to show/hide the "듣기" label
}

export default function TTSButton({
  text = '',
  displayText = '',
  className = '',
  buttonText = '음성으로 듣기',
  showLabel = false, // Default to not showing the label
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
        {showLabel && <p className="text-emerald-600 text-sm font-semibold">듣기</p>}
        <Volume2 className="text-emerald-600 w-5 h-5" />
      </div>

      <TTSDialog isOpen={isDialogOpen} onClose={closeDialog} initialText={text} />
    </>
  );
}
