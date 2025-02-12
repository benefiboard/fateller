'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ApiResponse } from '@/app/fortune/utils/types';
import FaceAnalyzer from '@/app/face/FaceAnalyzer';
import TopNav from '@/app/TopNav';
import StartSelection from '@/app/layout-component/StartSelection';
import MirrorPush from '../../MirrorPush';
import MirrorResult from '../../MirrorResult';
import { linkOptions } from '../../data/title';

type AnalysisStep = 'selection' | 'face' | 'push-button' | 'result';
type AnalysisPath = 'face' | 'quick';
type MessageModule = {
  getRandomMessage: () => any;
  MirrorMessage: any;
};

const MirrorPage = () => {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('selection');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [analysisPath, setAnalysisPath] = useState<AnalysisPath>('quick');
  const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string | null>(null);
  const [imageFilterType, setImageFilterType] = useState<string>('none');
  const [messageModule, setMessageModule] = useState<MessageModule | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // 현재 경로에서 카테고리와 페이지 식별자 추출
  const pathParts = pathname?.split('/') || [];
  const category = pathParts[pathParts.length - 2] || ''; // daily, relationship 등
  const currentPageId = pathParts[pathParts.length - 1] || ''; // when, mood 등

  // 현재 페이지 옵션 찾기
  const currentPageOption = linkOptions.find(
    (option) => option.href.split('/').pop() === currentPageId
  );

  // 동적으로 메시지 모듈 로드
  useEffect(() => {
    const loadMessageModule = async () => {
      try {
        // 동적 import 경로 생성
        const module = await import(`../../data/${category}/${currentPageId}`);
        setMessageModule(module);
      } catch (error) {
        console.error('Error loading message module:', error);
      }
    };

    if (category && currentPageId) {
      loadMessageModule();
    }
  }, [category, currentPageId]);

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

  const handleMessageSelected = (message: any) => {
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
        subTitle={currentPageOption?.subText || '??'}
        currentStep={getCurrentStepNumber()}
        totalSteps={analysisPath === 'face' ? 4 : 3}
        onBack={handleBack}
      />

      <main className="max-w-lg mx-auto">
        {currentStep === 'selection' && (
          <StartSelection
            onSelectMode={handleModeSelection}
            category="운명의 거울"
            title={currentPageOption?.mainText || '??'}
            subtitle={currentPageOption?.subText || '??'}
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

        {currentStep === 'push-button' && messageModule?.getRandomMessage && (
          <MirrorPush
            onComplete={handleMessageSelected}
            getMessage={messageModule.getRandomMessage}
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

export default MirrorPage;
