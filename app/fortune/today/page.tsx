//app/fortune/today/page.tsx

'use client';

import React, { useState } from 'react';
import { calculateFortune } from '../utils/fortuneCalculator';
import { ApiResponse, TotalFortune } from '../utils/types';
import FaceAnalyzer from '../../face/FaceAnalyzer';
import FortuneDisplay from './FortuneDisplay';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/TopNav';
import StartSelection from '@/app/layout-component/StartSelection';

type ValidEnergyLevel = '높음' | '보통' | '낮음' | '없음';
type AnalysisStep = 'selection' | 'face' | 'result';
type AnalysisPath = 'face' | 'quick';

const checkEnergyLevel = (energy: string): ValidEnergyLevel => {
  if (energy === '높음' || energy === '보통' || energy === '낮음') {
    return energy;
  }
  return '없음';
};

const FortuneToday = () => {
  const [fortune, setFortune] = useState<TotalFortune | null>(null);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('selection');
  const [analysisPath, setAnalysisPath] = useState<AnalysisPath>('quick');
  const router = useRouter();

  // 시작 모드 선택 핸들러
  const handleModeSelection = (mode: 'face' | 'quick') => {
    setAnalysisPath(mode);
    if (mode === 'face') {
      setCurrentStep('face');
    } else {
      // 빠른 시작인 경우 기본 에너지 레벨('보통')로 운세 계산
      const todayFortune = calculateFortune('보통');
      setFortune(todayFortune);
      setCurrentStep('result');
    }
  };

  const handleAnalysisComplete = (result: ApiResponse) => {
    if (result.isFace) {
      const energyLevel = checkEnergyLevel(result.condition.energy);
      const todayFortune = calculateFortune(energyLevel);
      console.log('energyLevel', energyLevel);
      setFortune(todayFortune);
      setCurrentStep('result');
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'result':
        setCurrentStep('selection');
        setFortune(null);
        break;
      case 'face':
        setCurrentStep('selection');
        break;
      default:
        router.back();
    }
  };

  const getCurrentStepNumber = () => {
    switch (currentStep) {
      case 'selection':
        return 1;
      case 'face':
        return 2;
      case 'result':
        return analysisPath === 'face' ? 3 : 2;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav
        title="오늘의 운세"
        subTitle="얼굴 + 사주"
        currentStep={getCurrentStepNumber()}
        totalSteps={analysisPath === 'face' ? 3 : 2}
        onBack={handleBack}
      />

      <main className="max-w-lg mx-auto mb-20">
        {currentStep === 'selection' && (
          <StartSelection
            category="사주"
            onSelectMode={handleModeSelection}
            title="오늘의 운세를 확인해보세요"
            subtitle="얼굴 분석으로 더 정확한 운세를 확인하실 수 있습니다"
          />
        )}

        {currentStep === 'face' && (
          <FaceAnalyzer
            currentUser_id="local"
            onAnalysisComplete={handleAnalysisComplete}
            title="오늘의 운세"
            subTitle="(feat. 내 얼굴)"
            description="내 얼굴의 기운과 사주로 보는 특별한 오늘"
          />
        )}

        {currentStep === 'result' && fortune && <FortuneDisplay fortune={fortune} />}
      </main>
    </div>
  );
};

export default FortuneToday;
