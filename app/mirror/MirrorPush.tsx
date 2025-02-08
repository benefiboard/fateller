// app/components/MirrorPush.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MirrorMessage } from './data/when';
import { CircleHelp } from 'lucide-react';

interface MirrorPushProps {
  onComplete: (message: MirrorMessage) => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  pressTime?: number; // 누르는 시간 (ms) - 기본값 3000
  analyzedImageUrl?: string | null;
  filterType?: string;
  getMessage?: () => MirrorMessage; // 메시지를 가져오는 함수
}

const MirrorPush = ({
  onComplete,
  title = '운명의 거울',
  subtitle = '버튼을 길게 눌러주세요',
  buttonText = '✧',
  pressTime = 3000,
  analyzedImageUrl,
  filterType,
  getMessage,
}: MirrorPushProps) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showFinalLoading, setShowFinalLoading] = useState(false);
  const pressStartTime = useRef<number | null>(null);
  const animationFrameRef = useRef<number>();

  const updateProgress = () => {
    if (!pressStartTime.current) return;

    const elapsed = Date.now() - pressStartTime.current;
    const newProgress = Math.min((elapsed / pressTime) * 100, 100);
    setProgress(newProgress);

    if (newProgress < 100) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } else {
      setShowFinalLoading(true);
      setTimeout(() => {
        const message = getMessage?.() || {
          id: 'default',
          message: '메시지를 찾을 수 없습니다',
          subMessage: '다시 시도해주세요',
        };
        setShowFinalLoading(false);
        onComplete(message);
      }, 2000);
    }
  };

  const handlePressStart = () => {
    setIsPressing(true);
    pressStartTime.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const handlePressEnd = () => {
    if (progress < 100) {
      setIsPressing(false);
      pressStartTime.current = null;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col bg-white pb-8 relative min-h-screen">
      {/* 배경 이미지 컨테이너 */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat " // opacity 값을 높임
          style={{
            backgroundImage: `url('/mirror/moon.jpg')`, // 따옴표 추가
            backgroundSize: 'cover', // 배경 크기 속성 추가
            backgroundPosition: 'center', // 배경 위치 속성 추가
          }}
        />
        {/* <div className="absolute inset-0 bg-white/10" /> */}
      </div>

      {/* 기존 컨텐츠를 z-index로 위에 보이게 */}
      <div className="relative z-10">
        <div className="py-8 px-4">
          <h2 className="text-xl font-medium text-center text-white">{title}</h2>
          <p className="text-gray-200 text-center mt-1 text-sm">{subtitle}</p>
        </div>

        {analyzedImageUrl && (
          <div className="flex justify-center items-center mb-4">
            <div
              className={`border-2 border-violet-400 w-32 h-32 rounded-full overflow-hidden ${
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

        <div className="flex flex-col items-center justify-center p-8">
          <div className="relative w-48 h-48">
            {/* Progress Circle */}
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                className="text-gray-200 "
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="90"
                cx="96"
                cy="96"
              />
              <circle
                className="text-violet-500"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r="90"
                cx="96"
                cy="96"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
              />
            </svg>

            {/* Button */}
            <motion.button
              className="absolute inset-0 w-full h-full rounded-full border-4 border-violet-400 bg-violet-50/80 text-white flex items-center justify-center text-2xl shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
            >
              <motion.span
                animate={
                  isPressing
                    ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                      }
                    : {}
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="text-8xl font-bold text-violet-600"
              >
                {/* 여기서 progress에 따라 다른 숫자 표시 */}
                {!isPressing
                  ? '?'
                  : progress < 33
                  ? '3'
                  : progress < 66
                  ? '2'
                  : progress < 99
                  ? '1'
                  : '☆'}
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFinalLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-violet-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
          >
            <motion.div
              className="relative flex items-center justify-center h-32"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <motion.div
                className="absolute w-32 h-32 border-4 border-violet-400/30 rounded-full"
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              <motion.div
                className="absolute w-24 h-24 border-4 border-violet-400/50 rounded-full"
                animate={{
                  rotate: -360,
                  scale: [1.2, 1, 1.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              <motion.div
                className="absolute w-16 h-16 border-4 border-violet-400/70 rounded-full"
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              <motion.div
                className="text-violet-200 text-4xl z-10"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ✧
              </motion.div>
            </motion.div>

            <motion.p
              className="text-violet-200 text-lg font-medium tracking-wider mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              운명의 메시지를 불러오는 중...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MirrorPush;
