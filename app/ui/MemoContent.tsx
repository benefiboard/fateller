//app/ui/MemoContent.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memo } from '../utils/types';
import { Sparkle } from 'lucide-react';

// 탭 인덱스 타입 정의
type TabIndex = 0 | 1 | 2 | 3; // 0: 아이디어, 1: 핵심 문장, 2: 주요 내용, 3: 원문

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

  // HTML 태그를 완전히 제거하는 함수
  const removeHtmlTags = (text: string): string => {
    if (!text) return '';

    // 모든 HTML 태그를 제거하고 태그 내용만 남김
    return text.replace(/<\/?[^>]+(>|$)/g, '');
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
          <div className="pt-4">
            <h2 className="mt-2 flex gap-1 underline underline-offset-4">- {memo.title} -</h2>
            <p className="py-8 my-2 text-lg font-semibold tracking-tighter leading-relaxed">
              "{renderHTML(memo.labeling.key_sentence)}"
            </p>
            <div className="flex flex-wrap items-center text-emerald-700 gap-2">
              {memo.labeling.keywords.map((keyword, keywordIndex) => (
                <span
                  key={keywordIndex}
                  className="text-sm text-emerald-800 p-1 rounded border border-emerald-100"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium text-emerald-700">핵심 문장</h3>
            <p className="py-2 text-sm mt-1 italic text-gray-800 bg-gray-100 p-4 rounded-lg leading-relaxed">
              "{renderHTML(memo.tweet_main)}"
            </p>
          </div>
        );
      case 2:
        return (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium text-emerald-700">주요 내용</h3>
            <div className="mt-2">
              {memo.thread.map((tweet, tweetIndex) => (
                <p key={tweetIndex} className="text-gray-700 text-sm mb-4">
                  {renderHTML(tweet)}
                </p>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="mt-4 space-y-3">
            <h3 className="text-sm font-medium text-emerald-700">원문</h3>
            {memo.original_text && isUrl(memo.original_text) ? (
              // URL인 경우 링크와 바로가기 버튼 표시
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">원본 URL:</p>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 break-all mr-2">{memo.original_text}</span>
                  <a
                    href={memo.original_text}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600"
                  >
                    바로가기
                  </a>
                </div>
              </div>
            ) : (
              // 일반 텍스트인 경우 기존처럼 표시
              <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2 p-4 bg-gray-50 rounded-lg">
                {memo.original_text || '원문이 없습니다.'}
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* 탭 네비게이션 */}
      <hr className="border-1 border-gray-200 mb-1" />
      <div className="flex space-x-4">
        <button
          onClick={() => changeTab(0)}
          className={`text-sm transition-colors ${
            activeTab === 0 ? 'font-bold text-emerald-700' : 'text-gray-400'
          }`}
        >
          아이디어
        </button>

        <p className="text-gray-400">|</p>

        <button
          onClick={() => changeTab(1)}
          className={`text-sm transition-colors ${
            activeTab === 1 ? 'font-bold text-emerald-700' : 'text-gray-400'
          }`}
        >
          핵심 문장
        </button>

        <p className="text-gray-400">|</p>

        <button
          onClick={() => changeTab(2)}
          className={`text-sm transition-colors ${
            activeTab === 2 ? 'font-bold text-emerald-700' : 'text-gray-400'
          }`}
        >
          주요 내용
        </button>

        <p className="text-gray-400">|</p>

        <button
          onClick={() => changeTab(3)}
          className={`text-sm transition-colors ${
            activeTab === 3 ? 'font-bold text-emerald-700' : 'text-gray-400'
          }`}
        >
          원문
        </button>
      </div>
      <hr className="border-1 border-gray-200 mt-1" />

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
