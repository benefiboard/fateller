// components/FortuneResultDisplayDetail.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { DetailFortuneData, FortuneType } from '../types/fortune';
import { Loader } from 'lucide-react';

interface FortuneResultDisplayDetailProps {
  fortuneData: {
    number: number;
    data: DetailFortuneData;
  };
  userName: string;
  fortuneType: FortuneType;
  gender: '남자' | '여자';
  specialNumber: number; // specialNumber 추가
}

const fortuneTypeToTitle = {
  business: '직업운',
  health: '건강운',
  love: '애정운',
  money: '재물운',
} as const;

const FortuneResultDisplayDetail = ({
  fortuneData,
  userName,
  fortuneType,
  gender,
  specialNumber, // specialNumber 사용
}: FortuneResultDisplayDetailProps) => {
  if (!fortuneData || !fortuneData.data) {
    return (
      <div className="p-4 flex flex-col justify-center items-center gap-4 w-screen h-screen ">
        <Loader className="animate-spin w-8 h-8" />
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  const genderData = gender === '남자' ? fortuneData.data.male : fortuneData.data.female;
  const specialKey = `special${specialNumber}` as keyof typeof genderData;

  return (
    <div className="flex flex-col min-h-screen bg-white gap-4 tracking-tighter">
      {/* Header Card */}
      <Card className="mt-6 flex flex-col mx-4 p-6 gap-6">
        <div className="w-full flex flex-col items-center justify-center py-8 ">
          <h2 className="text-2xl font-bold ">
            {userName.length > 8 ? `${userName.slice(0, 8)}...` : userName}
            <span className="text-sm text-gray-400"> 님의</span>
          </h2>
          <hr className="w-4/5 border border-gray-200 my-1" />
          <h2 className="text-lg font-semibold">{fortuneTypeToTitle[fortuneType]} 분석결과</h2>
        </div>
      </Card>

      {/* Fortune Content - 전체 내용을 바로 표시 */}
      <div className="p-6 bg-white rounded-lg ">
        <hr className="-mt-2 pt-8 border-t-2 border-gray-200" />
        <p className="text-gray-600 whitespace-pre-wrap tracking-tighter">
          {(genderData[specialKey] || '데이터가 없습니다.').split('.').join('.\n')}
        </p>
      </div>
    </div>
  );
};

export default FortuneResultDisplayDetail;
