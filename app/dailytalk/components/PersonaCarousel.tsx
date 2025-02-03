'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PERSONAS } from './DailyTalkMainClient';
import Image from 'next/image';

interface PersonaCarouselProps {
  value: string;
  onChange: (value: string) => void;
}

const PersonaCarousel = ({ value, onChange }: PersonaCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(PERSONAS.findIndex((p) => p.value === value) || 0);

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % PERSONAS.length;
    setActiveIndex(nextIndex);
    onChange(PERSONAS[nextIndex].value);
  };

  const handlePrev = () => {
    const prevIndex = (activeIndex - 1 + PERSONAS.length) % PERSONAS.length;
    setActiveIndex(prevIndex);
    onChange(PERSONAS[prevIndex].value);
  };

  const getVisibleItems = () => {
    const items = [];
    const prev = (activeIndex - 1 + PERSONAS.length) % PERSONAS.length;
    const next = (activeIndex + 1) % PERSONAS.length;
    items.push({ ...PERSONAS[prev], position: 'left' });
    items.push({ ...PERSONAS[activeIndex], position: 'center' });
    items.push({ ...PERSONAS[next], position: 'right' });
    return items;
  };

  return (
    <div className="relative w-full h-72 overflow-hidden my-6 ">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-1 sm:left-6 z-10 p-2 rounded-full bg-violet-100/80 shadow-md hover:bg-white transition-all border-2 border-brand-200/80"
          aria-label="Previous style"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-1 sm:right-6 z-10 p-2 rounded-full bg-violet-100/80 shadow-md hover:bg-white transition-all border-2 border-brand-200/80"
          aria-label="Next style"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>

        {/* Cards */}
        <div className="relative w-full h-full flex items-center justify-center">
          {getVisibleItems().map((item, idx) => (
            <div
              key={item.value}
              className={`absolute transition-all duration-300 transform 
                ${
                  item.position === 'left'
                    ? 'left-4 scale-75 opacity-20 -translate-x-1/2'
                    : item.position === 'right'
                    ? 'right-4 scale-75 opacity-20 translate-x-1/2'
                    : 'scale-100 opacity-100'
                }`}
            >
              <div
                className={`
                w-40 h-60  rounded-2xl shadow-lg p-6  flex flex-col items-center
                border-2 border-brand-200 bg-gradient-to-br from-brand-100 to-slate-50
                transition-all duration-300
              `}
              >
                {/* Placeholder for future image */}

                <div className="w-28 h-28 mx-auto  rounded-xl bg-brand-100 flex items-center justify-center text-3xl overflow-hidden">
                  <Image
                    src={item.url}
                    alt={`${item.label} 캐릭터 이미지`}
                    width={112}
                    height={112}
                    priority
                  />
                </div>

                {/* <hr className="w-full border-violet-400 border-[1px] my-2" /> */}
                <p className="text-sm leading-none mt-3">{item.icon}</p>

                <div className="text-center">
                  <h3 className="text-base font-semibold text-brand-600">{item.label}</h3>
                  <p className="text-sm text-gray-600">-{item.description}-</p>
                  <p className="text-xs text-gray-400 mt-1">{item?.etc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonaCarousel;
