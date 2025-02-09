// fortune/total/FortuneResultDisplay.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FortuneData } from '@/app/dailytalk/types/user';

interface FortuneResultDisplayProps {
  fortuneData: {
    number: number;
    data: FortuneData;
  };
}

const FortuneSection = ({ title, content }: { title: string; content: string }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
    </CardContent>
  </Card>
);

const FortuneResultDisplay = ({ fortuneData }: FortuneResultDisplayProps) => {
  if (!fortuneData || !fortuneData.data) {
    return <div>데이터를 불러오는 중...</div>;
  }

  const titles = {
    lifelong_fortune: '평생운세',
    major_fortune: '대운',
    prime_time: '전성기',
    caution_period: '주의할 시기',
    health_fortune: '건강운',
    early_years: '초년운',
    middle_age: '중년운',
    senior_years: '말년운',
    spouse_fortune: '배우자운',
    wealth_fortune: '재물운',
    career_fortune: '직장운',
    children_fortune: '자녀운',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">운세 분석 결과</h2>

      {Object.entries(titles).map(([key, title]) => (
        <FortuneSection
          key={key}
          title={title}
          content={fortuneData.data[key as keyof FortuneData] || '데이터가 없습니다.'}
        />
      ))}
    </div>
  );
};

export default FortuneResultDisplay;
