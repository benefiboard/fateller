//app>layout-component>CarouselCard>animationVariants.ts

import { PanInfo, Variants } from 'framer-motion';

export const cardVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
    scale: 1,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

export const handleDragEnd = (
  event: MouseEvent | TouchEvent | PointerEvent,
  info: PanInfo,
  handleChange: (direction: number) => void
) => {
  const swipe = Math.abs(info.offset.x) * info.velocity.x;

  if (swipe < -100) {
    handleChange(1);
  } else if (swipe > 100) {
    handleChange(-1);
  }
};
