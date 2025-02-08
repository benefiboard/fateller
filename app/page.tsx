import { getUser } from '@/lib/supabse/server';
import { Rocket } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import TopNav from './TopNav';

export default async function Homepage() {
  const currentUser = await getUser();

  if (!currentUser) {
    redirect('/start');
  }
  //console.log(currentUser);
  return (
    <div className="flex flex-col   min-h-screen gap-6 ">
      <TopNav title="셀시" subTitle="운명 시그널" />
      {/* 타이틀 */}
      <div className="py-2 px-6">
        <h2 className="text-2xl font-bold tracking-tighter">
          {currentUser?.saju_information.name}
          <span className="text-sm text-gray-600 font-normal"> 님</span>
        </h2>
        <p className="text-gray-600  mt-1 text-base tracking-tighter">
          반가워요! 오늘도 가득한 행운...🍀
        </p>
      </div>
      {/* 이동 버튼 */}
      <div className="w-full px-6 flex flex-col items-center justify-center gap-4 ">
        <Link href="/fortune" className="w-full">
          <div className="w-full aspect-[3/1] flex items-center justify-center gap-2 text-gray-600 tracking-tighter border-2">
            <div className="flex items-center gap-2">
              {' '}
              {/* 여기에 div 추가 */}
              <Rocket className="w-16 h-16" />
              <span className="text-gray-600 text-3xl font-semibold">운세</span>
            </div>
          </div>
        </Link>
        <Link href="/fortune" className="w-full">
          <div className="w-full aspect-[3/1] flex items-center justify-center gap-2 text-gray-600 tracking-tighter border-2">
            <div className="flex items-center gap-2">
              {' '}
              {/* 여기에 div 추가 */}
              <Rocket className="w-16 h-16" />
              <span className="text-gray-600 text-3xl font-semibold">운세</span>
            </div>
          </div>
        </Link>
        <Link href="/fortune" className="w-full">
          <div className="w-full aspect-[3/1] flex items-center  gap-2 text-gray-600 tracking-tighter border-2">
            <div className="w-full flex items-center gap-2">
              <Rocket className="w-16 h-16 ml-8 mr-4" />
              <div className="flex flex-col flex-1 ">
                <p className=" text-gray-600 text-3xl font-semibold">운세</p>
                <hr className="w-full border-1 border-gray-300 py-1" />
                <p className=" text-gray-600 text-base ">운세</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/fortune" className="w-full">
          <div className="w-full aspect-[3/1] flex items-center justify-center gap-2 text-gray-600 tracking-tighter border-2">
            <div className="flex items-center gap-2">
              {' '}
              {/* 여기에 div 추가 */}
              <Rocket className="w-16 h-16" />
              <span className="text-gray-600 text-3xl font-semibold">운세</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
