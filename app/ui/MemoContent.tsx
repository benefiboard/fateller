import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memo } from '../utils/types';
import { Sparkle, ChevronDown, ChevronUp, ExternalLink, Quote, Share } from 'lucide-react';
import Link from 'next/link';
import ShareButton from './ShareButton';

// 탭 인덱스 타입 정의
type TabIndex = 0 | 1 | 2 | 3; // 0: 아이디어, 1: 아이디어 맵, 2: 주요 내용, 3: 원문

interface MemoContentProps {
  memo: Memo;
  expanded: boolean;
  showLabeling: boolean;
  showOriginal: boolean;
  onToggleThread: () => void;
  onToggleLabeling: () => void;
  onToggleOriginal: () => void;
  isVisible?: boolean; // 메모가 화면에 보이는지 여부
}

const MemoContent: React.FC<MemoContentProps> = ({
  memo,
  expanded,
  showLabeling,
  showOriginal,
  onToggleThread,
  onToggleLabeling,
  onToggleOriginal,
  isVisible = false,
}) => {
  // 탭 관리를 위한 상태
  const [activeTab, setActiveTab] = useState<TabIndex>(0);
  const [direction, setDirection] = useState(0); // 슬라이드 방향 (-1: 왼쪽, 1: 오른쪽)
  const [showOriginalText, setShowOriginalText] = useState(false);

  // 각 탭에 대한 ref 추가
  const tabRefs = {
    idea: useRef<HTMLDivElement>(null),
    main: useRef<HTMLDivElement>(null),
    key: useRef<HTMLDivElement>(null),
    original: useRef<HTMLDivElement>(null),
  };

  // 현재 활성 탭에 대한 ref 가져오기
  const getActiveTabRef = () => {
    switch (activeTab) {
      case 0:
        return tabRefs.idea;
      case 1:
        return tabRefs.key;
      case 2:
        return tabRefs.main;
      case 3:
        return tabRefs.original;
      default:
        return tabRefs.idea;
    }
  };

  // 현재 탭에 따른 타입 가져오기
  const getCurrentTabType = (): 'idea' | 'main' | 'key' | 'original' => {
    switch (activeTab) {
      case 0:
        return 'idea';
      case 1:
        return 'key';
      case 2:
        return 'main';
      case 3:
        return 'original';
      default:
        return 'idea';
    }
  };

  // 공유 성공 핸들러
  const handleShareSuccess = (type: 'image' | 'text' | 'link') => {
    console.log(`${getCurrentTabType()} 탭 ${type} 공유 성공`);
  };

  // 공유 실패 핸들러
  const handleShareError = (type: 'image' | 'text' | 'link', error: string) => {
    console.error(`${getCurrentTabType()} 탭 ${type} 공유 실패:`, error);
  };

  // HTML 태그를 처리하는 함수 - 최적화된 버전
  const processContentTags = (text: string): string => {
    if (!text) return '';
    if (typeof text !== 'string') return String(text || '');

    // 태그가 있는 경우만 처리 (성능 최적화)
    const hasKeyTags = /<key>(.*?)<\/key>/g.test(text);
    const hasTermTags = /<term>(.*?)<\/term>/g.test(text);
    const hasExTags = /<ex>(.*?)<\/ex>/g.test(text);
    const hasDataTags = /<data>(.*?)<\/data>/g.test(text);

    if (!(hasKeyTags || hasTermTags || hasExTags || hasDataTags)) {
      return text;
    }

    let processedText = text;

    // 핵심 내용 (key 태그) - 단순한 밑줄만 사용
    if (hasKeyTags) {
      processedText = processedText.replace(
        /<key>(.*?)<\/key>/g,
        '<span class="border-b-2 border-gray-400 font-extrabold">$1</span>'
      );
    }

    // 중요 용어 (term 태그) - 점선 밑줄 사용
    if (hasTermTags) {
      processedText = processedText.replace(
        /<term>(.*?)<\/term>/g,
        '<span class="font-black text-emerald-800">$1</span>'
      );
    }

    // 예시/사례 (ex 태그) - 괄호와 마커 사용
    if (hasExTags) {
      processedText = processedText.replace(
        /<ex>(.*?)<\/ex>/g,
        '<span class=" italic font-bold">$1</span>'
      );
    }

    // 데이터/수치 (data 태그) - 숫자 표시 기호 사용
    if (hasDataTags) {
      processedText = processedText.replace(
        /<data>(.*?)<\/data>/g,
        '<span class="text-red-600">$1</span>'
      );
    }

    return processedText;
  };

  // renderHTML 함수
  const renderHTML = (htmlString: string = '') => {
    return <span dangerouslySetInnerHTML={{ __html: processContentTags(htmlString) }} />;
  };

  // 탭 변경 함수 - 수정된 버전
  const changeTab = (newTab: TabIndex) => {
    // 방향 결정
    const currentIndex = activeTab;
    const targetIndex = newTab;

    if (
      (currentIndex === 0 && targetIndex === 1) ||
      (currentIndex === 1 && targetIndex === 2) ||
      (currentIndex === 2 && targetIndex === 3) ||
      (currentIndex === 3 && targetIndex === 0)
    ) {
      setDirection(1); // 오른쪽으로 이동
    } else if (
      (currentIndex === 1 && targetIndex === 0) ||
      (currentIndex === 2 && targetIndex === 1) ||
      (currentIndex === 3 && targetIndex === 2) ||
      (currentIndex === 0 && targetIndex === 3)
    ) {
      setDirection(-1); // 왼쪽으로 이동
    } else {
      // 특이 케이스
      const diff = targetIndex - currentIndex;
      if (Math.abs(diff) === 2) {
        if (currentIndex < targetIndex) {
          setDirection(1);
        } else {
          setDirection(-1);
        }
      }
    }

    setActiveTab(newTab);
  };

  // 스와이프로 다음 탭으로 이동
  const goToNextTab = () => {
    const nextTab = (activeTab === 3 ? 0 : activeTab + 1) as TabIndex;
    setDirection(1); // 오른쪽으로 이동
    setActiveTab(nextTab);
  };

  // 스와이프로 이전 탭으로 이동
  const goToPrevTab = () => {
    const prevTab = (activeTab === 0 ? 3 : activeTab - 1) as TabIndex;
    setDirection(-1); // 왼쪽으로 이동
    setActiveTab(prevTab);
  };

  // 원문 내용 표시 토글 함수
  const toggleOriginalText = () => {
    setShowOriginalText(!showOriginalText);
  };

  const isUrl = (text: string): boolean => {
    try {
      // URL 형식 확인
      new URL(text);
      // http로 시작하는지 추가 확인 (더 정확한 URL 감지)
      return /^https?:\/\//i.test(text);
    } catch (e) {
      return false;
    }
  };

  // 슬라이드 애니메이션 variants - 수정됨
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // 아이디어 맵 JSON 파싱 헬퍼 함수
  const parseIdeaMap = (content: any) => {
    try {
      if (typeof content === 'string' && content.trim().startsWith('{')) {
        return JSON.parse(content);
      } else if (typeof content === 'object' && content !== null) {
        return content;
      }
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
    }
    return { sections: [] };
  };

  // 선택된 탭 컨텐츠 렌더링
  const renderTabContent = (tabIndex: TabIndex) => {
    switch (tabIndex) {
      case 0: // 아이디어
        return (
          <div className="pt-4" ref={tabRefs.idea}>
            {/* 헤더 */}
            <div className="border-l-4 border-gray-300 pl-3 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tight text-base font-semibold text-gray-900">{memo.title}</h2>
              <ShareButton
                memo={memo}
                tabType="idea"
                contentRef={tabRefs.idea}
                onShareSuccess={handleShareSuccess}
                onShareError={handleShareError}
              />
            </div>

            {/* 핵심 문장 - 애플 스타일 */}
            <div className="p-4 py-8 my-4 rounded-lg border bg-gray-50 border-gray-300 shadow-sm">
              <div className="font-medium text-gray-800 leading-relaxed">
                {renderHTML(memo.labeling.key_sentence)}
              </div>
            </div>

            {/* 키워드 - 애플 스타일 태그 */}
            <div className="flex flex-wrap items-center mt-4 gap-2">
              {memo.labeling.keywords.map((keyword, keywordIndex) => (
                <span
                  key={keywordIndex}
                  className="px-4 py-1 text-sm border bg-emerald-50/50 border-gray-200 text-gray-700 rounded-full"
                >
                  #{keyword}
                </span>
              ))}
            </div>

            {/* 원본이미지와 제목 */}
            {memo.original_image && (
              <div className="flex flex-col gap-2 mt-2">
                <hr className="w-full" />

                <div className="grid grid-cols-8 items-center gap-2 w-full bg-gray-50 mt-1">
                  <div className="h-16 col-span-3 relative">
                    <img
                      src={memo.original_image}
                      alt="Original Image"
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // 이미지 로드 실패 시 대체 이미지나 에러 처리
                        console.log('이미지 로드 실패:', e);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="col-span-5 text-sm leading-tight text-gray-600 flex-grow overflow-hidden">
                    {memo.original_title || 'no title'}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 1: // 아이디어 맵
        return (
          <div className="pt-4" ref={tabRefs.key}>
            {/* 헤더 */}
            <div className="border-l-4 border-gray-300 pl-3 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tight text-base font-semibold text-gray-900">아이디어 맵</h2>
              <ShareButton
                memo={memo}
                tabType="key"
                contentRef={tabRefs.key}
                onShareSuccess={handleShareSuccess}
                onShareError={handleShareError}
              />
            </div>

            {/* 안전하게 모든 내용 즉시 렌더링 */}
            {(() => {
              const parsedContent = parseIdeaMap(memo.tweet_main);

              if (
                parsedContent.sections &&
                Array.isArray(parsedContent.sections) &&
                parsedContent.sections.length > 0
              ) {
                return (
                  <div className="space-y-6">
                    {parsedContent.sections.map((section: any, idx: number) => {
                      if (!section || typeof section !== 'object') return null;

                      const heading = section.heading || '섹션';
                      const points = Array.isArray(section.points) ? section.points : [];
                      const subSections = Array.isArray(section.sub_sections)
                        ? section.sub_sections
                        : [];

                      return (
                        <div key={idx} className="mb-4">
                          {/* 섹션 헤더 */}
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-400 flex items-center gap-2 mb-2">
                              <p>Section {idx + 1}</p>
                              <hr className="flex-1 border-t border-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {idx + 1}. {renderHTML(heading)}
                            </h3>
                          </div>

                          {/* 섹션 포인트 */}
                          <div className="space-y-3">
                            {points.map((point: any, pidx: number) => {
                              // 포인트 파싱 (불릿 제거, 콜론으로 분리)
                              const cleanPoint = point.replace(/^•\s?/, '');
                              const colonIndex = cleanPoint.indexOf(': ');

                              let title = cleanPoint;
                              let content = '';

                              if (colonIndex !== -1) {
                                title = cleanPoint.substring(0, colonIndex);
                                content = cleanPoint.substring(colonIndex + 2);
                              }

                              return (
                                <div
                                  key={pidx}
                                  className="p-3 py-6 rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
                                >
                                  <div className="text-gray-800">{renderHTML(title)}</div>
                                  {content && (
                                    <div className="text-gray-600 mt-1">{renderHTML(content)}</div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* 하위 섹션 */}
                          {subSections.length > 0 && (
                            <div className="mt-3 ml-3 pl-3 border-l-2 border-gray-200">
                              {subSections.map((subSection: any, ssidx: number) => {
                                if (!subSection || typeof subSection !== 'object') return null;

                                const subHeading = subSection.sub_heading || '하위 섹션';
                                const subPoints = Array.isArray(subSection.sub_points)
                                  ? subSection.sub_points
                                  : [];

                                return (
                                  <div key={ssidx} className="mb-3">
                                    {/* 하위 섹션 제목 */}
                                    <h4 className="font-medium text-gray-800 mb-2">
                                      {renderHTML(subHeading)}
                                    </h4>

                                    {/* 하위 섹션 포인트 */}
                                    {subPoints.length > 0 && (
                                      <div className="space-y-2">
                                        {subPoints.map((subPoint: any, spidx: number) => {
                                          const cleanPoint = subPoint.replace(/^◦\s?/, '');
                                          const colonIndex = cleanPoint.indexOf(': ');

                                          let title = cleanPoint;
                                          let content = '';

                                          if (colonIndex !== -1) {
                                            title = cleanPoint.substring(0, colonIndex);
                                            content = cleanPoint.substring(colonIndex + 2);
                                          }

                                          return (
                                            <div
                                              key={spidx}
                                              className="p-2 border border-gray-100 bg-gray-50 rounded"
                                            >
                                              <div className="text-sm text-gray-800">
                                                {renderHTML(title)}
                                              </div>
                                              {content && (
                                                <div className="text-gray-600 text-sm">
                                                  {renderHTML(content)}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                // 단순 텍스트 콘텐츠인 경우
                return (
                  <div className="p-4 my-4 rounded-lg bg-gray-50 border border-gray-200 shadow-sm">
                    <p className="text-base text-gray-800 leading-relaxed">
                      {typeof memo.tweet_main === 'string'
                        ? renderHTML(memo.tweet_main)
                        : JSON.stringify(memo.tweet_main)}
                    </p>
                  </div>
                );
              }
            })()}
          </div>
        );

      case 2: // 주요 내용
        return (
          <div className="pt-4" ref={tabRefs.main}>
            {/* 헤더 */}
            <div className="border-l-4 border-gray-300 pl-3 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tight text-base font-semibold text-gray-900">주요 내용</h2>
              <ShareButton
                memo={memo}
                tabType="main"
                contentRef={tabRefs.main}
                onShareSuccess={handleShareSuccess}
                onShareError={handleShareError}
              />
            </div>

            {/* 모든 항목 표시 */}
            <div className="space-y-3">
              {memo.thread.map((tweet, tweetIndex) => {
                // 번호 제거 (예: "1. ")
                const content = tweet.replace(/^\d+\.\s/, '');

                return (
                  <div
                    key={tweetIndex}
                    className="flex p-3 py-6 rounded-lg border border-gray-200 bg-gray-50 shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center mr-3 text-xs font-medium text-gray-600">
                      {tweetIndex + 1}
                    </div>
                    <div className="flex-1 text-gray-800">{renderHTML(content)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3: // 원문
        return (
          <div className="pt-4" ref={tabRefs.original}>
            {/* 헤더 */}
            <div className="border-l-4 border-gray-300 pl-3 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tight text-base font-semibold text-gray-900">원문</h2>
              <ShareButton
                memo={memo}
                tabType="original"
                contentRef={tabRefs.original}
                onShareSuccess={handleShareSuccess}
                onShareError={handleShareError}
              />
            </div>

            {memo.original_url ? (
              // URL인 경우 링크와 원문 내용 토글 버튼 표시
              <div className="">
                {/* URL을 일반 텍스트로 표시 */}
                <p className="text-sm text-gray-700 break-all">{memo.original_url}</p>

                {/* 원문으로 이동 버튼 추가 */}
                <div className="flex flex-col gap-1 mt-2">
                  <Link
                    href={memo.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-gray-800 hover:text-gray-900"
                  >
                    <ExternalLink size={16} className="mr-2" /> 원문으로 이동
                  </Link>

                  {/* 원문 내용보기 버튼 추가 */}
                  {memo.original_text && (
                    <button
                      onClick={toggleOriginalText}
                      className="flex items-center text-sm text-gray-800 hover:text-gray-900"
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
                  )}
                </div>

                {/* 원문 내용이 있고 보기 상태일 때만 표시 */}
                {showOriginalText && memo.original_text && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2 p-4 bg-white rounded-lg border border-gray-200">
                    {memo.original_text}
                  </p>
                )}

                {/* 원본이미지와 제목 */}
                {memo.original_image && (
                  <div className="flex flex-col gap-2 mt-2">
                    <hr className="w-full" />

                    <div className="grid grid-cols-8 items-center gap-2 w-full bg-gray-50 mt-1">
                      <div className="h-16 col-span-3 relative">
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
                      <p className="col-span-5 text-sm leading-tight text-gray-600 flex-grow overflow-hidden">
                        {memo.original_title || 'no title'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 일반 텍스트인 경우 기존처럼 표시
              <div className="p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {memo.original_text || '원문이 없습니다.'}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* 탭 네비게이션 - 애플 스타일 */}
      <div className="mt-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeTab(0)}
            className={`relative px-3 py-2 text-sm transition-colors ${
              activeTab === 0
                ? 'font-bold text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            아이디어
          </button>

          <button
            onClick={() => changeTab(1)}
            className={`relative px-3 py-2 text-sm transition-colors ${
              activeTab === 1
                ? 'font-bold text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            아이디어 맵
          </button>

          <button
            onClick={() => changeTab(2)}
            className={`relative px-3 py-2 text-sm transition-colors ${
              activeTab === 2
                ? 'font-bold text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            주요 내용
          </button>

          <button
            onClick={() => changeTab(3)}
            className={`relative px-3 py-2 text-sm transition-colors ${
              activeTab === 3
                ? 'font-bold text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            원문
          </button>
        </div>
      </div>

      {/* 슬라이드 컨텐츠 영역 */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="w-full"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) {
                goToPrevTab();
              } else if (info.offset.x < -100) {
                goToNextTab();
              }
            }}
          >
            {renderTabContent(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default MemoContent;
