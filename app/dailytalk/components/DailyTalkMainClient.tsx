'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import FortuneTodayDisplay from './FortuneTodayDisplay';
import { checkExistingFortune, saveDailyFortune } from '../actions';
import { generatePersonaFortune } from '../utils/fortuneGenerator';
import { FortuneResultType } from '../data/types';
import { getRandomImage } from '../constants/fortuneImages';
import PersonaCarousel from './PersonaCarousel';
import FaceAnalyzer from '@/app/face/FaceAnalyzer';
import { motion } from 'framer-motion';

type AnalysisMode = 'normal' | 'face' | null;

export interface ApiResponse {
  isFace: boolean;
  description?: string;
  condition: {
    energy: string;
    signs: string;
  };
  advice: string;
  imageDescription?: string;
}

interface DailyTalkClientProps {
  userBasicData: {
    id?: string;
    saju_information?: {
      gender?: string;
      location?: string;
      birthYear?: string;
    };
    mbti_information?: string;
  } | null;
}

export const PERSONAS = [
  {
    value: 'original',
    label: '카운셀러',
    description: '부드럽고 편안한',
    etc: '(기본 설정)',
    icon: '✨',
    url: '/dailytalk_persona/original.jpg',
  },
  {
    value: 'influence',
    label: '인플루언서',
    description: '밝고 트렌디한',
    icon: '💫',
    url: '/dailytalk_persona/influence.jpg',
  },
  {
    value: 'philosophy',
    label: '철학자 니체',
    description: '깊이가 남다른',
    icon: '🎯',
    url: '/dailytalk_persona/philosophy.jpg',
  },
  {
    value: 'poetic',
    label: '감성적 소설가',
    description: '따뜻한 감성',
    icon: '🌟',
    url: '/dailytalk_persona/poetic.jpg',
  },
  {
    value: 'manager',
    label: '팀장 언니',
    description: '다정한 카리스마',
    icon: '💝',
    url: '/dailytalk_persona/manager.jpg',
  },
];

export function DailyTalkClient({ userBasicData }: DailyTalkClientProps) {
  const router = useRouter();
  const [fortuneResult, setFortuneResult] = useState<FortuneResultType | null>(null);
  const [showSajuAlert, setShowSajuAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPersona, setSelectedPersona] = useState<string>('original');
  const [shouldSave, setShouldSave] = useState(true);
  // 새로운 상태들 추가
  const [faceAnalysisComplete, setFaceAnalysisComplete] = useState(false);
  const [faceAnalysisResult, setFaceAnalysisResult] = useState<ApiResponse | null>(null);
  const [showFaceAnalysisFailAlert, setShowFaceAnalysisFailAlert] = useState(false);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [showPersonaSelection, setShowPersonaSelection] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userBasicData?.id) {
        setIsLoading(false);
        return;
      }

      const existingFortune = await checkExistingFortune(userBasicData.id);
      if (existingFortune) {
        if (!existingFortune.fortune_content.comprehensive_solution_summary.background_image_url) {
          const fortuneScore =
            existingFortune.fortune_content.comprehensive_solution_summary.fortune_score;
          const fortuneState =
            fortuneScore >= 81 ? 'positive' : fortuneScore >= 61 ? 'neutral' : 'negative';
          const { imageUrl, description } = getRandomImage(fortuneState);

          const updatedFortune = {
            ...existingFortune,
            fortune_content: {
              ...existingFortune.fortune_content,
              comprehensive_solution_summary: {
                ...existingFortune.fortune_content.comprehensive_solution_summary,
                background_image_url: imageUrl,
                background_image_description: description,
              },
            },
          };

          await saveDailyFortune(userBasicData.id, updatedFortune);
          setFortuneResult(updatedFortune);
        } else {
          setFortuneResult(existingFortune);
        }
      }
      setIsLoading(false);
    };

    loadData();
  }, [userBasicData?.id]);

  // 3단계: 얼굴 분석 실패 AlertDialog
  const FaceAnalysisFailAlert = () => (
    <AlertDialog open={showFaceAnalysisFailAlert} onOpenChange={setShowFaceAnalysisFailAlert}>
      <AlertDialogContent className="border-brand-100">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gradient-brand">얼굴 인식 실패</AlertDialogTitle>
          <AlertDialogDescription>
            얼굴이 제대로 인식되지 않았습니다. 다시 시도해주세요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className="bg-black hover:opacity-90" onClick={handleResetAnalysis}>
            다시 시도하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // 4단계: 핸들러 함수들

  const handleResetAnalysis = () => {
    setFaceAnalysisComplete(false);
    setFaceAnalysisResult(null);
    setShowFaceAnalysisFailAlert(false);
  };

  const handleSaveFortune = async (
    fortune: FortuneResultType,
    shouldSaveToServer: boolean = true
  ) => {
    try {
      if (shouldSaveToServer && userBasicData?.id) {
        await saveDailyFortune(userBasicData.id, fortune);
      }
      setFortuneResult(fortune);
      return fortune;
    } catch (error) {
      console.error('저장 중 오류 발생:', error);
      return fortune;
    }
  };

  const validateAndGenerateFortune = async (shouldSave: boolean = true) => {
    try {
      // 사주 데이터만 확인
      const saju = userBasicData?.saju_information;
      if (!saju?.birthYear || !saju.gender) {
        setShowSajuAlert(true);
        return;
      }

      // 사용자 기본 데이터만 전달
      const userData = {
        gender: saju.gender === '남자' ? 'male' : 'female',
        age: new Date().getFullYear() - parseInt(saju.birthYear),
        location: saju.location || 'seoul',
      };

      const result = await generatePersonaFortune(userData, selectedPersona);

      if (result) {
        const fortuneScore = result.fortune_content.comprehensive_solution_summary.fortune_score;
        const fortuneState =
          fortuneScore >= 81 ? 'positive' : fortuneScore >= 61 ? 'neutral' : 'negative';
        const { imageUrl, description } = getRandomImage(fortuneState);

        const resultWithImage = {
          ...result,
          fortune_content: {
            ...result.fortune_content,
            comprehensive_solution_summary: {
              ...result.fortune_content.comprehensive_solution_summary,
              background_image_url: imageUrl,
              background_image_description: description,
            },
          },
        };

        if (shouldSave) {
          await handleSaveFortune(resultWithImage);
        } else {
          setFortuneResult(resultWithImage);
        }
      }
    } catch (error) {
      console.error('Error in validateAndGenerateFortune:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-400 border-t-transparent animate-spin" />
          </div>
          <p className="text-brand-600">운세를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  // validateAndGenerateFortune 함수 호출 시 shouldSave 상태 설정
  const handleFortuneGeneration = (saveToStorage: boolean) => {
    setShouldSave(saveToStorage);
    validateAndGenerateFortune(saveToStorage);
  };

  // FaceAnalyzer에서 onAnalysisComplete 함수가 호출되면
  const handleAnalysisComplete = (result: ApiResponse) => {
    if (result.isFace) {
      // 얼굴 인식 성공시 바로 운세 생성
      handleFortuneGeneration(shouldSave);
    } else {
      // 얼굴 인식 실패시 알림만
      setShowFaceAnalysisFailAlert(true);
    }
  };

  // 페르소나 선택으로 넘어가는 함수 추가
  const handleMoveToPersona = () => {
    setShowAnalysisResult(false);
    setShowPersonaSelection(true);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-brand-100" />
              <div className="absolute inset-0 rounded-full border-4 border-brand-400 border-t-transparent animate-spin" />
            </div>
            <p className="text-brand-600">운세를 확인하는 중...</p>
          </div>
        </div>
      );
    }

    if (fortuneResult) {
      return (
        <div className="mt-6">
          <FortuneTodayDisplay
            fortuneData={fortuneResult}
            userBasicData={{
              id: shouldSave ? userBasicData?.id || 'local' : 'dev',
            }}
          />
        </div>
      );
    }

    // 페르소나 선택 화면 (초기 화면)
    if (showPersonaSelection) {
      return (
        <Card className="border-brand-100">
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium text-brand-600">운세 스타일을 선택해주세요!</label>
                <PersonaCarousel value={selectedPersona} onChange={setSelectedPersona} />
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setShowPersonaSelection(false);
                    setShouldSave(true);
                  }}
                  className="w-full bg-black hover:opacity-90 transition-opacity"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  다음으로 (저장)
                </Button>
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    onClick={() => {
                      setShowPersonaSelection(false);
                      setShouldSave(false);
                    }}
                    variant="outline"
                    className="w-full border-brand-200 text-brand-600 hover:bg-brand-50"
                  >
                    다음으로 (저장 안함)
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // 얼굴 분석 화면
    return (
      <Card>
        <div className="pt-6 pl-6">
          <h2 className=" tracking-tighter">오늘의 사진 촬영하기</h2>
        </div>
        <FaceAnalyzer
          currentUser_id={userBasicData?.id || ''}
          onAnalysisComplete={handleAnalysisComplete}
        />
      </Card>
    );
  };

  return (
    <>
      {renderContent()}

      <FaceAnalysisFailAlert />

      <AlertDialog open={showSajuAlert} onOpenChange={setShowSajuAlert}>
        <AlertDialogContent className="border-brand-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gradient-brand">
              사주 정보가 필요해요
            </AlertDialogTitle>
            <AlertDialogDescription>
              정확한 운세를 위해 사주 정보를 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              className="bg-black hover:opacity-90"
              onClick={() => router.push('/user-info')}
            >
              사주 정보 입력하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
