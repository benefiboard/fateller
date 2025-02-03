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
  onAnalysisComplete: (result: ApiResponse) => void;
}

const FaceAnalyzer = ({ currentUser_id, onAnalysisComplete }: FaceAnalyzerProps) => {
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
              content: `당신은 사람의 얼굴에서 그날의 컨디션과 에너지를 분석하여 운세와 연결할 수 있는 AI 시스템입니다. 얼굴의 전반적인 상태, 피부 톤, 눈의 생기, 전체적인 표정 등을 종합적으로 분석해주세요.`,
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
  "advice": string    // 현재 컨디션을 바탕으로 운세를 보면 좋을 것 같은 이유를 1문장으로
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
      setAnalysisResult(result);
      onAnalysisComplete(result);
      setStep('complete');
    } catch (error) {
      console.error('Error:', error);
      setError('이미지 분석 중 오류가 발생했습니다.');
      setStep('image-selected');
    }
  };

  const AnalyzingWave = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20">
      <div className="relative flex flex-col items-center justify-center">
        {/* 중앙 원 */}
        <div className="relative flex flex-col items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full space-y-4">
          <Brain className="h-12 w-12 text-white animate-ping" />
          <p className="text-white tracking-tighter text-base">분석중</p>
        </div>

        {/* 큰 파동 효과 (4개의 파동) */}
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="absolute w-32 h-32 rounded-full"
            style={{
              background:
                'linear-gradient(to right, rgba(96, 165, 250, 0.3), rgba(167, 139, 250, 0.3))',
              animation: 'largeRipple 2s linear infinite',
              animationDelay: `${index * 0.5}s`,
              scale: `${1 + index * 0.5}`,
            }}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md flex flex-col">
        {/* 이미지 표시 영역 */}
        <div className="w-full aspect-square relative">
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
                <img src={imageUrl} alt="Selected face" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500">얼굴 사진을 선택해주세요</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 컨트롤 영역 */}
        <div className="p-4 space-y-4">
          {step === 'initial' && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button className="w-full bg-black text-white rounded-xl py-4 text-lg font-medium flex items-center justify-center gap-4">
                  <Camera className="w-8 h-8" />
                  <p>촬영하기 / 불러오기</p>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>촬영하기 / 불러오기</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-4">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="w-full p-4 bg-black text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer">
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
                    <div className="w-full p-4 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
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
              className="mt-[72px] w-full bg-black text-white rounded-xl py-4 text-lg font-medium flex items-center justify-center gap-4"
              onClick={applyFilters}
            >
              <Focus className="w-7 h-7" />
              <p>사진 분석하기</p>
            </button>
          )}

          {/* 로딩 상태 */}
          {(step === 'analyzing' || step === 'compress') && <AnalyzingWave />}

          {/* 에러 메시지 */}
          {error && <div className="p-4 bg-red-50 text-red-500 rounded">{error}</div>}

          {/* 분석 결과 */}
          {analysisResult && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">분석 결과</h3>
              <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
                {JSON.stringify(analysisResult, null, 2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceAnalyzer;
