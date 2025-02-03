'use client';

import dynamic from 'next/dynamic';

const BubbleEffect = dynamic(() => import('./BubbleEffect'), { ssr: false });

export default function ClientBubbleEffect() {
  return <BubbleEffect imageSrc="/bubblead_hero.webp" imageAlt="Bubble Effect" />;
}
