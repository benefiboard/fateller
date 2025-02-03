//app>layout-component>CarouselCard>NavigationButton.tsx

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavigationButtonProps = {
  direction: 'left' | 'right';
  onClick: () => void;
  className?: string; // 추가된 className prop
  offset?: string; // 추가된 offset prop (기본값 -left-4 또는 -right-4를 override하기 위한 prop)
};

export const NavigationButton = ({
  direction,
  onClick,
  className,
  offset,
}: NavigationButtonProps) => (
  <Button
    size="icon"
    className={cn(
      'absolute border-2 border-violet-200 bg-violet-300/50',
      // offset prop이 제공되면 그것을 사용하고, 아니면 기본값 사용
      offset || (direction === 'left' ? '-left-4' : '-right-4'),
      'top-1/2 -translate-y-1/2 z-10 rounded-full shadow-sm hover:bg-violet-200/70',
      className // 추가적인 className을 병합
    )}
    onClick={onClick}
  >
    {direction === 'left' ? (
      <ChevronLeft className="h-6 w-6 text-gray-600" />
    ) : (
      <ChevronRight className="h-6 w-6 text-gray-600" />
    )}
  </Button>
);
