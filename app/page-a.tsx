import React from 'react';
import {
  Activity,
  BriefcaseBusiness,
  CalendarHeart,
  CircleDollarSign,
  CircleHelp,
  Contact,
  Heart,
  HeartHandshake,
  MoonStar,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/supabse/server';
import TopNav from './TopNav';

export default async function MainPage() {
  const currentUser = await getUser();
  const userName = currentUser?.saju_information?.name || '';

  if (!currentUser) {
    redirect('/auth');
  }

  const linkOptions = [
    {
      href: '/today',
      icon: CalendarHeart,
      mainText: '오늘의 운세',
      subText: '#오늘의운세 #오늘',
    },

    {
      href: '/fortune',
      icon: MoonStar,
      mainText: '사주',
      subText: '#사주 #정통운세',
    },
    {
      href: '/tarot',
      icon: Sparkles,
      mainText: '타로',
      subText: '#타로 #타로마스터',
    },
    {
      href: '/mirror',
      icon: CircleHelp,
      mainText: '해결의 거울',
      subText: '#고민 #3초해결',
    },
  ];

  return (
    <div>
      <TopNav title="페이스텔러" />
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
            backgroundImage: "url('/main/main-image-main.webp')",
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
