'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';
import TopNav from '@/app/TopNav';
import UserInfoDisplayDetail from '../components/UserInfoDisplayDetail';
import LoadingAnimation from '../components/LoadingAnimation';
import FortuneResultDisplayDetail from '../components/FortuneResultDisplayDetail';
import { DetailFortuneData, SajuInformation } from '../types/fortune';
import { Loader } from 'lucide-react';

type AnalysisStep = 'info' | 'loading' | 'result';

export default function FortuneMoneyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('info');
  const currentUser = useUserStore(
    (state) => state.currentUser as { saju_information: SajuInformation } | null
  );
  const isInitialized = useUserStore((state) => state.isInitialized);
  const [fortuneData, setFortuneData] = useState<{
    number: number;
    data: DetailFortuneData;
  } | null>(null);

  const userName = currentUser?.saju_information?.name || '';

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
      const module = await import(`@/app/fortune/data/detail/money/${moduleNumber}`);
      return module.data;
    } catch (error) {
      console.error('운세 데이터 로딩 오류:', error);
      return null;
    }
  };

  const handleLoadingComplete = async () => {
    if (!currentUser?.saju_information) return;

    const { birthYear, birthMonth, birthDay } = currentUser.saju_information;
    const dateString = `${birthYear}${birthMonth}${birthDay}`;
    const fortuneNumber = calculateSingleDigit(dateString);

    const fortuneModule = await getFortuneModuleByNumber(fortuneNumber);
    if (!fortuneModule) return;

    setFortuneData({
      number: fortuneNumber,
      data: fortuneModule,
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
    return (
      <div className="p-4 flex flex-col justify-center items-center gap-4 w-screen h-screen ">
        <Loader className="animate-spin w-8 h-8" />
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <TopNav
        title="재물운"
        subTitle="사주 운세"
        currentStep={getCurrentStepNumber()}
        totalSteps={3}
        onBack={handleBack}
      />

      <main className="max-w-lg mx-auto p-4 mb-20">
        {currentStep === 'info' && (
          <UserInfoDisplayDetail
            userInfo={currentUser.saju_information}
            onViewFortune={handleViewFortune}
            fortuneType="money"
          />
        )}

        {currentStep === 'loading' && (
          <LoadingAnimation onLoadingComplete={handleLoadingComplete} />
        )}

        {currentStep === 'result' && fortuneData && currentUser.saju_information.specialNumber && (
          <FortuneResultDisplayDetail
            fortuneData={fortuneData}
            userName={userName}
            fortuneType="money"
            gender={currentUser.saju_information.gender}
            specialNumber={currentUser.saju_information.specialNumber}
          />
        )}
      </main>
    </div>
  );
}
