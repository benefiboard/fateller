'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThumbnailCardProps {
  title: string;
  subject: string;
  bgColor?: string;
  bgImage?: string;
  imageQuery?: string;
  keywords?: string[];
  keyPoints?: string[];
}

export const ThumbnailCardAnimation: React.FC<ThumbnailCardProps> = ({
  title,
  subject,
  bgImage,
  imageQuery,
  bgColor,
  keywords = [],
  keyPoints = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allContent = [...keywords, ...keyPoints];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allContent.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [allContent.length]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`relative w-full aspect-[16/9] overflow-hidden`}>
        {/* 배경 */}
        <div className={`absolute inset-0 bg-gradient-to-t ${bgColor}`} />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        {/* 전체 컨텐츠를 flex column으로 배치 */}
        <div className="relative h-full flex flex-col">
          {/* 애니메이션 영역: flex-1로 남는 공간 모두 차지 */}
          <div className="flex-1 flex items-center justify-center tracking-tighter">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="px-6"
              >
                {currentIndex < keywords.length ? (
                  <div className="text-xl font-bold text-white">{keywords[currentIndex]}</div>
                ) : (
                  <div className="text-base text-white max-w-lg">
                    {keyPoints[currentIndex - keywords.length]}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <hr className="border-t border-gray-300 " />
          {/* 텍스트 컨텐츠: 기존 스타일 유지 */}
          <div className="px-4 py-2 sm:p-6 tracking-tighter">
            <p className="text-lg sm:text-xl text-gray-400 font-medium">{subject}</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThumbnailCardAnimation;
