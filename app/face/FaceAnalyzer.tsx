'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ImageIcon, Brain, Focus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  applyFiltersAndSave,
  checkImageSize,
  compressImage,
  createDualQualityImages,
  cropSquare,
  fileToBase64,
  isValidImageType,
} from './imageFace';
import ExerciseImageFilter from './ExerciseImageFilter';
import { ApiResponse } from '../dailytalk/components/DailyTalkMainClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// 타입 정의
type AnalysisStep =
  | 'initial'
  | 'camera'
  | 'image-selected'
  | 'filter-selection'
  | 'compress'
  | 'analyzing'
  | 'complete';

interface EmotionScores {
  [key: string]: number;
}

interface Filters {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
}

interface FaceAnalyzerProps {
  currentUser_id: string;
  onAnalysisComplete?: (result: ApiResponse) => void;
  title?: string;
  subTitle?: string;
  description?: string;
}

const FaceAnalyzer = ({
  currentUser_id,
  onAnalysisComplete,
  title,
  subTitle,
  description,
}: FaceAnalyzerProps) => {
  // 상태 관리
  const [step, setStep] = useState<AnalysisStep>('initial');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [displayImage, setDisplayImage] = useState<File | null>(null);
  const [analysisImage, setAnalysisImage] = useState<File | null>(null);
  const [filteredDisplayImage, setFilteredDisplayImage] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('none');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [showFaceAlert, setShowFaceAlert] = useState(false);
  const [imageDescription, setImageDescription] = useState<string>('');
  const [showImageDialog, setShowImageDialog] = useState(false);

  // 초기 필터 상태
  const initialFilters: Filters = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    warmth: 100,
  };
  const [currentFilters, setCurrentFilters] = useState<Filters>(initialFilters);

  // 이미지 선택 핸들러
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // 이미지 유효성 검사
        if (!isValidImageType(file)) {
          setError('지원하지 않는 이미지 형식입니다.');
          return;
        }

        if (!checkImageSize(file)) {
          setError('이미지 크기가 너무 큽니다. 5MB 이하의 이미지를 선택해주세요.');
          return;
        }

        // 정사각형으로 크롭
        const croppedImage = await cropSquare(file);

        // 이미지 품질 분리 처리
        const { displayImage, analysisImage } = await createDualQualityImages(croppedImage);

        setSelectedImage(displayImage);
        setAnalysisImage(analysisImage);
        setImageUrl(URL.createObjectURL(displayImage));
        setStep('filter-selection');
        setAnalysisResult(null);
        setError(null);
        setDialogOpen(false);
      } catch (error) {
        console.error('이미지 처리 오류:', error);
        setError('이미지 처리 중 오류가 발생했습니다.');
      }
    }
  };

  // 카메라로 사진 찍기
  const takePicture = async () => {
    if (!videoRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      ctx.drawImage(videoRef.current, 0, 0);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg');
      });

      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });

      // 정사각형으로 크롭
      const croppedImage = await cropSquare(file);

      // 이미지 품질 분리 처리
      const { displayImage, analysisImage } = await createDualQualityImages(croppedImage);

      setSelectedImage(displayImage);
      setAnalysisImage(analysisImage);
      setImageUrl(URL.createObjectURL(displayImage));
      setStep('filter-selection');
      setAnalysisResult(null);
      setError(null);

      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
      setError('카메라 캡처 중 오류가 발생했습니다.');
    }
  };

  // 필터 적용 함수
  const applyFilters = async () => {
    if (!selectedImage) return;

    try {
      // 필터 적용
      const filteredImage = await applyFiltersAndSave(selectedImage, currentFilters);
      setFilteredDisplayImage(filteredImage);
      setImageUrl(URL.createObjectURL(filteredImage));

      // 이미지 압축 및 분석용 이미지 생성
      setStep('compress');
      const { displayImage, analysisImage } = await createDualQualityImages(filteredImage);

      // displayImage는 고품질 버전으로 저장
      setDisplayImage(displayImage);
      // analysisImage는 저품질 버전으로 API 호출에 사용
      setAnalysisImage(analysisImage);

      // 분석 시작
      await analyzeImage(analysisImage);
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('이미지 처리 중 오류가 발생했습니다.');
      setStep('image-selected');
    }
  };

  // 이미지 분석 함수
  const analyzeImage = async (imageToAnalyze: File) => {
    try {
      setStep('analyzing');

      // 분석 시작 시간 기록
      const startTime = Date.now();

      const base64Image = await fileToBase64(imageToAnalyze);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `당신은 사람의 얼굴에서 그날의 컨디션과 에너지를 분석하여 운세와 연결할 수 있는 AI 시스템입니다. 얼굴의 전반적인 상태, 피부 톤, 눈의 생기, 전체적인 표정 등을 종합적으로 분석해주세요. 얼굴이 아닌 경우에는 해당 이미지가 무엇인지 간단히 설명해주세요`,
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `이 이미지에서 사람의 얼굴을 분석하고 다음 형식의 JSON으로 응답해주세요:
{
  "isFace": boolean,  // 얼굴 인식 여부
  "condition": {      // 전반적인 컨디션 분석
    "energy": string, // "높음", "보통", "낮음" 중 하나로 평가
    "signs": string   // 눈의 피로도, 피부 상태, 전반적 컨디션 등을 1-2문장으로 설명
  },
  "advice": string,   // 현재 컨디션을 바탕으로 운세를 보면 좋을 것 같은 이유를 1문장으로
   "imageDescription": string  // 얼굴이 아닌 경우 이미지에 대한 간단한 설명
}`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
          temperature: 1,
          response_format: { type: 'json_object' },
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      // 경과 시간 계산
      const elapsedTime = Date.now() - startTime;

      // 3초에서 경과 시간을 뺀 만큼 추가 대기
      if (elapsedTime < 3000) {
        await new Promise((resolve) => setTimeout(resolve, 3000 - elapsedTime));
      }

      if (!result.isFace) {
        setImageDescription(result.imageDescription || '알 수 없는 이미지입니다.');
        setShowFaceAlert(true);
        setStep('initial');
        setShowImageDialog(true); // AlertDialog 표시
      } else {
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError('이미지 분석 중 오류가 발생했습니다.');
      setStep('initial');
    }
  };

  const AnalyzingWave = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
      <div className="relative flex flex-col items-center justify-center">
        {/* 중앙 원 */}
        <div className="relative flex flex-col items-center justify-center w-32 h-32 bg-blue-50 rounded-full space-y-4">
          <Brain className="h-12 w-12 text-blue-400 animate-ping" />
          <p className="text-gray-700 text-center tracking-tighter text-sm whitespace-pre-line">{`오늘의 운세\n분석중`}</p>
        </div>

        {/* 웨이브 효과 */}
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="absolute w-32 h-32 rounded-full"
            style={{
              background:
                'linear-gradient(to right, rgba(239, 246, 255, 0.3), rgba(219, 234, 254, 0.3))',
              animation: 'largeRipple 2s linear infinite',
              animationDelay: `${index * 0.5}s`,
              scale: `${1 + index * 0.5}`,
            }}
          />
        ))}
      </div>
    </div>
  );

  // 페이지 새로고침 handler
  const handleAlertClose = () => {
    setShowImageDialog(false);
    setDialogOpen(true); // 카메라/갤러리 선택 다이얼로그 표시
  };

  return (
    <div className=" flex flex-col bg-white pb-8">
      {/* 메시지 영역 */}
      {(title || subTitle || description) && (
        <div className="py-8 px-4">
          <h2 className="text-xl font-medium text-center">{title}</h2>
          <p className="text-gray-600 text-center mt-1 text-sm">
            {subTitle && <span className="text-sm font-normal text-gray-600"> {subTitle}</span>}
          </p>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <div className="p-4  relative">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* {(title || subTitle || description) && (
            <div className="flex flex-col items-center justify-center gap-4 my-4 p-6 tracking-tighter">
              {title && (
                <h2 className="text-center text-xl font-bold">
                  {title}
                  {subTitle && (
                    <span className="text-sm font-normal text-gray-600"> {subTitle}</span>
                  )}
                </h2>
              )}
              {description && <p className="text-center text-sm text-gray-500">{description}</p>}
            </div>
          )} */}
          {/* 이미지 표시 영역 */}
          <div className="aspect-square relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={imageUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                {step === 'filter-selection' ? (
                  <ExerciseImageFilter
                    imageUrl={imageUrl}
                    onPreviewChange={setCurrentFilters}
                    filterType={filterType}
                    onFilterChange={setFilterType}
                  />
                ) : imageUrl ? (
                  <div className={filterType === 'none' ? '' : `filter-${filterType}`}>
                    <img
                      src={imageUrl}
                      alt="Selected face"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-50/50 relative">
                    {/* 모서리 프레임 */}
                    <div className="absolute top-6 left-6 w-16 h-16 border-l-4 border-t-4 rounded-tl-3xl border-blue-200"></div>
                    <div className="absolute top-6 right-6 w-16 h-16 border-r-4 border-t-4 rounded-tr-3xl border-blue-200"></div>
                    <div className="absolute bottom-6 left-6 w-16 h-16 border-l-4 border-b-4 rounded-bl-3xl border-blue-200"></div>
                    <div className="absolute bottom-6 right-6 w-16 h-16 border-r-4 border-b-4 rounded-br-3xl border-blue-200"></div>
                    <span className="text-gray-500">오늘의 얼굴 사진을 주세요</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* AlertDialog for Face Detection Failure */}
          <AlertDialog open={showImageDialog} onOpenChange={setShowImageDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  얼굴 인식 실패
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>얼굴이 제대로 인식되지 않았습니다.</p>
                  <p className="text-sm">{imageDescription}</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction
                  className="w-full bg-blue-500 text-white hover:bg-blue-600"
                  onClick={handleAlertClose}
                >
                  다시 시도하기
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* 컨트롤 영역 */}
          <div className="p-4">
            {step === 'initial' && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <button className="w-full bg-blue-500 text-white rounded-xl py-4 text-lg font-medium flex items-center justify-center gap-2">
                    <Camera className="w-6 h-6" />
                    <p>촬영하기 / 불러오기</p>
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-gray-600">촬영하기 / 불러오기</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 p-4">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <div className="w-full p-4 bg-blue-500 text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                        <Camera className="w-5 h-5" />
                        <span>카메라로 촬영하기</span>
                      </div>
                    </label>

                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <div className="w-full p-4 bg-blue-50 text-gray-600 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                        <ImageIcon className="w-5 h-5" />
                        <span>갤러리에서 선택하기</span>
                      </div>
                    </label>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {step === 'filter-selection' && (
              <button
                className="w-full bg-blue-500 text-white rounded-xl py-4 text-lg font-medium flex items-center justify-center gap-2 mt-[72px]"
                onClick={applyFilters}
              >
                <Focus className="w-6 h-6" />
                <p>사진 분석하기</p>
              </button>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-xl text-center">{error}</div>
            )}
          </div>
        </div>
      </div>

      {/* 로딩 상태 */}
      {(step === 'analyzing' || step === 'compress') && <AnalyzingWave />}
    </div>
  );
};

export default FaceAnalyzer;
