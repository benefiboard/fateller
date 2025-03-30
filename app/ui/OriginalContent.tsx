// app/ui/OriginalContent.tsx

'use client';

import React, { useRef } from 'react';
import { ExternalLink, ChevronUp, ChevronDown, Quote, X, MoveLeft } from 'lucide-react';
import Link from 'next/link';
import ShareButton from './ShareButton';
import { Memo } from '../utils/types';

interface OriginalContentProps {
  memo: Memo;
  onClose: () => void;
}

const OriginalContent: React.FC<OriginalContentProps> = ({ memo, onClose }) => {
  const [showOriginalText, setShowOriginalText] = React.useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // 원문 내용 표시 토글 함수
  const toggleOriginalText = () => {
    setShowOriginalText(!showOriginalText);
  };

  // 공유 성공 핸들러
  const handleShareSuccess = (type: 'image' | 'text' | 'link') => {
    console.log(`원문 ${type} 공유 성공`);
  };

  // 공유 실패 핸들러
  const handleShareError = (type: 'image' | 'text' | 'link', error: string) => {
    console.error(`원문 ${type} 공유 실패:`, error);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-80" onClick={onClose} />
      <div
        className="bg-white w-full max-w-2xl max-h-[100vh] sm:max-h-[90vh] overflow-y-auto z-50"
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-emerald-600 text-white p-4 flex items-center justify-between">
          <button onClick={onClose} className="text-white flex items-center gap-2">
            <MoveLeft />
            메모 목록
          </button>
          <button onClick={onClose} className="text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* 카테고리 */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
              {memo.labeling?.category || '미분류'}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold mb-6">{memo.title}</h1>

          {/* 원문 내용 섹션 */}
          <div className="pt-4 min-h-96 flex flex-col" ref={contentRef}>
            {/* 헤더 */}
            <div className="border-l-4 border-emerald-800/50 pl-3 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tight text-base font-semibold text-gray-900">원문</h2>
              <ShareButton
                memo={memo}
                tabType="original"
                contentRef={contentRef}
                onShareSuccess={handleShareSuccess}
                onShareError={handleShareError}
              />
            </div>

            {/* 원본 콘텐츠 */}
            <div className="flex-1 flex flex-col">
              {memo.original_url ? (
                <>
                  {/* 텍스트 */}
                  <div className="flex-1 flex flex-col gap-2 justify-center">
                    <div>
                      <Link
                        href={memo.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block"
                      >
                        <p className="text-gray-600 break-all">{memo.original_url}</p>
                      </Link>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                      <div>
                        <Link
                          href={memo.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-gray-800 hover:text-gray-900"
                        >
                          <ExternalLink size={16} className="mr-2" /> 원문으로 이동
                        </Link>
                      </div>

                      {/* 원문 내용보기 버튼 */}
                      {memo.original_text && (
                        <div>
                          <button
                            onClick={toggleOriginalText}
                            className="inline-flex items-center text-sm text-gray-800 hover:text-gray-900"
                          >
                            {showOriginalText ? (
                              <>
                                <ChevronUp size={16} className="mr-2" /> 원문 내용접기
                              </>
                            ) : (
                              <>
                                <ChevronDown size={16} className="mr-2" /> 원문 내용보기
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 원문 내용이 있고 보기 상태일 때만 표시 */}
                    {showOriginalText && memo.original_text && (
                      <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2 p-4 bg-white rounded-lg border border-gray-200">
                        {memo.original_text}
                      </p>
                    )}
                  </div>

                  {/* 이미지 */}
                  {memo.original_image ? (
                    <div className="w-full aspect-video flex gap-4 p-4 border-4 border-gray-200 relative mt-4">
                      <img
                        src={memo.original_image}
                        alt="Original Image"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          console.log('이미지 로드 실패:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-video flex flex-col items-center justify-center gap-4 p-4 border-4 border-gray-200 mt-4">
                      <Quote size={16} className="text-gray-400" />
                      <p>{memo.original_title}</p>
                      <Quote size={16} className="text-gray-400" />
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {memo.original_text || '원문이 없습니다.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OriginalContent;
