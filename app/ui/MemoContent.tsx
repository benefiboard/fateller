{
  /* 원본이미지와 제목 */
}
{
  /* {memo.original_image && (
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
            )} */
}

// MemoContent.tsx - 타이핑 즉시 완료 기능 추가

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memo } from '../utils/types';
import { Sparkle, ChevronDown, ChevronUp, ExternalLink, Quote, Share } from 'lucide-react';
import Link from 'next/link';
import ShareButton from './ShareButton';
import Typewriter from 'typewriter-effect'; // typewriter-effect 라이브러리 임포트

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
  isVisible?: boolean; // 메모가 화면에 보이는지 여부 (새로 추가)
}

// 전역적으로 각 메모의 각 탭별 타이핑 완료 상태를 추적
// Map<메모ID, Map<탭인덱스, boolean>>
const typingCompletedMap = new Map<string, Map<number, boolean>>();

const MemoContent: React.FC<MemoContentProps> = ({
  memo,
  expanded,
  showLabeling,
  showOriginal,
  onToggleThread,
  onToggleLabeling,
  onToggleOriginal,
  isVisible = false, // 기본값은 false
}) => {
  // 탭 관리를 위한 상태
  const [activeTab, setActiveTab] = useState<TabIndex>(0); // 기본값은 "아이디어" 탭
  const [direction, setDirection] = useState(0); // 슬라이드 방향 (-1: 왼쪽, 1: 오른쪽)
  // 원문 내용 표시 여부를 관리하는 상태 추가
  const [showOriginalText, setShowOriginalText] = useState(false);

  // 타이핑 효과 상태 관리
  const [shouldStartTyping, setShouldStartTyping] = useState(false);

  // 아이디어 맵(탭 1) 관련 상태
  const [activeSection, setActiveSection] = useState(0);
  const [activeSectionPoint, setActiveSectionPoint] = useState(-1);
  const [activeSubSection, setActiveSubSection] = useState(-1);
  const [activeSubSectionPoint, setActiveSubSectionPoint] = useState(-1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [completedSubSections, setCompletedSubSections] = useState<{ [key: number]: number[] }>({});

  // 주요 내용(탭 2) 관련 상태
  const [activeTweet, setActiveTweet] = useState(0);
  const [completedTweets, setCompletedTweets] = useState<number[]>([]);

  // 각 탭의 타이핑 완료 상태 (로컬)
  const [tab0Completed, setTab0Completed] = useState(false);
  const [tab1Completed, setTab1Completed] = useState(false);
  const [tab2Completed, setTab2Completed] = useState(false);

  // 각 탭에 대한 ref 추가
  const tabRefs = {
    idea: useRef<HTMLDivElement>(null),
    main: useRef<HTMLDivElement>(null),
    key: useRef<HTMLDivElement>(null),
    original: useRef<HTMLDivElement>(null),
  };

  // 탭 변경 추적용 ref
  const prevActiveTabRef = useRef<TabIndex | null>(null);

  // 메모 ID를 기반으로 타이핑 완료 상태 관리 초기화
  useEffect(() => {
    if (memo?.id) {
      // 이 메모에 대한 타이핑 완료 상태가 없으면 초기화
      if (!typingCompletedMap.has(memo.id)) {
        typingCompletedMap.set(memo.id, new Map<number, boolean>());
      }

      // 이미 완료된 탭 상태 가져오기
      const memoTypingMap = typingCompletedMap.get(memo.id);
      if (memoTypingMap) {
        setTab0Completed(memoTypingMap.get(0) || false);
        setTab1Completed(memoTypingMap.get(1) || false);
        setTab2Completed(memoTypingMap.get(2) || false);
      }
    }
  }, [memo?.id]);

  // 메모가 화면에 보이면 타이핑 시작
  useEffect(() => {
    if (isVisible) {
      setShouldStartTyping(true);
    }
  }, [isVisible]);

  // 활성 탭 변경 시 이전 탭 저장
  useEffect(() => {
    prevActiveTabRef.current = activeTab;
  }, [activeTab]);

  // 공유버튼 타입애니메이션 스톱!! completeAllTypingEffects 함수 추가
  const completeAllTypingEffects = (e: React.MouseEvent<HTMLDivElement, MouseEvent> | null) => {
    // 이벤트가 전달되면 전파 중지 (버블링 방지)
    if (e) {
      e.stopPropagation();
      console.log('ShareButton 클릭 - 타이핑 효과 중단 실행');
    }

    // 모든 탭의 타이핑 완료 상태를 true로 설정
    console.log('이전 상태:', { tab0: tab0Completed, tab1: tab1Completed, tab2: tab2Completed });

    setTab0Completed(true);
    setTab1Completed(true);
    setTab2Completed(true);

    // 타이머로 강제 리렌더링 확인용 로그
    setTimeout(() => {
      console.log('상태 업데이트 후:', {
        tab0: tab0Completed,
        tab1: tab1Completed,
        tab2: tab2Completed,
      });
    }, 100);

    // 전역 상태에도 저장
    if (memo?.id) {
      saveTypingCompletedState(0, true);
      saveTypingCompletedState(1, true);
      saveTypingCompletedState(2, true);
      console.log('전역 타이핑 상태 저장 완료:', memo.id);
    }

    // 아이디어 맵 탭(탭 1)에 필요한 추가 상태 설정
    if (memo.tweet_main) {
      try {
        const parsedContent = parseIdeaMap(memo.tweet_main);
        if (parsedContent.sections && Array.isArray(parsedContent.sections)) {
          // 모든 섹션을 완료 상태로 설정
          const allSections = createRange(parsedContent.sections.length);
          setCompletedSections(allSections);
          console.log('모든 섹션 완료 설정:', allSections);

          // 모든 하위 섹션도 완료 상태로 설정
          const allSubSections: { [key: number]: number[] } = {};
          parsedContent.sections.forEach((section: any, idx: number) => {
            if (section.sub_sections && Array.isArray(section.sub_sections)) {
              allSubSections[idx] = createRange(section.sub_sections.length);
            }
          });
          setCompletedSubSections(allSubSections);
          console.log('모든 하위섹션 완료 설정:', allSubSections);
        }
      } catch (error) {
        console.error('아이디어 맵 파싱 오류:', error);
      }
    }

    // 주요 내용 탭(탭 2)에 필요한 추가 상태 설정
    if (memo.thread && Array.isArray(memo.thread)) {
      // 모든 트윗을 완료 상태로 설정
      const allTweets = createRange(memo.thread.length);
      setCompletedTweets(allTweets);
      console.log('모든 트윗 완료 설정:', allTweets);
    }

    // 강제 리렌더링을 위해 다른 상태 업데이트
    setActiveSection(0);
    setActiveSectionPoint(-1);
    setActiveSubSection(-1);
    setActiveSubSectionPoint(-1);
    setActiveTweet(0);

    // 리렌더링 확인
    console.log('타이핑 효과 중단 함수 실행 완료');
  };

  // 각 탭의 타이핑 완료 상태 저장
  const saveTypingCompletedState = (tabIndex: number, completed: boolean) => {
    if (memo?.id) {
      const memoTypingMap = typingCompletedMap.get(memo.id);
      if (memoTypingMap) {
        memoTypingMap.set(tabIndex, completed);
      }
    }
  };

  const createRange = (n: number): number[] => {
    const result = [];
    for (let i = 0; i < n; i++) {
      result.push(i);
    }
    return result;
  };

  // 현재 탭의 타이핑 효과를 즉시 완료시키는 함수 (NEW)
  const completeCurrentTabTyping = () => {
    switch (activeTab) {
      case 0:
        if (!tab0Completed) {
          setTab0Completed(true);
          saveTypingCompletedState(0, true);
        }
        break;
      case 1:
        if (!tab1Completed) {
          setTab1Completed(true);
          saveTypingCompletedState(1, true);

          // 아이디어 맵 관련 상태도 모두 완료 처리
          const parsedContent = parseIdeaMap(memo.tweet_main);
          if (parsedContent.sections && Array.isArray(parsedContent.sections)) {
            const allSections = createRange(parsedContent.sections.length);
            setCompletedSections(allSections);

            // 모든 하위 섹션도 완료 처리
            const allSubSections: { [key: number]: number[] } = {};
            parsedContent.sections.forEach((section: any, idx: number) => {
              if (section?.sub_sections && Array.isArray(section.sub_sections)) {
                allSubSections[idx] = createRange(section.sub_sections.length);
              }
            });
            setCompletedSubSections(allSubSections);
          }
        }
        break;
      case 2:
        if (!tab2Completed) {
          setTab2Completed(true);
          saveTypingCompletedState(2, true);

          // 주요 내용 관련 상태도 모두 완료 처리
          if (memo.thread && Array.isArray(memo.thread)) {
            setCompletedTweets(createRange(memo.thread.length));
          }
        }
        break;
    }
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

  // 공유 성공 핸들러 - 타이핑 완료 처리 추가 (NEW)
  const handleShareSuccess = (type: 'image' | 'text' | 'link') => {
    // 타이핑 즉시 완료
    completeCurrentTabTyping();
    console.log(`${getCurrentTabType()} 탭 ${type} 공유 성공`);
  };

  // 공유 실패 핸들러 - 타이핑 완료 처리 추가 (NEW)
  const handleShareError = (type: 'image' | 'text' | 'link', error: string) => {
    // 타이핑 즉시 완료
    completeCurrentTabTyping();
    console.error(`${getCurrentTabType()} 탭 ${type} 공유 실패:`, error);
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

  // 타이핑 완료 핸들러 - 탭 0 (아이디어)
  const handleTab0TypingComplete = () => {
    setTab0Completed(true);
    saveTypingCompletedState(0, true);
  };

  // 타이핑 완료 핸들러 - 탭 1 (아이디어 맵)의 마지막 항목
  const handleTab1FinalTypingComplete = () => {
    setTab1Completed(true);
    saveTypingCompletedState(1, true);
  };

  // 타이핑 완료 핸들러 - 탭 2 (주요 내용)의 마지막 항목
  const handleTab2FinalTypingComplete = () => {
    setTab2Completed(true);
    saveTypingCompletedState(2, true);
  };

  // 순차적 타이핑 핸들러 (아이디어 맵 - 섹션 제목)
  const handleSectionHeadingTyped = (sectionIndex: number) => {
    // 섹션 헤딩 타이핑 완료 시 해당 섹션의 첫 번째 포인트 활성화
    setActiveSectionPoint(0);
  };

  // 순차적 타이핑 핸들러 (아이디어 맵 - 섹션 포인트)
  const handleSectionPointTyped = (sectionIndex: number, pointIndex: number, points: any[]) => {
    if (pointIndex < points.length - 1) {
      // 다음 포인트 활성화
      setActiveSectionPoint(pointIndex + 1);
    } else {
      // 포인트 모두 완료, 하위 섹션이 있는지 확인
      const parsedContent =
        typeof memo.tweet_main === 'string' && memo.tweet_main.trim().startsWith('{')
          ? JSON.parse(memo.tweet_main)
          : { sections: [] };

      const currentSection = parsedContent.sections[sectionIndex] || {};
      const subSections = currentSection.sub_sections || [];

      // 현재 섹션의 모든 포인트 완료 상태 기록
      setCompletedSections((prev) => [...prev, sectionIndex]);

      if (subSections.length > 0) {
        // 하위 섹션이 있으면 첫 번째 하위 섹션 활성화
        setActiveSubSection(0);
        setActiveSubSectionPoint(-1);
      } else if (sectionIndex < parsedContent.sections.length - 1) {
        // 하위 섹션이 없고 다음 섹션이 있으면 다음 섹션 활성화
        setActiveSection(sectionIndex + 1);
        setActiveSectionPoint(-1);
        setActiveSubSection(-1);
        setActiveSubSectionPoint(-1);
      } else {
        // 모든 섹션 완료, 타이핑 완료 상태 설정
        console.log('모든 섹션 타이핑 완료');
        handleTab1FinalTypingComplete();
      }
    }
  };

  // 순차적 타이핑 핸들러 (아이디어 맵 - 하위 섹션 제목)
  const handleSubSectionHeadingTyped = (sectionIndex: number, subSectionIndex: number) => {
    // 하위 섹션 제목 타이핑 완료 시 해당 하위 섹션의 첫 번째 포인트 활성화
    setActiveSubSectionPoint(0);
  };

  // 순차적 타이핑 핸들러 (아이디어 맵 - 하위 섹션 포인트)
  const handleSubSectionPointTyped = (
    sectionIndex: number,
    subSectionIndex: number,
    pointIndex: number,
    subPoints: any[]
  ) => {
    if (pointIndex < subPoints.length - 1) {
      // 다음 하위 포인트 활성화
      setActiveSubSectionPoint(pointIndex + 1);
    } else {
      // 현재 하위 섹션의 모든 포인트 완료 상태 기록
      setCompletedSubSections((prev) => {
        const sectionSubs = prev[sectionIndex] || [];
        return {
          ...prev,
          [sectionIndex]: [...sectionSubs, subSectionIndex],
        };
      });

      try {
        const parsedContent =
          typeof memo.tweet_main === 'string' && memo.tweet_main.trim().startsWith('{')
            ? JSON.parse(memo.tweet_main)
            : { sections: [] };

        const currentSection = parsedContent.sections[sectionIndex] || {};
        const subSections = currentSection.sub_sections || [];

        if (subSectionIndex < subSections.length - 1) {
          // 다음 하위 섹션 활성화
          setActiveSubSection(subSectionIndex + 1);
          setActiveSubSectionPoint(-1);
        } else if (sectionIndex < parsedContent.sections.length - 1) {
          // 모든 하위 섹션 완료, 다음 섹션 활성화
          setActiveSection(sectionIndex + 1);
          setActiveSectionPoint(-1);
          setActiveSubSection(-1);
          setActiveSubSectionPoint(-1);
        } else {
          // 모든 섹션과 하위 섹션 완료, 타이핑 완료 상태 설정
          console.log('모든 콘텐츠 타이핑 완료');
          handleTab1FinalTypingComplete();
        }
      } catch (error) {
        console.error('하위 섹션 파싱 오류:', error);
        // 오류가 발생해도 완료 처리 (방어 코드)
        handleTab1FinalTypingComplete();
      }
    }
  };

  // 트윗 타이핑 완료 핸들러 (주요 내용용)
  const handleTweetTyped = (tweetIndex: number) => {
    // 완료된 트윗 상태 추가
    setCompletedTweets((prev) => [...prev, tweetIndex]);

    if (tweetIndex < (memo.thread?.length || 0) - 1) {
      // 다음 트윗 활성화
      setActiveTweet(tweetIndex + 1);
    } else {
      // 마지막 트윗까지 완료, 타이핑 완료 상태 설정
      handleTab2FinalTypingComplete();
    }
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
            {/* 미니멀한 명함 스타일의 디자인 */}
            <div className="border-l-2 border-gray-400 pl-2 py-1 mb-3 flex items-center justify-between gap-1">
              <h2 className="flex-1 tracking-tighter text-sm text-gray-800">{memo.title}</h2>
              <div onClick={completeAllTypingEffects} style={{ cursor: 'pointer' }}>
                <ShareButton
                  memo={memo}
                  tabType="idea"
                  contentRef={tabRefs.idea}
                  onShareSuccess={handleShareSuccess}
                  onShareError={handleShareError}
                />
              </div>
            </div>

            {/* 핵심 문장을 강조 - 심플한 디자인 - 타이핑 효과 적용 + 클릭 효과 추가 */}
            <div
              className="p-4 py-8 my-4 rounded-lg border-2 bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-200 shadow-md animate-gradient cursor-pointer"
              onClick={completeCurrentTabTyping} // 클릭 시 타이핑 완료 (NEW)
            >
              <div className="relative p-2">
                <div className="text-lg font-medium text-gray-100">
                  {shouldStartTyping && !tab0Completed ? (
                    <Typewriter
                      onInit={(typewriter) => {
                        // HTML 태그 처리된 텍스트가 있는 경우
                        const processedText = processStrongTags(memo.labeling.key_sentence);

                        typewriter
                          .typeString(processedText)
                          .pauseFor(1000)
                          .callFunction(handleTab0TypingComplete)
                          .start();
                      }}
                      options={{
                        cursor: '',
                        delay: 80, // 타이핑 속도 조절
                        wrapperClassName: 'text-lg font-medium text-gray-100',
                      }}
                    />
                  ) : (
                    // 타이핑 완료된 경우 또는 시작 전 상태
                    <span
                      className={shouldStartTyping || tab0Completed ? 'opacity-100' : 'opacity-0'}
                    >
                      {renderHTML(memo.labeling.key_sentence)}
                    </span>
                  )}
                </div>
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
          </div>
        );
      case 1: // 아이디어 맵 - 이미 완료된 경우 바로 표시
        if (tab1Completed) {
          // 이미 타이핑이 완료된 경우 - 모든 내용 즉시 표시
          return (
            <div className="pt-4" ref={tabRefs.key}>
              {/* 미니멀한 명함 스타일의 디자인 - 공유 아이콘 추가 */}
              <div className="border-l-2 border-gray-400 pl-2 py-1 mb-3 flex items-center justify-between gap-1">
                <h2 className="flex-1 tracking-tighter text-sm text-gray-800">아이디어 맵</h2>
                <div onClick={completeAllTypingEffects} style={{ cursor: 'pointer' }}>
                  <ShareButton
                    memo={memo}
                    tabType="key"
                    contentRef={tabRefs.key}
                    onShareSuccess={handleShareSuccess}
                    onShareError={handleShareError}
                  />
                </div>
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
                    <div className="p-4 py-10 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-md animate-gradient">
                      {parsedContent.sections.map((section: any, idx: number) => {
                        if (!section || typeof section !== 'object') return null;

                        const heading = section.heading || '섹션';
                        const points = Array.isArray(section.points) ? section.points : [];
                        const subSections = Array.isArray(section.sub_sections)
                          ? section.sub_sections
                          : [];

                        return (
                          <div
                            key={idx}
                            className={`${idx > 0 ? 'mt-6 pt-6 border-t border-white/30' : ''}`}
                          >
                            {/* 섹션 제목 */}
                            <h3 className="text-lg font-bold text-white mb-3 pb-2 tracking-tighter">
                              {idx + 1}. {renderHTML(heading)}
                            </h3>

                            {/* 섹션 포인트 */}
                            {points.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {points.map((point: any, pidx: number) => (
                                  <p key={pidx} className="text-gray-100 tracking-tighter">
                                    {renderHTML(point || '')}
                                  </p>
                                ))}
                              </div>
                            )}

                            {/* 하위 섹션 */}
                            {subSections.length > 0 && (
                              <div className="mt-6 pl-3 border-l-2 border-white/30">
                                {subSections.map((subSection: any, ssidx: number) => {
                                  if (!subSection || typeof subSection !== 'object') return null;

                                  const subHeading = subSection.sub_heading || '하위 섹션';
                                  const subPoints = Array.isArray(subSection.sub_points)
                                    ? subSection.sub_points
                                    : [];

                                  return (
                                    <div key={ssidx} className="mb-2">
                                      {/* 하위 섹션 제목 */}
                                      <h4 className="font-semibold text-gray-100 mb-1">
                                        <span className="text-xs">▷</span> {renderHTML(subHeading)}
                                      </h4>

                                      {/* 하위 섹션 포인트 */}
                                      {subPoints.length > 0 && (
                                        <div className="space-y-1 pl-2">
                                          {subPoints.map((subPoint: any, spidx: number) => (
                                            <p
                                              key={spidx}
                                              className="text-sm text-gray-100 leading-relaxed"
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
                } else {
                  // 단순 텍스트 콘텐츠인 경우
                  return (
                    <div className="p-4 my-4 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-md">
                      <div className="relative px-2">
                        <p className="text-lg font-medium text-gray-100 leading-tight py-4">
                          {typeof memo.tweet_main === 'string'
                            ? renderHTML(memo.tweet_main)
                            : JSON.stringify(memo.tweet_main)}
                        </p>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          );
        }

        // 아직 타이핑 완료되지 않은 경우 - 순차적 타이핑 효과 적용
        return (
          <div className="pt-4" ref={tabRefs.key}>
            {/* 미니멀한 명함 스타일의 디자인 - 공유 아이콘 추가 */}
            <div className="border-l-2 border-gray-400 pl-2 py-1 mb-3 flex items-center justify-between gap-1">
              <h2 className="flex-1 tracking-tighter  text-sm text-gray-800">아이디어 맵</h2>
              <div onClick={completeAllTypingEffects} style={{ cursor: 'pointer' }}>
                <ShareButton
                  memo={memo}
                  tabType="key"
                  contentRef={tabRefs.key}
                  onShareSuccess={handleShareSuccess}
                  onShareError={handleShareError}
                />
              </div>
            </div>

            {/* 안전하게 내용 렌더링 - 순차적 타이핑 적용 */}
            {(() => {
              // 기본적으로 일반 문자열로 처리
              let content = memo.tweet_main;
              let parsedContent = parseIdeaMap(content);

              // 파싱된 내용이 있고 sections 배열을 가지고 있는 경우
              if (
                parsedContent &&
                typeof parsedContent === 'object' &&
                parsedContent.sections &&
                Array.isArray(parsedContent.sections)
              ) {
                const sections = parsedContent.sections;

                return (
                  // 하나의 통합된 박스로 변경 + 클릭 효과 추가
                  <div
                    className="p-4 py-10 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-md animate-gradient cursor-pointer"
                    onClick={completeCurrentTabTyping} // 클릭 시 타이핑 완료 (NEW)
                  >
                    {sections.map((section: any, idx: number) => {
                      // 섹션 유효성 검사
                      if (!section || typeof section !== 'object') return null;

                      const heading = section.heading || '섹션';
                      const points = Array.isArray(section.points) ? section.points : [];
                      const subSections = Array.isArray(section.sub_sections)
                        ? section.sub_sections
                        : [];

                      // 수정된 가시성 조건
                      // 1. 이미 완료된 섹션은 항상 표시
                      // 2. 현재 활성화된 섹션 또는 그 이전 섹션만 표시
                      const isSectionVisible =
                        completedSections.includes(idx) || idx <= activeSection;

                      return (
                        <div
                          key={idx}
                          className={`${idx > 0 ? 'mt-6 pt-6 border-t border-white/30' : ''} 
                                      ${isSectionVisible ? '' : 'hidden'}`}
                        >
                          {/* 섹션 제목 - 타이핑 효과 적용 */}
                          <h3 className="text-lg font-bold text-white mb-3 pb-2 tracking-tighter">
                            {idx + 1}.{' '}
                            {shouldStartTyping &&
                            idx === activeSection &&
                            activeSectionPoint === -1 ? (
                              <Typewriter
                                onInit={(typewriter) => {
                                  typewriter
                                    .typeString(processStrongTags(heading))
                                    .callFunction(() => {
                                      // 섹션 제목 타이핑 완료 시 포인트 활성화
                                      handleSectionHeadingTyped(idx);
                                    })
                                    .start();
                                }}
                                options={{
                                  cursor: '',
                                  delay: 40,
                                  wrapperClassName: 'text-lg font-bold text-white inline',
                                }}
                              />
                            ) : (
                              <span className={isSectionVisible ? 'opacity-100' : 'opacity-0'}>
                                {renderHTML(heading)}
                              </span>
                            )}
                          </h3>

                          {/* 섹션 포인트 - 타이핑 효과 적용 */}
                          {points.length > 0 && (
                            <div className="space-y-2 mb-3">
                              {points.map((point: any, pidx: number) => {
                                // 수정된 포인트 가시성 조건
                                // 1. 이전 섹션은 모든 포인트 표시
                                // 2. 현재 섹션은 활성화된 포인트까지만 표시
                                const isPointVisible =
                                  completedSections.includes(idx) || // 완료된 섹션의 모든 포인트
                                  idx < activeSection || // 이전 섹션의 모든 포인트
                                  (idx === activeSection && pidx <= activeSectionPoint); // 현재 섹션의 활성화된 포인트까지

                                return (
                                  <p
                                    key={pidx}
                                    className={`text-gray-100 tracking-tighter ${
                                      isPointVisible ? '' : 'hidden'
                                    }`}
                                  >
                                    {shouldStartTyping &&
                                    idx === activeSection &&
                                    pidx === activeSectionPoint ? (
                                      <Typewriter
                                        onInit={(typewriter) => {
                                          typewriter
                                            .typeString(processStrongTags(point || ''))
                                            .callFunction(() => {
                                              // 포인트 타이핑 완료 시 다음 포인트 또는 다음 섹션 활성화
                                              handleSectionPointTyped(idx, pidx, points);
                                            })
                                            .start();
                                        }}
                                        options={{
                                          cursor: '',
                                          delay: 30,
                                          wrapperClassName: 'text-gray-100 tracking-tighter',
                                        }}
                                      />
                                    ) : (
                                      <span
                                        className={isPointVisible ? 'opacity-100' : 'opacity-0'}
                                      >
                                        {renderHTML(point || '')}
                                      </span>
                                    )}
                                  </p>
                                );
                              })}
                            </div>
                          )}

                          {/* 하위 섹션 - 서브섹션 가시성 문제 수정 */}
                          {subSections.length > 0 && (
                            <div className="mt-6 pl-3 border-l-2 border-white/30">
                              {subSections.map((subSection: any, ssidx: number) => {
                                // 하위 섹션 유효성 검사
                                if (!subSection || typeof subSection !== 'object') return null;

                                const subHeading = subSection.sub_heading || '하위 섹션';
                                const subPoints = Array.isArray(subSection.sub_points)
                                  ? subSection.sub_points
                                  : [];

                                // 수정된 하위 섹션 가시성 조건
                                const completedSubsForSection = completedSubSections[idx] || [];

                                // 개선된 하위 섹션 가시성 로직
                                const isSubSectionVisible =
                                  // 완료된 섹션의 모든 하위 섹션 표시
                                  completedSections.includes(idx) ||
                                  // 이전 섹션의 모든 하위 섹션 표시
                                  idx < activeSection ||
                                  // 현재 섹션에서:
                                  (idx === activeSection &&
                                    // 1. 모든 포인트가 타이핑된 상태이고
                                    (completedSections.includes(idx) ||
                                      activeSectionPoint === points.length - 1 ||
                                      activeSectionPoint === -1) &&
                                    // 2. 이미 타이핑 완료된 하위 섹션이거나 현재 활성화된 하위 섹션까지만 표시
                                    (completedSubsForSection.includes(ssidx) ||
                                      ssidx === activeSubSection));

                                return (
                                  <div
                                    key={ssidx}
                                    className={`mb-2 ${isSubSectionVisible ? '' : 'hidden'}`}
                                  >
                                    {/* 하위 섹션 제목 - 타이핑 효과 적용 */}
                                    <h4 className="font-semibold text-gray-100 mb-1">
                                      <span className="text-xs">▷</span>{' '}
                                      {shouldStartTyping &&
                                      idx === activeSection &&
                                      ssidx === activeSubSection &&
                                      activeSubSectionPoint === -1 ? (
                                        <Typewriter
                                          onInit={(typewriter) => {
                                            typewriter
                                              .typeString(processStrongTags(subHeading))
                                              .callFunction(() => {
                                                // 하위 섹션 제목 타이핑 완료 시 하위 포인트 활성화
                                                handleSubSectionHeadingTyped(idx, ssidx);
                                              })
                                              .start();
                                          }}
                                          options={{
                                            cursor: '',
                                            delay: 30,
                                            wrapperClassName: 'inline',
                                          }}
                                        />
                                      ) : (
                                        // isSubSectionVisible이 true인 경우에만 내용이 보이도록 조정
                                        <span
                                          className={
                                            isSubSectionVisible ? 'opacity-100' : 'opacity-0'
                                          }
                                        >
                                          {renderHTML(subHeading)}
                                        </span>
                                      )}
                                    </h4>

                                    {/* 하위 섹션 포인트 - 타이핑 효과 적용 */}
                                    {subPoints.length > 0 && (
                                      <div className="space-y-1 pl-2">
                                        {subPoints.map((subPoint: any, spidx: number) => {
                                          // 수정된 하위 포인트 가시성 조건 - 훨씬 제한적
                                          const isSubPointVisible =
                                            // 이미 완료된 섹션의 모든 하위 포인트
                                            completedSections.includes(idx) ||
                                            // 이전 섹션의 모든 하위 포인트
                                            idx < activeSection ||
                                            // 현재 섹션에서:
                                            (idx === activeSection &&
                                              // 완료된 하위 섹션의 모든 포인트
                                              (completedSubsForSection.includes(ssidx) ||
                                                // 현재 타이핑 중인 하위 섹션에서 현재 활성화된 포인트까지만 표시
                                                (ssidx === activeSubSection &&
                                                  spidx <= activeSubSectionPoint)));

                                          return (
                                            <p
                                              key={spidx}
                                              className={`text-sm text-gray-100 leading-relaxed ${
                                                isSubPointVisible ? '' : 'hidden'
                                              }`}
                                            >
                                              {shouldStartTyping &&
                                              idx === activeSection &&
                                              ssidx === activeSubSection &&
                                              spidx === activeSubSectionPoint ? (
                                                <Typewriter
                                                  onInit={(typewriter) => {
                                                    typewriter
                                                      .typeString(processStrongTags(subPoint || ''))
                                                      .callFunction(() => {
                                                        // 하위 포인트 타이핑 완료 시 다음 하위 포인트 또는 다음 하위 섹션 활성화
                                                        handleSubSectionPointTyped(
                                                          idx,
                                                          ssidx,
                                                          spidx,
                                                          subPoints
                                                        );
                                                      })
                                                      .start();
                                                  }}
                                                  options={{
                                                    cursor: '',
                                                    delay: 20,
                                                    wrapperClassName:
                                                      'text-sm text-gray-100 leading-relaxed',
                                                  }}
                                                />
                                              ) : (
                                                <span
                                                  className={
                                                    isSubPointVisible ? 'opacity-100' : 'opacity-0'
                                                  }
                                                >
                                                  {renderHTML(subPoint || '')}
                                                </span>
                                              )}
                                            </p>
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
              }

              // 기존 문자열 형식으로 표시 - 폴백 처리 + 클릭 효과 추가
              return (
                <div
                  className="p-4 my-4 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-md cursor-pointer"
                  onClick={completeCurrentTabTyping} // 클릭 시 타이핑 완료 (NEW)
                >
                  <div className="relative px-2">
                    <p className="text-lg font-medium text-gray-100 leading-tight py-4">
                      {shouldStartTyping ? (
                        <Typewriter
                          onInit={(typewriter) => {
                            typewriter
                              .typeString(
                                typeof content === 'string'
                                  ? processStrongTags(content)
                                  : JSON.stringify(content)
                              )
                              .callFunction(handleTab1FinalTypingComplete)
                              .start();
                          }}
                          options={{
                            cursor: '',
                            delay: 30,
                            wrapperClassName: 'text-lg font-medium text-gray-100',
                          }}
                        />
                      ) : (
                        <span className={shouldStartTyping ? 'opacity-100' : 'opacity-0'}>
                          {typeof content === 'string'
                            ? renderHTML(content)
                            : JSON.stringify(content)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      case 2: // 주요 내용 (이전의 1번 탭) - 이미 완료된 경우 바로 표시
        if (tab2Completed) {
          // 이미 타이핑이 완료된 경우 - 모든 내용 즉시 표시
          return (
            <div className="pt-4" ref={tabRefs.main}>
              {/* 미니멀한 명함 스타일의 디자인 - 공유 아이콘 추가 */}
              <div className="border-l-2 border-gray-400 pl-2 py-1 mb-3 flex items-center justify-between gap-1">
                <h2 className="flex-1 tracking-tighter  text-sm text-gray-800">주요 내용</h2>
                <div onClick={completeAllTypingEffects} style={{ cursor: 'pointer' }}>
                  <ShareButton
                    memo={memo}
                    tabType="main"
                    contentRef={tabRefs.main}
                    onShareSuccess={handleShareSuccess}
                    onShareError={handleShareError}
                  />
                </div>
              </div>

              {/* 즉시 모든 트윗 표시 */}
              <div className="space-y-2">
                {memo.thread.map((tweet, tweetIndex) => (
                  <div
                    key={tweetIndex}
                    className="p-4 py-6 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-sm"
                  >
                    <p className="text-gray-100 tracking-tighter">{renderHTML(tweet)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // 아직 타이핑 완료되지 않은 경우 - 순차적 타이핑 효과 적용
        return (
          <div className="pt-4" ref={tabRefs.main}>
            {/* 미니멀한 명함 스타일의 디자인 - 공유 아이콘 추가 */}
            <div className="border-l-2 border-gray-400 pl-2 py-1 mb-3 flex items-center justify-between gap-1">
              <h2 className="flex-1 tracking-tighter  text-sm text-gray-800">주요 내용</h2>
              <div onClick={completeAllTypingEffects} style={{ cursor: 'pointer' }}>
                <ShareButton
                  memo={memo}
                  tabType="main"
                  contentRef={tabRefs.main}
                  onShareSuccess={handleShareSuccess}
                  onShareError={handleShareError}
                />
              </div>
            </div>

            {/* 주요 내용 - 순차적 타이핑 효과 적용 - 완료된 트윗 추적 */}
            <div className="space-y-2">
              {memo.thread.map((tweet, tweetIndex) => {
                // 트윗 표시 여부 확인 - 이미 완료된 트윗도 표시하도록 수정
                const isTweetVisible =
                  completedTweets.includes(tweetIndex) || tweetIndex <= activeTweet;

                return (
                  <div
                    key={tweetIndex}
                    className={`p-4 py-6 rounded-lg border bg-gradient-to-r from-emerald-800 to-emerald-600 border-gray-100 shadow-sm cursor-pointer ${
                      isTweetVisible ? '' : 'hidden'
                    }`}
                    onClick={completeCurrentTabTyping} // 클릭 시 타이핑 완료 (NEW)
                  >
                    <p className="text-gray-100 tracking-tighter">
                      {shouldStartTyping &&
                      tweetIndex === activeTweet &&
                      !completedTweets.includes(tweetIndex) ? (
                        <Typewriter
                          onInit={(typewriter) => {
                            typewriter
                              .typeString(processStrongTags(tweet))
                              .callFunction(() => {
                                // 트윗 타이핑 완료 시 다음 트윗 활성화
                                handleTweetTyped(tweetIndex);
                              })
                              .start();
                          }}
                          options={{
                            cursor: '',
                            delay: 30,
                            wrapperClassName: 'text-gray-100 tracking-tighter',
                          }}
                        />
                      ) : (
                        <span className={isTweetVisible ? 'opacity-100' : 'opacity-0'}>
                          {renderHTML(tweet)}
                        </span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="pt-4" ref={tabRefs.original}>
            {/* 미니멀한 명함 스타일의 디자인 - 공유 아이콘 추가 */}
            <div className="border-l-2 border-gray-400 pl-2 py-1 mb-3 flex items-center justify-between gap-1">
              <h2 className="flex-1 tracking-tighter  text-sm text-gray-800">원문</h2>
              <div onClick={completeAllTypingEffects} style={{ cursor: 'pointer' }}>
                <ShareButton
                  memo={memo}
                  tabType="original"
                  contentRef={tabRefs.original}
                  onShareSuccess={handleShareSuccess}
                  onShareError={handleShareError}
                />
              </div>
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
      <div className="mt-2 border-y border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeTab(0)}
            className={`relative p-2 text-sm transition-colors ${
              activeTab === 0
                ? 'font-bold text-emerald-800 border-b-2 border-emerald-800'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {activeTab === 0 && (
              <Sparkle size={14} className="absolute top-0.5 -right-1 text-emerald-800" />
            )}
            아이디어
          </button>

          <button
            onClick={() => changeTab(1)}
            className={`relative p-2 text-sm transition-colors ${
              activeTab === 1
                ? 'font-bold text-emerald-800 border-b-2 border-emerald-800'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {activeTab === 1 && (
              <Sparkle size={14} className="absolute top-0.5 -right-1 text-emerald-800" />
            )}
            아이디어 맵
          </button>

          <button
            onClick={() => changeTab(2)}
            className={`relative p-2 text-sm transition-colors ${
              activeTab === 2
                ? 'font-bold text-emerald-800 border-b-2 border-emerald-800'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {activeTab === 2 && (
              <Sparkle size={14} className="absolute top-0.5 -right-1 text-emerald-800" />
            )}
            주요 내용
          </button>

          <button
            onClick={() => changeTab(3)}
            className={`relative p-2 text-sm transition-colors ${
              activeTab === 3
                ? 'font-bold text-emerald-800 border-b-2 border-emerald-800'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {activeTab === 3 && (
              <Sparkle size={14} className="absolute top-0.5 -right-1 text-emerald-800" />
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
