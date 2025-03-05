import React from 'react';
import { MessageCircle, Repeat, Heart } from 'lucide-react';
import { Memo } from '../utils/types';

interface MemoActionButtonsProps {
  memo: Memo;
  onLike: (id: string) => void;
  onRetweet: (id: string) => void;
  onReply: (id: string) => void;
}

const MemoActionButtons: React.FC<MemoActionButtonsProps> = ({
  memo,
  onLike,
  onRetweet,
  onReply,
}) => {
  return (
    <div className="flex justify-between mt-2">
      <button
        className="flex items-center text-gray-500 hover:text-blue-500"
        onClick={() => memo.id && onReply(memo.id)}
      >
        <MessageCircle size={18} />
        <span className="ml-1 text-xs">{memo.replies}</span>
      </button>

      <button
        className="flex items-center text-gray-500 hover:text-green-500"
        onClick={() => memo.id && onRetweet(memo.id)}
      >
        <Repeat size={18} />
        <span className="ml-1 text-xs">{memo.retweets}</span>
      </button>

      <button
        className="flex items-center text-gray-500 hover:text-red-500"
        onClick={() => memo.id && onLike(memo.id)}
      >
        <Heart size={18} />
        <span className="ml-1 text-xs">{memo.likes}</span>
      </button>
    </div>
  );
};

export default MemoActionButtons;
