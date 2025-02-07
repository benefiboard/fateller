// app/tarot/today/page.tsx
'use client';

import React, { useState } from 'react';
import { SelectedCard } from '../types/tarot';
import { ApiResponse } from '@/app/fortune/utils/types';
import FaceAnalyzer from '@/app/face/FaceAnalyzer';
import TarotCardGrid from '../TarotCardGrid';
import TarotResult from '../TarotResult';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/TopNav';
import StartSelection from '@/app/layout-component/StartSelection';

// 상태 타입 확장
type AnalysisStep = 'selection' | 'face' | 'card-selection' | 'result';
type AnalysisPath = 'face' | 'quick';

const TodayTarotPage = () => {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('selection');
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [analysisPath, setAnalysisPath] = useState<AnalysisPath>('quick');
  const router = useRouter();

  // 시작 모드 선택 핸들러
  const handleModeSelection = (mode: 'face' | 'quick') => {
    setAnalysisPath(mode); // 사용자가 선택한 경로 저장
    if (mode === 'face') {
      setCurrentStep('face');
    } else {
      setCurrentStep('card-selection');
    }
  };

  const handleAnalysisComplete = (result: ApiResponse) => {
    if (result.isFace) {
      setCurrentStep('card-selection');
    }
  };

  const handleCardSelectComplete = (cards: SelectedCard[]) => {
    setSelectedCards(cards);
    setCurrentStep('result');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'result':
        setCurrentStep('card-selection');
        break;
      case 'card-selection':
        setCurrentStep('selection');
        setSelectedCards([]);
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
      case 'card-selection':
        return analysisPath === 'face' ? 3 : 2;
      case 'result':
        return analysisPath === 'face' ? 4 : 3;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav
        title="타로"
        subTitle="오늘의 운세"
        currentStep={getCurrentStepNumber()}
        totalSteps={currentStep === 'face' ? 4 : 3}
        onBack={handleBack}
      />

      <main className="max-w-lg mx-auto">
        {currentStep === 'selection' && (
          <StartSelection
            onSelectMode={handleModeSelection}
            category="타로"
            title="타로로 보는 오늘의 운세"
            subtitle="당신의 하루를 타로카드로 알아보세요"
          />
        )}

        {currentStep === 'face' && (
          <FaceAnalyzer
            currentUser_id="local"
            onAnalysisComplete={handleAnalysisComplete}
            title="당신의 하루는 어떨까요?"
            subTitle="얼굴 분석이 완료되면 타로 카드를 선택하실 수 있습니다."
          />
        )}

        {currentStep === 'card-selection' && (
          <TarotCardGrid onComplete={handleCardSelectComplete} />
        )}

        {currentStep === 'result' && selectedCards.length === 3 && (
          <TarotResult selectedCards={selectedCards} />
        )}
      </main>
    </div>
  );
};

export default TodayTarotPage;
