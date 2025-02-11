import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronDown, ChevronUp, CircleCheckBig, Loader } from 'lucide-react';
import type { FortuneData } from '@/app/dailytalk/types/user';

interface FortuneResultDisplayProps {
  fortuneData: {
    number: number;
    data: FortuneData;
  };
  userName: string;
}

// DetailFortuneCard component following the same style as the original
export const DetailFortuneCard = ({ title, content }: { title: string; content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contentArray = content
    .split('.')
    .filter((text) => text.trim())
    .map((text) => text.trim());

  const hasMoreContent = contentArray.length > 3;

  return (
    <div className="">
      <div className="w-full text-left p-4 flex flex-col gap-4 border-b border-gray-100">
        <div
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h3 className="font-medium text-xl">{title}</h3>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-[1200px]' : 'max-h-[120px]'
          }`}
        >
          <div className="space-y-1 text-gray-600 tracking-tighter text-base mt-4">
            {contentArray.slice(0, isExpanded ? contentArray.length : 3).map(
              (text, index) =>
                text && (
                  <div key={index} className="flex">
                    <span className="w-4 flex-shrink-0 text-sm flex">
                      <CircleCheckBig className="w-3 h-3 mt-1" />
                    </span>
                    <span className="flex-1">{text}.</span>
                  </div>
                )
            )}
          </div>
          {!isExpanded && hasMoreContent && (
            <div className="text-sm text-gray-400 mt-2 flex items-center gap-1">
              <span>{contentArray.length - 3}개 더보기</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FortuneResultDisplay = ({ fortuneData, userName }: FortuneResultDisplayProps) => {
  console.log('fortuneData', fortuneData);
  if (!fortuneData || !fortuneData.data) {
    return (
      <div className="p-4 flex flex-col justify-center items-center gap-4 w-screen h-screen ">
        <Loader className="animate-spin w-8 h-8" />
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  const titles = {
    lifelong_fortune: '평생운세 요약',
    major_fortune: '대운',
    prime_time: '전성기',
    caution_period: '주의할 시기',
    early_years: '초년운',
    middle_age: '중년운',
    senior_years: '말년운',
    wealth_fortune: '재물운',
    career_fortune: '직업운',
    health_fortune: '건강운',
    spouse_fortune: '배우자운',
    children_fortune: '자녀운',
  };

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
          <h2 className="text-lg font-semibold">평생운세 분석결과</h2>
        </div>
      </Card>

      {/* Fortune Details */}
      <div className=" space-y-1 tracking-tighter mb-20">
        {Object.entries(titles).map(([key, title]) => (
          <DetailFortuneCard
            key={key}
            title={title}
            content={fortuneData.data[key as keyof FortuneData] || '데이터가 없습니다.'}
          />
        ))}
      </div>
    </div>
  );
};

export default FortuneResultDisplay;
