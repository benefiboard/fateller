//app/mirror/page.tsx

'use client';

import React, { useState } from 'react';
import TopNav from '../TopNav';
import { useUserStore } from '../store/userStore';
import { SajuInformation } from '../fortune/types/fortune';
import Link from 'next/link';
import { categories, linkOptions } from './data/title';

export default function MirrorPage() {
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' 또는 category.id 값
  const currentUser = useUserStore(
    (state) => state.currentUser as { saju_information: SajuInformation } | null
  );
  const userName = currentUser?.saju_information?.name || '';

  // 필터링된 질문들을 가져오는 함수
  const getFilteredQuestions = () => {
    if (selectedCategory === 'all') {
      return linkOptions;
    }
    return linkOptions.filter((option) => option.category === selectedCategory);
  };

  return (
    <div>
      <TopNav title="해결의 거울" />
      <div className="p-6  tracking-tighter flex flex-col gap-4 justify-center">
        {/* <h2 className="text-2xl font-semibold ">오늘의 운세</h2> */}
        {/* <hr className="mt-4 border-1 border-gray-200" /> */}
        <div className="flex flex-col  pb-4 border-b">
          <h2 className="text-2xl font-semibold">
            {userName}
            <span className="text-base text-gray-400"> 님</span>
          </h2>
          <p className="text-lg">행운 가득한 하루 되세요!!</p>
        </div>
      </div>
      {/* Background Image */}
      <div className="w-full aspect-[2/1]  relative overflow-hidden shadow-sm">
        <div
          className="absolute inset-0 bg-cover bg-center border-y-2 border-violet-100 "
          style={{
            backgroundImage: "url('/main/main-image-mirror.webp')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-violet-50/20" />
      </div>
      {/* <hr className="mb-1 mx-6 border-violet-200" /> */}
      {/* 카테고리 선택 버튼들 */}
      <div className="px-6 pt-6">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`py-2  rounded-lg text-sm  tracking-tighter transition-colors
              ${
                selectedCategory === 'all'
                  ? 'bg-violet-500 text-white'
                  : 'bg-violet-50 text-violet-600'
              }`}
          >
            전체
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`py-2  rounded-lg text-sm  tracking-tighter transition-colors
                ${
                  selectedCategory === category.id
                    ? 'bg-violet-500 text-white'
                    : 'bg-violet-50 text-violet-600'
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <hr className="mt-4 mx-6" />

      {/* 질문 목록 */}
      <div className="p-6 pt-4 tracking-tighter flex flex-col justify-center gap-4">
        {getFilteredQuestions().map(({ href, icon: Icon, mainText, subText }) => (
          <Link key={href} href={href}>
            <div className="w-full aspect-[4/1] bg-gradient-to-br from-violet-50 to-pastel-50 rounded-xl flex items-center justify-between shadow-md gap-2 px-6">
              <div className="w-full grid grid-cols-5 items-center gap-2">
                <Icon className="text-violet-300 w-8 h-8 col-span-1" />
                <div className="flex flex-col col-span-4">
                  <p className="text-base tracking-tighter text-gray-900 whitespace-pre-line">
                    {mainText}
                  </p>
                  <p className="text-xs text-violet-400 tracking-tighter">{subText}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
