// app/mirror/when/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiResponse } from '@/app/fortune/utils/types';
import FaceAnalyzer from '@/app/face/FaceAnalyzer';
import TopNav from '@/app/TopNav';
import StartSelection from '@/app/layout-component/StartSelection';
import { getRandomMessage, MirrorMessage } from '../data/when';
import MirrorPush from '../MirrorPush';
import MirrorResult from '../MirrorResult';

// 상태 타입 정의
type AnalysisStep = 'selection' | 'face' | 'push-button' | 'result';
type AnalysisPath = 'face' | 'quick';

const WhenMirrorPage = () => {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('selection');
  const [selectedMessage, setSelectedMessage] = useState<MirrorMessage | null>(null);
  const [analysisPath, setAnalysisPath] = useState<AnalysisPath>('quick');
  const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string | null>(null);
  const [imageFilterType, setImageFilterType] = useState<string>('none');
  const router = useRouter();

  const handleModeSelection = (mode: 'face' | 'quick') => {
    setAnalysisPath(mode);
    if (mode === 'face') {
      setCurrentStep('face');
    } else {
      setCurrentStep('push-button');
    }
  };

  const handleAnalysisComplete = (result: ApiResponse, imageUrl: string, filterType: string) => {
    if (result.isFace) {
      setAnalyzedImageUrl(imageUrl);
      setImageFilterType(filterType);
      setCurrentStep('push-button');
    }
  };

  const handleMessageSelected = (message: MirrorMessage) => {
    setSelectedMessage(message);
    setCurrentStep('result');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'result':
        setCurrentStep('push-button');
        break;
      case 'push-button':
        setCurrentStep('selection');
        setSelectedMessage(null);
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
      case 'push-button':
        return analysisPath === 'face' ? 3 : 2;
      case 'result':
        return analysisPath === 'face' ? 4 : 3;
      default:
        return 1;
    }
  };

  const handleReset = () => {
    setCurrentStep('selection');
    setSelectedMessage(null);
    setAnalysisPath('quick');
    setAnalyzedImageUrl(null);
    setImageFilterType('none');
  };

  return (
    <div className="min-h-screen bg-white">
      <TopNav
        title="운명의 거울"
        subTitle="시기"
        currentStep={getCurrentStepNumber()}
        totalSteps={analysisPath === 'face' ? 4 : 3}
        onBack={handleBack}
      />

      <main className="max-w-lg mx-auto">
        {currentStep === 'selection' && (
          <StartSelection
            onSelectMode={handleModeSelection}
            category="운명의 거울"
            title="지금이 적기일까요?"
            subtitle="당신이 고민하는 일의 타이밍을 알려드립니다"
          />
        )}

        {currentStep === 'face' && (
          <FaceAnalyzer
            currentUser_id="local"
            onAnalysisComplete={handleAnalysisComplete}
            title="당신의 얼굴에서 찾는 답"
            subTitle="얼굴 분석이 완료되면 운명의 거울을 볼 수 있습니다"
          />
        )}

        {/* Push.tsx와 MirrorResult.tsx는 아직 만들지 않았으므로 주석 처리 */}
        {currentStep === 'push-button' && (
          <MirrorPush
            onComplete={handleMessageSelected}
            getMessage={getRandomMessage} // 이 부분 추가
            analyzedImageUrl={analyzedImageUrl}
            filterType={imageFilterType}
          />
        )}

        {currentStep === 'result' && selectedMessage && (
          <MirrorResult
            message={selectedMessage}
            analyzedImageUrl={analyzedImageUrl}
            filterType={imageFilterType}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
};

export default WhenMirrorPage;
