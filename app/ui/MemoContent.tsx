// MemoContent.tsx 수정 - ref 활용
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memo } from '../utils/types';
import { Sparkle, ChevronDown, ChevronUp, ExternalLink, Quote, Share } from 'lucide-react';
import Link from 'next/link';
import ShareButton from './ShareButton';

// 탭 인덱스 타입 정의
type TabIndex = 0 | 1 | 2 | 3; // 0: 아이디어, 1: 아이디어 맵(이전 핵심 문장), 2: 주요 내용(이전 1), 3: 원문

interface MemoContentProps {
  memo: Memo;
  expanded: boolean;
  showLabeling: boolean;
  showOriginal: boolean;
  onToggleThread: () => void;
  onToggleLabeling: () => void;
  onToggleOriginal: () => void;
}

const MemoContent: React.FC<MemoContentProps> = ({
  memo,
  expanded,
  showLabeling,
  showOriginal,
  onToggleThread,
  onToggleLabeling,
  onToggleOriginal,
}) => {
  // 탭 관리를 위한 상태
  const [activeTab, setActiveTab] = useState<TabIndex>(0); // 기본값은 "아이디어" 탭
  const [direction, setDirection] = useState(0); // 슬라이드 방향 (-1: 왼쪽, 1: 오른쪽)
  // 원문 내용 표시 여부를 관리하는 상태 추가
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
        return tabRefs.key; // 순서 변경: 아이디어 맵(이전 핵심 문장)
      case 2:
        return tabRefs.main; // 순서 변경: 주요 내용
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
        return 'key'; // 순서 변경: 아이디어 맵(이전 핵심 문장)
      case 2:
        return 'main'; // 순서 변경: 주요 내용
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

  // 탭 변경 함수 - 수정된 버전
  const changeTab = (newTab: TabIndex) => {
    // 순환 구조에서 방향 결정 (0과 3이 인접한 것처럼)
    const currentIndex = activeTab;
    const targetIndex = newTab;

    // 일반적인 경우 (0→1, 1→2, 2→3, 3→0, 0→3, 3→2, 2→1, 1→0)
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
      // 특이 케이스 (0→2, 2→0, 1→3, 3→1) - 가장 가까운 방향 선택
      const diff = targetIndex - currentIndex;
      if (Math.abs(diff) === 2) {
        // 2칸 차이나는 경우, 방향 선택하기
        if (currentIndex < targetIndex) {
          setDirection(1); // 오른쪽으로 이동
        } else {
          setDirection(-1); // 왼쪽으로 이동
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

  // HTML 태그를 처리하는 함수 추가
  const processStrongTags = (text: string): string => {
    if (!text) return '';

    // <hi> 태그를 Tailwind CSS 클래스로 변환
    return text.replace(
      /<hi>(.*?)<\/hi>/g,
      '<span class="font-bold underline underline-offset-4 px-[2px]">$1</span>'
    );
  };

  // renderHTML 함수 추가
  const renderHTML = (htmlString: string = '') => {
    return <span dangerouslySetInnerHTML={{ __html: processStrongTags(htmlString) }} />;
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

  // 선택된 탭 컨텐츠 렌더링
  const renderTabContent = (tabIndex: TabIndex) => {
    switch (tabIndex) {
      case 0:
        return (
          <div className="pt-4" ref={tabRefs.idea}>
            {/* 미니멀한 명함 스타일의 디자인 */}
            <div className="border-l-2 border-gray-800 pl-2 py-1 mb-3 flex items-center justify-between gap-1">
              <h2 className="flex-1 tracking-tighter  text-sm text-gray-800">{memo.title}</h2>
              {/* <h2 className="flex-1 tracking-tighter font-semibold text-sm text-emerald-800">
                {memo.title}
              </h2> */}
              <ShareButton
                memo={memo}
                tabType="idea"
                contentRef={tabRefs.idea}
                onShareSuccess={handleShareSuccess}
                onShareError={handleShareError}
              />
            </div>

            {/* 핵심 문장을 강조 - 심플한 디자인 */}
            {/* <div className=" p-4 my-4 rounded-lg border border-gray-200 shadow-md"> */}
            <div className=" p-4 my-4 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-md">
              <div className="relative px-2">
                <p className="text-lg font-medium text-gray-100  py-4">
                  {renderHTML(memo.labeling.key_sentence)}
                </p>
              </div>
            </div>

            {/* 키워드 - 심플한 디자인 */}
            <div className="flex flex-wrap items-center mt-3">
              {memo.labeling.keywords.map((keyword, keywordIndex) => (
                <span key={keywordIndex} className="text-sm text-gray-800 px-1 rounded-full">
                  #{keyword}
                </span>
              ))}
            </div>

            {/* 원본이미지와 제목 */}
            {memo.original_image && (
              <div className="flex flex-col gap-2 mt-2">
                <hr className="w-full" />
                <div className="flex gap-4 items-center justify-between -mt-1">
                  <hr className="w-1/3" />
                  <p className="text-xs text-gray-400">원문 내용</p>
                  <hr className="w-1/3" />
                </div>
                <div className="grid grid-cols-8 items-center gap-2 w-full bg-gray-50">
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
      case 1: // 아이디어 맵 (이전의 핵심 문장, 이전의 2번 탭)
        return (
          <div className="pt-4" ref={tabRefs.key}>
            {/* 미니멀한 명함 스타일의 디자인 - 공유 아이콘 추가 */}
            <div className="border-l-2 border-emerald-800 pl-2 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tighter font-semibold text-sm text-emerald-800">
                아이디어 맵
              </h2>
              <ShareButton
                memo={memo}
                tabType="key"
                contentRef={tabRefs.key}
                onShareSuccess={handleShareSuccess}
                onShareError={handleShareError}
              />
            </div>

            {/* 안전하게 내용 렌더링 */}
            {(() => {
              // 기본적으로 일반 문자열로 처리
              let content = memo.tweet_main;
              let parsedContent = null;

              // 문자열인 경우 파싱 시도
              if (typeof content === 'string') {
                try {
                  // JSON 형식인지 확인 (중괄호로 시작하는지)
                  if (content.trim().startsWith('{')) {
                    parsedContent = JSON.parse(content);
                  }
                } catch (error) {
                  console.error('JSON 파싱 오류:', error);
                  // 에러 발생 시 원본 문자열 사용
                  parsedContent = null;
                }
              } else if (typeof content === 'object' && content !== null) {
                // 이미 객체인 경우 그대로 사용
                parsedContent = content;
              }

              // 파싱된 내용이 있고 sections 배열을 가지고 있는 경우
              if (
                parsedContent &&
                typeof parsedContent === 'object' &&
                parsedContent.sections &&
                Array.isArray(parsedContent.sections)
              ) {
                const sections = parsedContent.sections;

                return (
                  // 하나의 통합된 박스로 변경
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-md">
                    {sections.map((section: any, idx: number) => {
                      // 섹션 유효성 검사
                      if (!section || typeof section !== 'object') return null;

                      const heading = section.heading || '섹션';
                      const points = Array.isArray(section.points) ? section.points : [];
                      const subSections = Array.isArray(section.sub_sections)
                        ? section.sub_sections
                        : [];

                      return (
                        <div
                          key={idx}
                          className={`${idx > 0 ? 'mt-6 pt-4 border-t border-white/30' : ''}`}
                        >
                          {/* 섹션 제목 */}
                          <h3 className="text-lg font-bold text-white mb-3 pb-2">
                            {renderHTML(heading)}
                          </h3>

                          {/* 섹션 포인트 */}
                          {points.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {points.map((point: any, pidx: number) => (
                                <p key={pidx} className="text-sm text-gray-100 leading-relaxed">
                                  {renderHTML(point || '')}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* 하위 섹션이 있는 경우 렌더링 */}
                          {subSections.length > 0 && (
                            <div className="mt-3 pl-3 border-l-2 border-white/30">
                              {subSections.map((subSection: any, ssidx: number) => {
                                // 하위 섹션 유효성 검사
                                if (!subSection || typeof subSection !== 'object') return null;

                                const subHeading = subSection.sub_heading || '하위 섹션';
                                const subPoints = Array.isArray(subSection.sub_points)
                                  ? subSection.sub_points
                                  : [];

                                return (
                                  <div key={ssidx} className="mb-2">
                                    {/* 하위 섹션 제목 */}
                                    <h4 className="text-sm font-semibold text-gray-100 mb-1">
                                      {renderHTML(subHeading)}
                                    </h4>

                                    {/* 하위 섹션 포인트 */}
                                    {subPoints.length > 0 && (
                                      <div className="space-y-1 pl-2">
                                        {subPoints.map((subPoint: any, spidx: number) => (
                                          <p
                                            key={spidx}
                                            className="text-xs text-gray-100 leading-relaxed"
                                          >
                                            {renderHTML(subPoint || '')}
                                          </p>
                                        ))}
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
              }

              // 기존 문자열 형식으로 표시 - 폴백 처리
              return (
                <div className="p-4 my-4 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-md">
                  <div className="relative px-2">
                    <p className="text-lg font-medium text-gray-100 leading-tight py-4">
                      {typeof content === 'string' ? renderHTML(content) : JSON.stringify(content)}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      case 2: // 주요 내용 (이전의 1번 탭)
        return (
          <div className="pt-4" ref={tabRefs.main}>
            {/* 미니멀한 명함 스타일의 디자인 - 공유 아이콘 추가 */}
            <div className="border-l-2 border-emerald-800 pl-2 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tighter font-semibold text-sm text-emerald-800">주요 내용</h2>
              <ShareButton
                memo={memo}
                tabType="main"
                contentRef={tabRefs.main}
                onShareSuccess={handleShareSuccess}
                onShareError={handleShareError}
              />
            </div>

            {/* 주요 내용 - 아이디어 탭 스타일 적용 */}
            <div className="space-y-2">
              {memo.thread.map((tweet, tweetIndex) => (
                <div
                  key={tweetIndex}
                  className="p-4 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-sm"
                >
                  <p className="text-sm text-gray-100 leading-relaxed">{renderHTML(tweet)}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="pt-4" ref={tabRefs.original}>
            {/* 미니멀한 명함 스타일의 디자인 - 공유 아이콘 추가 */}
            <div className="border-l-2 border-emerald-800 pl-2 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tighter font-semibold text-sm text-emerald-800">원문</h2>
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
                    className="flex items-center text-sm text-emerald-700 hover:text-emerald-800"
                  >
                    <ExternalLink size={16} className="mr-2" /> 원문으로 이동
                  </Link>

                  {/* 원문 내용보기 버튼 추가 */}
                  {memo.original_text && (
                    <button
                      onClick={toggleOriginalText}
                      className="flex items-center text-sm text-emerald-700 hover:text-emerald-800"
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
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {memo.original_text}
                  </p>
                )}

                {/* 원본이미지와 제목 */}
                {memo.original_image && (
                  <div className="flex flex-col gap-2 mt-2">
                    <hr className="w-full" />
                    <div className="flex gap-4 items-center justify-between -mt-1">
                      <hr className="w-1/3" />
                      <p className="text-xs text-gray-400">원문 내용</p>
                      <hr className="w-1/3" />
                    </div>
                    <div className="grid grid-cols-8 items-center gap-2 w-full bg-gray-50">
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
            ) : (
              // 일반 텍스트인 경우 기존처럼 표시
              <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 shadow-sm">
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
      {/* 개선된 탭 네비게이션 - 탭 순서 변경 */}
      <div className="mt-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeTab(0)}
            className={`relative py-2 px-2 text-sm transition-colors ${
              activeTab === 0
                ? 'font-bold text-emerald-800 border-b-2 border-emerald-800'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {activeTab === 0 && (
              <Sparkle size={14} className="absolute -top-1 -right-1 text-emerald-800" />
            )}
            아이디어
          </button>

          <button
            onClick={() => changeTab(1)}
            className={`relative py-2 px-2 text-sm transition-colors ${
              activeTab === 1
                ? 'font-bold text-emerald-800 border-b-2 border-emerald-800'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {activeTab === 1 && (
              <Sparkle size={14} className="absolute -top-1 -right-1 text-emerald-800" />
            )}
            아이디어 맵
          </button>

          <button
            onClick={() => changeTab(2)}
            className={`relative py-2 px-2 text-sm transition-colors ${
              activeTab === 2
                ? 'font-bold text-emerald-800 border-b-2 border-emerald-800'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {activeTab === 2 && (
              <Sparkle size={14} className="absolute -top-1 -right-1 text-emerald-800" />
            )}
            주요 내용
          </button>

          <button
            onClick={() => changeTab(3)}
            className={`relative py-2 px-2 text-sm transition-colors ${
              activeTab === 3
                ? 'font-bold text-emerald-800 border-b-2 border-emerald-800'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {activeTab === 3 && (
              <Sparkle size={14} className="absolute -top-1 -right-1 text-emerald-800" />
            )}
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
