//app>layout-component>CarouselCard>AnimatedCard.tsx

'use client';

import { motion, PanInfo, Variants } from 'framer-motion';
import { ReactNode } from 'react';

export interface AnimatedCardProps {
  children: ReactNode;
  direction: number;
  variants: Variants;
  onDragEnd: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  className?: string;
}

export const AnimatedCard = ({
  children,
  direction,
  variants,
  onDragEnd,
  className,
}: AnimatedCardProps) => {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 600, damping: 60 },
        opacity: { duration: 0.2 },
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={onDragEnd}
      className={className}
    >
      {children}
    </motion.div>
  );
};
