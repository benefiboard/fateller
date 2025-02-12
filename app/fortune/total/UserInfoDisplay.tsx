// fortune/total/UserInfoDisplay.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SajuInformation } from '@/app/dailytalk/types/user';
import Link from 'next/link';

interface UserInfoDisplayProps {
  userInfo: SajuInformation;
  onViewFortune: () => void;
}

const UserInfoDisplay = ({ userInfo, onViewFortune }: UserInfoDisplayProps) => {
  const renderTime = () => {
    // 10시 60분이면 "시간 모름"으로 표시
    if (userInfo.birthHour === '25' && userInfo.birthMinute === '60') {
      return '시간 모름';
    }
    return `${userInfo.birthHour}시 ${userInfo.birthMinute}분`;
  };

  return (
    <Card className="border-brand-100">
      <CardContent className="pt-6 space-y-4">
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
          <span className="font-medium">{renderTime()}</span>
        </div>

        {/* <Button
          onClick={onViewFortune}
          className="w-full bg-black hover:opacity-90 transition-opacity mt-6"
        >
          평생운세 보기
        </Button> */}
        <div className="flex flex-col gap-2 mt-8">
          <Button
            onClick={onViewFortune}
            className="w-full bg-black hover:opacity-90 transition-opacity"
          >
            평생운세 보기
          </Button>
          <Link href="/user-info" className="w-full">
            <Button variant={'outline'} className="w-full   transition-opacity">
              유저 정보 수정
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInfoDisplay;
