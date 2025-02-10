'use client';

import React from 'react';
import TopNav from '../TopNav';
import { useUserStore } from '../store/userStore';
import { SajuInformation } from '../fortune/types/fortune';
import {
  Activity,
  BriefcaseBusiness,
  CircleDollarSign,
  Contact,
  Heart,
  MoonStar,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function FortunePage() {
  const currentUser = useUserStore(
    (state) => state.currentUser as { saju_information: SajuInformation } | null
  );
  const userName = currentUser?.saju_information?.name || '';

  const linkOptions = [
    {
      href: '/fortune/today',
      icon: MoonStar,
      mainText: '오늘의 운세',
      subText: ' (feat. 셀카&사주)',
    },
    {
      href: '/fortune/total',
      icon: Contact,
      mainText: '평생운',
      subText: ' (평생 종합 운세)',
    },
    {
      href: '/fortune/money',
      icon: CircleDollarSign,
      mainText: '재물운',
      subText: ' (평생 재물 운세)',
    },
    {
      href: '/fortune/business',
      icon: BriefcaseBusiness,
      mainText: '직업운',
      subText: ' (평생 직업 운세)',
    },
    {
      href: '/fortune/love',
      icon: Heart,
      mainText: '애정운',
      subText: ' (평생 애정 운세)',
    },
    {
      href: '/fortune/health',
      icon: Activity,
      mainText: '건강운',
      subText: ' (평생 건강 운세)',
    },
  ];

  return (
    <div>
      <TopNav title="사주" />
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
            backgroundImage: "url('/main/main-image-fortune.webp')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 to-violet-50/20" />
      </div>
      {/* <hr className="mb-1 mx-6 border-violet-200" /> */}
      <div className="p-6 tracking-tighter flex flex-col justify-center gap-4">
        {linkOptions.map(({ href, icon: Icon, mainText, subText }) => (
          <Link key={href} href={href}>
            <div className="w-full aspect-[5/1] bg-gradient-to-br from-violet-50 to-pastel-50 rounded-xl flex items-center justify-between shadow-md gap-2 px-6">
              <div className="flex items-center gap-2">
                <Icon className="text-gray-400 w-6 h-6" />
                <p className="text-xl font-semibold text-gray-900">
                  {mainText}
                  {/* <span className="text-base text-gray-400 font-normal">{subText}</span> */}
                </p>
              </div>
              <p className="text-xs text-violet-400 tracking-tighter">{subText}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
