'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BubbleEffectProps {
  imageSrc: string;
  imageAlt: string;
}

interface BubbleState {
  id: number;
  x: number;
  y: number;
  size: number;
}

const BubbleEffect: React.FC<BubbleEffectProps> = ({ imageSrc, imageAlt }) => {
  const [bubbles, setBubbles] = useState<BubbleState[]>([]);

  const createBubble = useCallback((x: number, y: number) => {
    const size = Math.random() * (240 - 160) + 80; // 160px to 240px
    const newBubble: BubbleState = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setBubbles((prevBubbles) => [...prevBubbles, newBubble]);
    console.log('Bubble created:', newBubble); // 디버깅 로그

    setTimeout(() => {
      setBubbles((prevBubbles) => prevBubbles.filter((bubble) => bubble.id !== newBubble.id));
      console.log('Bubble removed:', newBubble.id); // 디버깅 로그
    }, 1000);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      createBubble(e.clientX, e.clientY);
      console.log('Click event detected:', { x: e.clientX, y: e.clientY }); // 디버깅 로그
    };

    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [createBubble]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {bubbles.map((bubble) => (
          <motion.div
            key={bubble.id}
            className="absolute rounded-full overflow-hidden pointer-events-none"
            style={{
              left: bubble.x,
              top: bubble.y,
              width: bubble.size,
              height: bubble.size,
              x: '-50%',
              y: '-50%',
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0.8 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-200 to-pink-200 opacity-50" />
            <img
              src={imageSrc}
              alt={imageAlt}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BubbleEffect;
