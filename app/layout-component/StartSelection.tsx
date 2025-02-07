// app/components/StartSelection.tsx
import { Rocket, ScanFace } from 'lucide-react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StartSelectionProps {
  onSelectMode: (mode: 'face' | 'quick') => void;
  category?: string;
  title: string;
  subtitle?: string;
  quickAnimation?: boolean;
}

const StartSelection = ({
  onSelectMode,
  title,
  subtitle,
  category,
  quickAnimation,
}: StartSelectionProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  const handleQuickClick = () => {
    if (quickAnimation) {
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
        onSelectMode('quick');
      }, 1500);
    } else {
      onSelectMode('quick');
    }
  };

  const LoadingAnimation = () => (
    <div className="fixed inset-0 bg-violet-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
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
        운세를 분석중입니다...
      </motion.p>
    </div>
  );

  return (
    <div className="flex flex-col bg-white tracking-tighter">
      <div className="py-8 px-4">
        <h2 className="text-xl font-medium text-center">{title}</h2>
        {subtitle && <p className="text-gray-600 text-center mt-1 text-sm">{subtitle}</p>}
      </div>

      <div className="flex flex-col items-center justify-center gap-6 px-6">
        <div
          className="w-full flex flex-col items-center justify-center"
          onClick={() => onSelectMode('face')}
        >
          <div className="w-full aspect-[2/1] flex items-center justify-center gap-2 text-violet-600 tracking-tighter border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-violet-200 rounded-xl shadow-lg">
            <ScanFace className="w-20 h-20" />
            <p className="text-sm text-gray-600 w-36">
              <span className="text-violet-600 text-2xl font-semibold">얼굴+{category}</span>로 분석
            </p>
          </div>
        </div>

        <div className="w-full grid grid-cols-10 items-center">
          <hr className="col-span-4 w-full border-1 border-gray-300" />
          <p className="col-span-2 text-center text-lg">or</p>
          <hr className="col-span-4 w-full border-1 border-gray-300" />
        </div>

        <div
          className="w-full flex flex-col items-center justify-center"
          onClick={handleQuickClick}
        >
          <div className="w-full aspect-[2/1] flex items-center justify-center gap-2 text-violet-600 tracking-tighter border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-violet-200 rounded-xl shadow-lg">
            <Rocket className="w-20 h-20" />
            <p className="text-sm text-gray-600 w-36">
              <span className="text-violet-600 text-2xl font-semibold">{category}</span>로 빠른
              시작하기
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>{showAnimation && <LoadingAnimation />}</AnimatePresence>
    </div>
  );
};

export default StartSelection;
