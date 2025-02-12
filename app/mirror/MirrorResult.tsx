// app/components/MirrorResult.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Quote } from 'lucide-react';
import { MirrorMessage } from './data/daily/when';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MirrorResultProps {
  message: MirrorMessage; // 타입을 MirrorMessage로 변경
  title?: string;
  subtitle?: string;
  theme?: 'purple' | 'blue' | 'green';
  analyzedImageUrl?: string | null;
  filterType?: string;
  onReset: () => void;
}

const MirrorResult = ({
  message,
  title = '운명의 거울이 말하길...',
  subtitle = '당신을 위한 메시지입니다',
  theme = 'purple',
  analyzedImageUrl,
  filterType,
  onReset,
}: MirrorResultProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const themeColors = {
    purple: {
      border: 'border-violet-400',
      bg: 'bg-violet-500',
      text: 'text-violet-600',
      gradient: 'from-violet-500 to-violet-600',
    },
    blue: {
      border: 'border-blue-400',
      bg: 'bg-blue-500',
      text: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
    },
    green: {
      border: 'border-emerald-400',
      bg: 'bg-emerald-500',
      text: 'text-emerald-600',
      gradient: 'from-emerald-500 to-emerald-600',
    },
  };

  const colors = themeColors[theme];

  return (
    <div className="relative min-h-screen">
      {' '}
      {/* 최상위 컨테이너 수정 */}
      {/* 배경 이미지 컨테이너 */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/mirror/universe.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>
      {/* 컨텐츠 컨테이너 */}
      <div className="relative z-10 flex flex-col">
        <div className="py-8 px-4">
          <h2 className="text-xl font-medium text-center text-white">{title}</h2>
          <p className="text-gray-200 text-center mt-1 text-sm">{subtitle}</p>
        </div>

        {analyzedImageUrl && (
          <div className="flex justify-center items-center mb-4">
            <div
              className={`border-2 ${colors.border} w-32 h-32 rounded-full overflow-hidden ${
                filterType !== 'none' ? `filter-${filterType}` : ''
              }`}
            >
              <img
                src={analyzedImageUrl}
                alt="Analyzed face"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* 배경 및 블러 효과 추가 */}
        <motion.div
          className="mx-4 p-6 rounded-xl border  backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center text-center gap-12 py-12">
            <motion.h2
              className="text-3xl font-bold text-gray-200 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Quote />
            </motion.h2>

            <div className="flex flex-col justify-center t tracking-tighter gap-2">
              <motion.h3
                className="text-3xl font-bold whitespace-pre-line text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {message.message}
              </motion.h3>

              <motion.hr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              />

              {message.subMessage && (
                <motion.p
                  className="text-gray-200 text-base "
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {message.subMessage}
                </motion.p>
              )}
            </div>

            <motion.h2
              className="text-3xl font-bold text-gray-200 tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Quote />
            </motion.h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-2 mt-4 mx-4">
          <Button
            variant={'outline'}
            className="col-span-1 w-full p-6 border shadow-md bg-white/80 backdrop-blur-sm hover:bg-white/90"
            onClick={onReset}
          >
            다시하기
          </Button>
          <Link href="/mirror" className="col-span-1 w-full">
            <Button
              variant={'outline'}
              className="w-full p-6 border shadow-md bg-white/80 backdrop-blur-sm hover:bg-white/90"
            >
              다른 질문하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MirrorResult;
