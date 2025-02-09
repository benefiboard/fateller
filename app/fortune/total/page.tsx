// fortune/total/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import TopNav from '@/app/TopNav';
import UserInfoDisplay from './UserInfoDisplay';
import LoadingAnimation from './LoadingAnimation';
import type { SajuInformation, FortuneData } from '@/app/dailytalk/types/user';
import FortuneResultDisplay from './FortuneResultDisplay';

type AnalysisStep = 'info' | 'loading' | 'result';

export default function FortuneTotalPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('info');
  const currentUser = useUserStore(
    (state) => state.currentUser as { saju_information: SajuInformation } | null
  );
  const isInitialized = useUserStore((state) => state.isInitialized);
  const [fortuneData, setFortuneData] = useState<{ number: number; data: FortuneData } | null>(
    null
  );

  useEffect(() => {
    if (!isInitialized) return;

    if (!currentUser?.saju_information) {
      router.push('/user-info');
      return;
    }
  }, [currentUser, isInitialized, router]);

  const handleViewFortune = () => {
    setCurrentStep('loading');
  };

  const calculateSingleDigit = (numStr: string): number => {
    let num = numStr.split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    while (num > 9) {
      num = String(num)
        .split('')
        .reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  const getFortuneModuleByNumber = async (number: number) => {
    const moduleNumber = number.toString();
    try {
      const module = await import(`@/app/fortune/data/total/${moduleNumber}`);
      return module.data;
    } catch (error) {
      console.error('운세 데이터 로딩 오류:', error);
      return null;
    }
  };

  // handleLoadingComplete 함수 수정
  const handleLoadingComplete = async () => {
    if (!currentUser?.saju_information) return;

    const { birthYear, birthMonth, birthDay, gender } = currentUser.saju_information;
    const dateString = `${birthYear}${birthMonth}${birthDay}`;
    const fortuneNumber = calculateSingleDigit(dateString);

    const fortuneModule = await getFortuneModuleByNumber(fortuneNumber);
    if (!fortuneModule) return;

    // 성별에 따른 데이터 선택
    const genderData = gender === '남자' ? fortuneModule.male : fortuneModule.female;

    setFortuneData({
      number: fortuneNumber,
      data: genderData,
    });
    setCurrentStep('result');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'result':
        setCurrentStep('info');
        break;
      case 'loading':
        setCurrentStep('info');
        break;
      default:
        router.back();
    }
  };

  const getCurrentStepNumber = () => {
    switch (currentStep) {
      case 'info':
        return 1;
      case 'loading':
        return 2;
      case 'result':
        return 3;
      default:
        return 1;
    }
  };

  if (!currentUser?.saju_information) {
    return <div className="p-4">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <TopNav
        title="평생운세"
        subTitle="사주 운세"
        currentStep={getCurrentStepNumber()}
        totalSteps={3}
        onBack={handleBack}
      />

      <main className="max-w-lg mx-auto p-4 mb-20">
        {currentStep === 'info' && (
          <UserInfoDisplay
            userInfo={currentUser.saju_information}
            onViewFortune={handleViewFortune}
          />
        )}

        {currentStep === 'loading' && (
          <LoadingAnimation onLoadingComplete={handleLoadingComplete} />
        )}

        {currentStep === 'result' && fortuneData && (
          <FortuneResultDisplay fortuneData={fortuneData} />
        )}
      </main>
    </div>
  );
}
