// components/UserInfoDisplayDetail.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SajuInformation } from '@/app/dailytalk/types/user';
import { FortuneType } from '../types/fortune';
import Link from 'next/link';

interface UserInfoDisplayDetailProps {
  userInfo: SajuInformation;
  onViewFortune: () => void;
  fortuneType: FortuneType;
}

const fortuneTypeToTitle = {
  business: '직업운',
  health: '건강운',
  love: '애정운',
  money: '재물운',
} as const;

const UserInfoDisplayDetail = ({
  userInfo,
  onViewFortune,
  fortuneType,
}: UserInfoDisplayDetailProps) => {
  return (
    <>
      <h2 className="text-xl font-semibold tracking-tighter text-center my-6 underline underline-offset-4">
        {fortuneTypeToTitle[fortuneType]} <span className="text-base text-gray-400">정보확인</span>
      </h2>
      <Card className="border-brand-100">
        <CardContent className="pt-6 space-y-8">
          <div className="flex flex-col gap-4">
            {/* 이름 */}
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">이름</span>
              <span className="font-medium">{userInfo.name}</span>
            </div>

            {/* 성별 */}
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">성별</span>
              <span className="font-medium">{userInfo.gender}</span>
            </div>

            {/* 생년월일 */}
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">생년월일</span>
              <span className="font-medium">
                {userInfo.birthYear}년 {userInfo.birthMonth}월 {userInfo.birthDay}일
              </span>
            </div>

            {/* 태어난 시간 */}
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-gray-600">태어난 시간</span>
              <span className="font-medium">
                {userInfo.isTimeUnknown
                  ? '시간 모름'
                  : `${userInfo.birthHour}시 ${userInfo.birthMinute}분`}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-8">
            <Button
              onClick={onViewFortune}
              className="w-full bg-black hover:opacity-90 transition-opacity"
            >
              {fortuneTypeToTitle[fortuneType]} 보기
            </Button>
            <Link href="/user-info" className="w-full">
              <Button variant={'outline'} className="w-full   transition-opacity">
                유저 정보 수정
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default UserInfoDisplayDetail;
