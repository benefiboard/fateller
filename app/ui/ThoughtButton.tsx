'use client';

import { useState } from 'react';
import { CirclePlus, CircleSlash, Pencil, Plus } from 'lucide-react';
import ThoughtDialog from './ThoughtDialog';

interface ThoughtButtonProps {
  memoId: string;
  initialThought?: string;
  onSaveThought: (memoId: string, thought: string) => Promise<void>;
  onDeleteThought?: (memoId: string) => Promise<void>;
}

export default function ThoughtButton({
  memoId,
  initialThought,
  onSaveThought,
  onDeleteThought,
}: ThoughtButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openDialog = () => {
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // 저장 핸들러
  const handleSave = async (thought: string) => {
    console.log('저장하려는 내용:', thought);
    console.log('메모 ID:', memoId);
    await onSaveThought(memoId, thought); // 순서 확인: 첫번째가 memoId, 두번째가 생각 내용
    closeDialog();
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (onDeleteThought) {
      await onDeleteThought(memoId);
      closeDialog();
    }
  };

  return (
    <>
      <div
        className="flex items-center cursor-pointer gap-[2px] tracking-tighter"
        onClick={openDialog}
      >
        {initialThought ? (
          // 내 생각이 이미 있는 경우 - 편집 아이콘
          <>
            <p className="text-gray-400 text-sm ">생각수정</p>
            <CircleSlash className="text-gray-400 w-5 h-5" />
          </>
        ) : (
          // 내 생각이 없는 경우 - 추가 아이콘
          <>
            <p className="text-gray-400 text-sm ">생각추가</p>
            <CirclePlus className="text-gray-400 w-5 h-5" />
          </>
        )}
      </div>

      <ThoughtDialog
        isOpen={isDialogOpen}
        onClose={closeDialog}
        initialThought={initialThought}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  );
}
