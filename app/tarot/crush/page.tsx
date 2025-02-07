// app/tarot/crush/page.tsx
'use client';

import React, { useState } from 'react';
import { SelectedSingleCard } from '../types/tarot';
import { ApiResponse } from '@/app/fortune/utils/types';
import FaceAnalyzer from '@/app/face/FaceAnalyzer';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/TopNav';
import StartSelection from '@/app/layout-component/StartSelection';
import TarotResultSingle from '../TarotResultSingle';
import TarotCardGridSingle from '../TarotCardGridSingle';
import { CRUSH_TAROT_CARDS } from '../data/crush';

// 상태 타입 확장
type AnalysisStep = 'selection' | 'face' | 'card-selection' | 'result';
type AnalysisPath = 'face' | 'quick';

const CrushTarotPage = () => {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('selection');
  const [selectedCard, setSelectedCard] = useState<SelectedSingleCard | null>(null);
  const [analysisPath, setAnalysisPath] = useState<AnalysisPath>('quick');
  const router = useRouter();

  const handleModeSelection = (mode: 'face' | 'quick') => {
    setAnalysisPath(mode);
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

  const handleCardSelectComplete = (card: SelectedSingleCard) => {
    setSelectedCard(card);
    setCurrentStep('result');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'result':
        setCurrentStep('card-selection');
        break;
      case 'card-selection':
        setCurrentStep('selection');
        setSelectedCard(null);
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
        subTitle="짝사랑운"
        currentStep={getCurrentStepNumber()}
        totalSteps={currentStep === 'face' ? 4 : 3}
        onBack={handleBack}
      />

      <main className="max-w-lg mx-auto">
        {currentStep === 'selection' && (
          <StartSelection
            onSelectMode={handleModeSelection}
            category="타로"
            title="타로로 보는 짝사랑운"
            subtitle="당신의 짝사랑과 고백운을 타로카드로 알아보세요"
          />
        )}

        {currentStep === 'face' && (
          <FaceAnalyzer
            currentUser_id="local"
            onAnalysisComplete={handleAnalysisComplete}
            title="당신의 짝사랑운은 어떨까요?"
            subTitle="얼굴 분석이 완료되면 타로 카드를 선택하실 수 있습니다."
          />
        )}

        {currentStep === 'card-selection' && (
          <TarotCardGridSingle
            onComplete={handleCardSelectComplete}
            cards={CRUSH_TAROT_CARDS}
            fortuneType="짝사랑운"
            title="당신의 짝사랑운은 어떨까요?"
            subtitle="카드 한 장을 선택해주세요"
          />
        )}

        {currentStep === 'result' && selectedCard && (
          <TarotResultSingle
            selectedCard={selectedCard}
            title="당신의 짝사랑운"
            subtitle="선택하신 카드가 보여주는 당신의 짝사랑 결과입니다"
          />
        )}
      </main>
    </div>
  );
};

export default CrushTarotPage;
