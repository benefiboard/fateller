// app/tarot/loveGPT/page.tsx
'use client';

import React, { useState } from 'react';
import { SelectedSingleCard, SelectedSingleCardGPT } from '../types/tarot';
import { ApiResponse } from '@/app/fortune/utils/types';
import FaceAnalyzer from '@/app/face/FaceAnalyzer';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/TopNav';
import StartSelection from '@/app/layout-component/StartSelection';
import { LOVE_TAROT_CARDS } from '../data/loveGPT';
import TarotCardGridSingleGPT from '../TarotCardGridSingleGPT';
import TarotResultSingleGPT from '../TarotResultSingleGPT';
import { useUserStore } from '@/app/store/userStore';
import { SajuInformation } from '@/app/fortune/types/fortune';

// 상태 타입 확장
type AnalysisStep = 'selection' | 'face' | 'card-selection' | 'result';
type AnalysisPath = 'face' | 'quick';

const LoveAIPage = () => {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('selection');
  const [selectedCard, setSelectedCard] = useState<SelectedSingleCardGPT | null>(null);
  const [analysisPath, setAnalysisPath] = useState<AnalysisPath>('quick');
  const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string | null>(null);
  const [imageFilterType, setImageFilterType] = useState<string>('none');
  const router = useRouter();

  const currentUser = useUserStore(
    (state) => state.currentUser as { saju_information: SajuInformation } | null
  );
  const userName = currentUser?.saju_information?.name || '';
  const userGender = currentUser?.saju_information?.gender === '여자' ? 'female' : 'male';
  const userAge = currentUser?.saju_information?.birthYear
    ? new Date().getFullYear() - parseInt(currentUser.saju_information.birthYear)
    : 0;

  const handleModeSelection = (mode: 'face' | 'quick') => {
    setAnalysisPath(mode);
    if (mode === 'face') {
      setCurrentStep('face');
    } else {
      setCurrentStep('card-selection');
    }
  };

  const handleAnalysisComplete = (result: ApiResponse, imageUrl: string, filterType: string) => {
    if (result.isFace) {
      setAnalyzedImageUrl(imageUrl);
      setImageFilterType(filterType);
      setCurrentStep('card-selection');
    }
  };

  const handleCardSelectComplete = (card: SelectedSingleCardGPT) => {
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
        subTitle="연애운"
        currentStep={getCurrentStepNumber()}
        totalSteps={currentStep === 'face' ? 4 : 3}
        onBack={handleBack}
      />

      <main className="max-w-lg mx-auto">
        {currentStep === 'selection' && (
          <StartSelection
            onSelectMode={handleModeSelection}
            category="타로"
            title="타로로 보는 연애운"
            subtitle="당신의 연애운을 타로카드로 알아보세요"
          />
        )}

        {currentStep === 'face' && (
          <FaceAnalyzer
            currentUser_id="local"
            onAnalysisComplete={handleAnalysisComplete}
            title="당신의 연애운은 어떨까요?"
            subTitle="얼굴 분석이 완료되면 타로 카드를 선택하실 수 있습니다."
          />
        )}

        {currentStep === 'card-selection' && (
          <TarotCardGridSingleGPT
            onComplete={handleCardSelectComplete}
            cards={LOVE_TAROT_CARDS}
            fortuneType="연애운"
            title="당신의 연애운은 어떨까요?"
            subtitle="카드 한 장을 선택해주세요"
            analyzedImageUrl={analyzedImageUrl}
            filterType={imageFilterType}
            userAge={userAge}
            userGender={userGender}
            userName={userName}
          />
        )}

        {currentStep === 'result' && selectedCard && (
          <TarotResultSingleGPT
            selectedCard={selectedCard}
            title="당신의 연애운"
            subtitle="선택하신 카드가 보여주는 당신의 연애운입니다"
            analyzedImageUrl={analyzedImageUrl}
            filterType={imageFilterType}
            userName={userName}
          />
        )}
      </main>
    </div>
  );
};

export default LoveAIPage;
