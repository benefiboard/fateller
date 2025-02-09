// fortune/total/LoadingAnimation.tsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingAnimationProps {
  onLoadingComplete: () => void;
}

const AnalyzingWave = () => (
  <div className="fixed inset-0 bg-violet-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
    <motion.div
      className="relative flex items-center justify-center h-32"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.8 }}
    >
      {/* 바깥 원 */}
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

      {/* 중간 원 */}
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

      {/* 안쪽 원 */}
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

      {/* 중앙 별 */}
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
      사진을 분석중입니다...
    </motion.p>
  </div>
);

const LoadingAnimation = ({ onLoadingComplete }: LoadingAnimationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 3000); // 3초 후 로딩 완료

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div className="fixed inset-0 bg-violet-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
      <motion.div
        className="relative flex items-center justify-center h-32"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        {/* 바깥 원 */}
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

        {/* 중간 원 */}
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

        {/* 안쪽 원 */}
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

        {/* 중앙 별 */}
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
        사주를 분석중입니다..
      </motion.p>
    </div>
  );
};

export default LoadingAnimation;
