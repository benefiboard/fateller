//app>layout-component>CarouselCard>AnimatedCardContainer.tsx

'use client';

import { motion, PanInfo, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// 수정된 변형 애니메이션
const cardVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.8,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.8,
  }),
};

// 다음 카드를 위한 새로운 변형 애니메이션
const nextCardVariants: Variants = {
  enter: {
    x: '100%',
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    x: '85%',
    opacity: 0.3,
    scale: 0.9,
  },
  exit: {
    x: '100%',
    opacity: 0,
    scale: 0.8,
  },
};

export const AnimatedCardContainer = ({
  children,
  currentType,
  nextCardContent,
  onDragEnd,
}: {
  children: ReactNode;
  currentType: string;
  nextCardContent: ReactNode;
  onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
}) => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* 현재 카드 */}
      <motion.div
        key={`current-${currentType}`}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        onDragEnd={onDragEnd}
        className="relative z-10"
      >
        {children}
      </motion.div>

      {/* 다음 카드 미리보기 - 고정 위치 */}
      <div
        className="absolute top-0 right-0 w-[15%] h-full pointer-events-none opacity-90"
        style={{ transform: 'translateX(85%)' }}
      >
        {nextCardContent}
      </div>
    </div>
  );
};
