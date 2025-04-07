//app/ui/MemoContent.tsx

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Memo, MemoContentProps } from '../utils/types';
import {
  Sparkle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Quote,
  Share,
  ChevronRight,
  Edit,
  Trash,
} from 'lucide-react';
import Link from 'next/link';
import ShareButton from './ShareButton';
import TTSButton from '../tts/TTSButton';
import ThoughtButton from './ThoughtButton';
import ThoughtDialog from './ThoughtDialog';

// 탭 인덱스 타입 정의 - 내 생각 탭 추가
type TabIndex = 0 | 1 | 2 | 3 | 4; // 0: 아이디어, 1: 아이디어 맵, 2: 주요 내용, 3: 원문, 4: 내 생각

interface IdeaPoint {
  [key: string]: any;
}

interface SubSection {
  sub_heading?: string;
  sub_points?: string[];
  [key: string]: any;
}

interface Section {
  heading?: string;
  points?: string[];
  sub_sections?: SubSection[];
  [key: string]: any;
}

interface IdeaMap {
  sections?: Section[];
  [key: string]: any;
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
  hideImageInBlog = false,
  onSaveThought, // 새로 추가된 prop
  onDeleteThought, // 새로 추가된 prop
  hideThoughtButton = false,
}) => {
  // 탭 관리를 위한 상태
  const [activeTab, setActiveTab] = useState<TabIndex>(0);
  const [direction, setDirection] = useState(0); // 슬라이드 방향 (-1: 왼쪽, 1: 오른쪽)
  const [showOriginalText, setShowOriginalText] = useState(false);

  // 탭 변경 여부를 추적하는 상태 추가F<Me
  const [isTabChanging, setIsTabChanging] = useState(false);
  // 내생각
  const [localThought, setLocalThought] = useState<string | undefined>(memo.i_think);
  const [isThoughtDialogOpen, setIsThoughtDialogOpen] = useState(false);

  // 현재 진행 중인 스크롤 작업이 있는지 추적
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 전체에 대한 ref 추가
  const componentRef = useRef<HTMLDivElement>(null);

  // 각 탭에 대한 ref 추가 - thought 추가
  const tabRefs = {
    idea: useRef<HTMLDivElement>(null),
    main: useRef<HTMLDivElement>(null),
    key: useRef<HTMLDivElement>(null),
    original: useRef<HTMLDivElement>(null),
    thought: useRef<HTMLDivElement>(null), // 내 생각 탭 ref 추가
  };

  // 이전 터치 위치 추적 (Y축 스와이프 방지용)
  const touchStartRef = useRef({ x: 0, y: 0 });

  console.log('MemoContent 렌더링:', memo.id, 'i_think:', memo.i_think);

  // 내 생각 편집/삭제 핸들러
  const handleSaveThoughtFromDialog = async (thought: string) => {
    if (onSaveThought && memo.id) {
      try {
        await onSaveThought(memo.id, thought);
        // 로컬 상태 즉시 업데이트
        setLocalThought(thought);
        // memo 객체 직접 수정 (약간 안전하지 않은 방식이지만 즉시 반영을 위해)
        memo.i_think = thought;

        return Promise.resolve();
      } catch (error) {
        console.error('저장 실패:', error);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  // handleDeleteThought 함수 업데이트
  const handleDeleteThought = async () => {
    if (onDeleteThought && memo.id) {
      try {
        await onDeleteThought(memo.id);

        // 로컬 상태 명시적으로 업데이트 (중요!)
        setLocalThought(undefined);

        // memo 객체 직접 수정 (즉시 반영을 위해)
        memo.i_think = undefined;

        // 탭 전환 (선택 사항)
        if (activeTab === 4) {
          // 내 생각 탭이 활성화된 상태라면 다른 탭으로 변경
          setActiveTab(0);
        }

        // 강제 리렌더링 (선택 사항)
        setIsTabChanging(true);
        setTimeout(() => setIsTabChanging(false), 50);

        console.log('내 생각이 삭제되었습니다.');
        return Promise.resolve();
      } catch (error) {
        console.error('삭제 실패:', error);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  };

  // MemoContent.tsx에서 scrollToComponentTop 함수 수정
  const scrollToComponentTop = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 탭 변경 중일 때만 실행
    if (isTabChanging && componentRef.current) {
      // 가장 가까운 스크롤 가능한 부모 요소를 찾아 스크롤
      const scrollableParent = componentRef.current.closest('.overflow-y-auto');

      if (scrollableParent) {
        // 항상 스크롤을 맨 위로 설정
        scrollableParent.scrollTop = 0;
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsTabChanging(false);
        scrollTimeoutRef.current = null;
      }, 500);
    }
  };

  // 현재 탭에 따른 타입 가져오기 - thought 타입 추가
  const getCurrentTabType = (): 'idea' | 'main' | 'key' | 'original' | 'thought' => {
    switch (activeTab) {
      case 0:
        return 'idea';
      case 1:
        return 'key';
      case 2:
        return 'main';
      case 3:
        return 'thought'; // 내 생각으로 변경
      case 4:
        return 'original'; // 원문으로 변경
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

  // 텍스트 내의 문장 끝에만 줄바꿈 추가 (영문 약어 제외)
  const addLineBreaksToSentences = (text: string): string => {
    if (!text) return '';

    // 일반적인 영문 약어 목록
    const commonAbbreviations = [
      'Mr',
      'Mrs',
      'Ms',
      'Dr',
      'Prof',
      'St',
      'Ave',
      'Blvd',
      'Rd',
      'Ph.D',
      'etc',
      'i.e',
      'e.g',
      'vs',
      'Fig',
      'Inc',
      'Corp',
      'Ltd',
      'Jr',
      'Sr',
    ];

    // 약어 패턴 만들기 (각 약어 뒤에 .이 올 경우)
    const abbreviationPattern = new RegExp(`\\b(${commonAbbreviations.join('|')})\\.`, 'g');

    // 1단계: 약어를 임시 토큰으로 대체 (예: Mr. → Mr_ABV_)
    let processedText = text.replace(abbreviationPattern, (match) => {
      return match.replace('.', '_ABV_');
    });

    // 2단계: 소수점이 아닌 문장 끝 마침표를 찾아 줄바꿈 추가
    // (?<!\d) - 숫자 뒤가 아님을 확인 (소수점 제외)
    // \. - 마침표
    // (?=\s|$) - 뒤에 공백이나 문장 끝이 옴을 확인
    processedText = processedText.replace(/(?<!\d)\.(?=\s|$)/g, '.<br>');

    // 3단계: 약어 토큰을 다시 마침표로 복원
    processedText = processedText.replace(/_ABV_/g, '.');

    return processedText;
  };

  // HTML 태그를 처리하는 함수 - 최적화된 버전
  const processContentTags = (text: string): string => {
    if (!text) return '';
    if (typeof text !== 'string') return String(text || '');

    let processedText = text;

    // 태그가 있는 경우만 태그 처리 (성능 최적화)
    const hasKeyTags = /<key>(.*?)<\/key>/g.test(text);
    const hasTermTags = /<term>(.*?)<\/term>/g.test(text);
    const hasExTags = /<ex>(.*?)<\/ex>/g.test(text);
    const hasDataTags = /<data>(.*?)<\/data>/g.test(text);

    if (hasKeyTags || hasTermTags || hasExTags || hasDataTags) {
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
          '<span class="italic123 font-bold">$1</span>'
        );
      }

      // 데이터/수치 (data 태그) - 숫자 표시 기호 사용
      if (hasDataTags) {
        processedText = processedText.replace(
          /<data>(.*?)<\/data>/g,
          '<span class="text-red-900">$1</span>'
        );
      }
    }

    // 항상 줄바꿈 처리를 수행 (태그 유무와 관계없이)
    return addLineBreaksToSentences(processedText);
  };

  // renderHTML 함수
  const renderHTML = (htmlString: string = '') => {
    return <span dangerouslySetInnerHTML={{ __html: processContentTags(htmlString) }} />;
  };

  // 탭 변경 함수 - 수정된 버전
  const changeTab = (newTab: TabIndex) => {
    // 동일한 탭을 클릭한 경우 무시
    if (newTab === activeTab) return;

    // 탭 변경 상태 설정
    setIsTabChanging(true);

    // 방향 결정
    const currentIndex = activeTab;
    const targetIndex = newTab;

    // 방향 로직 수정 - 모든 탭 전환을 고려
    if (targetIndex > currentIndex) {
      setDirection(1); // 오른쪽으로 이동
    } else {
      setDirection(-1); // 왼쪽으로 이동
    }

    setActiveTab(newTab);
  };

  // 스와이프로 다음 탭으로 이동
  const goToNextTab = () => {
    setIsTabChanging(true);

    if (memo.i_think) {
      // 내 생각 탭이 있는 경우 (0,1,2,3,4)
      const nextTab = activeTab >= 4 ? 0 : activeTab + 1;
      setActiveTab(nextTab as TabIndex);
    } else {
      // 내 생각 탭이 없는 경우 - 3 건너뛰기 (0,1,2,4)
      if (activeTab === 2) {
        setActiveTab(4);
      } else if (activeTab === 4) {
        setActiveTab(0);
      } else {
        setActiveTab((activeTab + 1) as TabIndex);
      }
    }

    setDirection(1); // 오른쪽으로 이동
  };

  // 스와이프로 이전 탭으로 이동
  const goToPrevTab = () => {
    setIsTabChanging(true);

    if (memo.i_think) {
      // 내 생각 탭이 있는 경우 (0,1,2,3,4)
      const prevTab = activeTab <= 0 ? 4 : activeTab - 1;
      setActiveTab(prevTab as TabIndex);
    } else {
      // 내 생각 탭이 없는 경우 - 3 건너뛰기 (0,1,2,4)
      if (activeTab === 0) {
        setActiveTab(4);
      } else if (activeTab === 4) {
        setActiveTab(2);
      } else {
        setActiveTab((activeTab - 1) as TabIndex);
      }
    }

    setDirection(-1); // 왼쪽으로 이동
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

  // 아이디어 맵 텍스트 가져오기 함수 - TTS 표시용으로 개선
  const getIdeaMapText = () => {
    const parsedContent = parseIdeaMap(memo.tweet_main) as IdeaMap;
    let text = '';

    if (parsedContent.sections && Array.isArray(parsedContent.sections)) {
      parsedContent.sections.forEach((section: Section, idx: number) => {
        if (!section || typeof section !== 'object') return;

        // 섹션 제목을 더 눈에 띄게 표시
        text += `[섹션 ${idx + 1}] \n${section.heading || '섹션'}\n\n`;

        const points = Array.isArray(section.points) ? section.points : [];
        points.forEach((point: string, pidx: number) => {
          text += `(${pidx + 1}) ${point}\n`;
        });

        text += '\n';

        const subSections = Array.isArray(section.sub_sections) ? section.sub_sections : [];
        if (subSections.length > 0) {
          subSections.forEach((subSection: SubSection, ssidx: number) => {
            if (!subSection || typeof subSection !== 'object') return;
            text += `※ ${subSection.sub_heading || '하위 섹션'}\n`;

            const subPoints = Array.isArray(subSection.sub_points) ? subSection.sub_points : [];
            subPoints.forEach((subPoint: string) => {
              text += `  - ${subPoint}\n`;
            });

            text += '\n';
          });
        }

        text += '\n\n';
      });
    } else if (typeof memo.tweet_main === 'string') {
      text = memo.tweet_main;
    }

    return text;
  };

  // 아이디어 탭 텍스트 가져오기
  const getIdeaText = () => {
    let text = '';

    // 제목
    text += `[제목]\n${memo.title}\n\n`;

    // 핵심 문장
    text += `[핵심 내용]\n${memo.labeling?.key_sentence || '내용 없음'}\n\n`;

    return text;
  };

  // 주요 내용 탭 텍스트 가져오기
  const getMainContentText = () => {
    let text = '';

    memo.thread.forEach((tweet, idx) => {
      // 원본 숫자 유지하여 더 명확하게 표시
      text += `${tweet}\n\n`;
    });

    return text;
  };

  // 내 생각 탭 텍스트 가져오기 (새로 추가)
  const getThoughtText = () => {
    return memo.i_think || '';
  };

  // 전체 텍스트를 가져오는 함수 - 내 생각 탭 추가
  const getAllContentText = () => {
    // 1. 구분선과 아이디어 탭 내용
    const ideaText = `\n [ 아이디어 ] \n\n\n${getIdeaText()}\n\n`;

    // 2. 구분선과 아이디어 맵 탭 내용
    const ideaMapText = `\n [ 아이디어 맵 ] \n\n\n${getIdeaMapText()}\n\n`;

    // 3. 구분선과 주요 내용 탭 내용
    const mainText = `\n [ 주요 내용 ] \n\n\n${getMainContentText()}`;

    // 4. 내 생각 탭 내용 (있을 경우에만)
    const thoughtText = memo.i_think ? `\n\n [ 내 생각 ] \n\n\n${getThoughtText()}\n\n` : '';

    // 모든 내용 합치기
    return ideaText + ideaMapText + mainText + thoughtText;
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

  // 애니메이션 완료 후 실행할 핸들러
  const handleAnimationComplete = () => {
    // 탭 변경 중일 때만 스크롤 실행
    if (isTabChanging) {
      scrollToComponentTop();
    }
  };

  // 탭 변경 효과 처리
  useEffect(() => {
    // 탭이 변경되었을 때만 스크롤 조정
    if (isTabChanging) {
      scrollToComponentTop();
    }
  }, [activeTab]);

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // memo.i_think가 변경될 때 localThought 동기화
  useEffect(() => {
    console.log('memo.i_think 변경 감지:', memo.i_think);
    setLocalThought(memo.i_think);
  }, [memo.i_think]);

  // 터치 이벤트 핸들러 - Y축 스와이프와 X축 스와이프 구분
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  // 선택된 탭 컨텐츠 렌더링
  const renderTabContent = (tabIndex: TabIndex) => {
    switch (tabIndex) {
      case 0: // 아이디어
        return (
          <div className="pt-4 min-h-96" ref={tabRefs.idea}>
            {/* 헤더 */}
            <div className="border-l-4 border-emerald-800/50 pl-3 py-1 mb-3 flex items-center justify-between gap-2">
              <h2 className="tracking-tight text-base font-semibold text-gray-900">{memo.title}</h2>
              <div className="min-w-10 flex items-center gap-1  ">
                {/* <TTSButton text={getIdeaText()} />
                <p>|</p> */}
                <ShareButton
                  memo={memo}
                  tabType="idea"
                  contentRef={tabRefs.idea}
                  onShareSuccess={handleShareSuccess}
                  onShareError={handleShareError}
                />
              </div>
            </div>

            {/* 핵심 문장 - 애플 스타일 */}
            <div className="p-4 py-8 my-4 rounded-lg border bg-white border-gray-300 shadow-sm">
              <div className="font-medium text-gray-800 leading-relaxed">
                {renderHTML(memo.labeling.key_sentence)}
              </div>
            </div>

            {/* 키워드 - 애플 스타일 태그 */}
            <div className="flex flex-wrap items-center mt-4 gap-2">
              {memo.labeling.keywords.map((keyword, keywordIndex) => (
                <span
                  key={keywordIndex}
                  className="px-4 py-1 text-sm border-2 border-gray-300 text-gray-600 rounded-full"
                >
                  #{keyword}
                </span>
              ))}
            </div>

            {/* 원본이미지와 제목 - hideImageInBlog prop을 확인하여 조건부 렌더링 */}
            {memo.original_image && !hideImageInBlog && (
              <div className="flex flex-col gap-2 mt-2">
                {/* <hr className="w-full" /> */}

                <div className="grid grid-cols-8 items-center gap-2 w-full bg-white mt-1">
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
          <div className="pt-4 min-h-96 leading-relaxed" ref={tabRefs.key}>
            {/* 헤더 */}
            <div className="border-l-4 border-emerald-800/50 pl-3 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tight text-base font-semibold text-gray-900">아이디어 맵</h2>
              <div className="flex items-center gap-1 text-gray-400 ">
                {/* <TTSButton text={getIdeaMapText()} />
                <p>|</p> */}
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
                  <div className="space-y-16 pt-4 pb-8  ">
                    {parsedContent.sections.map((section: any, idx: number) => {
                      if (!section || typeof section !== 'object') return null;

                      const heading = section.heading || '섹션';
                      const points = Array.isArray(section.points) ? section.points : [];
                      const subSections = Array.isArray(section.sub_sections)
                        ? section.sub_sections
                        : [];

                      return (
                        <div key={idx} className="">
                          {/* 섹션 헤더 */}
                          <div className="mb-6">
                            <div className="text-xs font-medium text-gray-400 flex items-center gap-2 mb-2">
                              <p>Section {idx + 1}</p>
                              <hr className="flex-1 border-t border-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {idx + 1}. {renderHTML(heading)}
                            </h3>
                          </div>

                          {/* 섹션 포인트 */}
                          <div className="space-y-4 ml-4 border-l-[3px] border-gray-600/50">
                            {points.map((point: any, pidx: number) => {
                              // 포인트 파싱 (불릿 제거)
                              const cleanPoint = point.replace(/^•\s?/, '');
                              let title = cleanPoint;
                              let content = '';

                              // 일반 콜론 형식 검사
                              const colonIndex = cleanPoint.indexOf(': ');

                              // 괄호+단어+콜론 패턴 검사 (예: (예시: , (사례: , (참고: 등)
                              const parenthesisPattern = /\([^)]*?:\s/;
                              const parenthesisMatch = cleanPoint.match(parenthesisPattern);
                              const parenthesisIndex = parenthesisMatch
                                ? cleanPoint.indexOf(parenthesisMatch[0])
                                : -1;

                              if (
                                colonIndex !== -1 &&
                                (parenthesisIndex === -1 || colonIndex < parenthesisIndex)
                              ) {
                                // 일반 콜론 형식
                                title = cleanPoint.substring(0, colonIndex);
                                content = cleanPoint.substring(colonIndex + 2);
                              } else if (parenthesisIndex !== -1) {
                                // 괄호+단어+콜론 형식
                                // 괄호 시작 위치까지를 제목으로, 괄호 안의 콜론 이후를 내용으로
                                title = cleanPoint.substring(0, parenthesisIndex).trim();

                                // 괄호 시작부터 끝까지 찾기
                                const bracketContent = cleanPoint.substring(parenthesisIndex);
                                const closingBracketIndex = bracketContent.indexOf(')');

                                if (closingBracketIndex !== -1) {
                                  // 닫는 괄호가 있는 경우
                                  const colonInBracketIndex = bracketContent.indexOf(':');
                                  if (
                                    colonInBracketIndex !== -1 &&
                                    colonInBracketIndex < closingBracketIndex
                                  ) {
                                    // 괄호 안에 콜론이 있는 경우, 콜론 이후부터 내용으로
                                    content = cleanPoint.substring(parenthesisIndex);
                                  } else {
                                    // 괄호 안에 콜론이 없는 경우, 괄호 전체를 포함하여 내용으로
                                    content = cleanPoint.substring(parenthesisIndex);
                                  }
                                } else {
                                  // 닫는 괄호가 없는 경우, 괄호 이후를 모두 내용으로
                                  content = cleanPoint.substring(parenthesisIndex);
                                }
                              }

                              return (
                                <div key={pidx} className="px-4 rounded-lg ">
                                  <div className="text-gray-900  flex items-start gap-1">
                                    <div>({pidx + 1})</div> {renderHTML(title)}
                                  </div>
                                  {content && (
                                    <>
                                      <hr className="mb-1 border-gray-400" />
                                      <div className="text-gray-600 italic123 mt-1 ml-1 flex gap-1">
                                        <div className="font-bold">: </div>
                                        {renderHTML(content)}
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* 하위 섹션 */}
                          {subSections.length > 0 && (
                            <div className="mt-6 ml-8 pl-2 border-l-2 border-gray-600/50">
                              {subSections.map((subSection: any, ssidx: number) => {
                                if (!subSection || typeof subSection !== 'object') return null;

                                const subHeading = subSection.sub_heading || '하위 섹션';
                                const subPoints = Array.isArray(subSection.sub_points)
                                  ? subSection.sub_points
                                  : [];

                                return (
                                  <div key={ssidx} className="mb-3">
                                    {/* 하위 섹션 제목 */}
                                    <h4 className="text-lg  text-gray-900 mb-2">
                                      <span className="test-base text-gray-600">※ </span>
                                      {renderHTML(subHeading)}
                                    </h4>

                                    {/* 하위 섹션 포인트 */}
                                    {subPoints.length > 0 && (
                                      <div className=" space-y-2">
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
                                            <div key={spidx} className="px-3  rounded-lg ">
                                              <div className="font-medium text-gray-600">
                                                <span className="text-sm text-gray-800">- </span>
                                                {title}
                                              </div>
                                              {content && (
                                                <div className="text-gray-600 italic123 text-sm">
                                                  <span className="text-xs ">: </span> {content}
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
                  <div className="p-4 my-4 rounded-lg bg-white border border-gray-200 shadow-sm">
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
          <div className="pt-4 pb-8  min-h-96 leading-relaxed " ref={tabRefs.main}>
            {/* 헤더 */}
            <div className="border-l-4 border-emerald-800/50 pl-3 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tight text-base font-semibold text-gray-900">주요 내용</h2>
              <div className="flex items-center gap-1 text-gray-400 ">
                {/* <TTSButton text={getMainContentText()} />
                <p>|</p> */}
                <ShareButton
                  memo={memo}
                  tabType="main"
                  contentRef={tabRefs.main}
                  onShareSuccess={handleShareSuccess}
                  onShareError={handleShareError}
                />
              </div>
            </div>

            {/* 모든 항목 표시 */}
            <div className="space-y-4">
              {memo.thread.map((tweet, tweetIndex) => {
                // 번호 제거 (예: "1. ")
                const content = tweet.replace(/^\d+\.\s/, '');

                return (
                  <div key={tweetIndex} className="flex  py-1 ">
                    <div className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center mt-1 mr-3 text-xs font-medium text-gray-600">
                      {tweetIndex + 1}
                    </div>
                    <div className="flex-1 text-gray-800">{renderHTML(content)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3: // 내 생각
        return (
          <div className="pt-4 min-h-96 pb-8 flex flex-col" ref={tabRefs.thought}>
            {/* 헤더 */}
            <div className="border-l-4 border-emerald-800/50 pl-3 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tight text-base font-semibold text-gray-900">내 생각</h2>
              <div className="flex items-center gap-1 text-gray-400">
                <ShareButton
                  memo={memo}
                  tabType="thought"
                  contentRef={tabRefs.thought}
                  onShareSuccess={handleShareSuccess}
                  onShareError={handleShareError}
                />
              </div>
            </div>

            {/* 내 생각 콘텐츠 */}
            <div className="flex-1 p-4 my-4 rounded-lg bg-white border border-gray-200 shadow-sm">
              <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                {renderHTML(memo.i_think || '')}
              </p>
            </div>

            {/* 수정/삭제 버튼 추가 */}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setIsThoughtDialogOpen(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md flex items-center gap-2"
              >
                <Edit size={16} /> 수정하기
              </button>

              <button
                onClick={() => {
                  if (window.confirm('정말로 삭제하시겠습니까?')) {
                    handleDeleteThought();
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center gap-2"
              >
                <Trash size={16} /> 삭제하기
              </button>
            </div>
          </div>
        );

      case 4: // 원문 (원래 case 3의 내용)
        return (
          <div className="pt-4 min-h-96 flex flex-col" ref={tabRefs.original}>
            {/* 헤더 */}
            <div className="border-l-4 border-emerald-800/50 pl-3 py-1 mb-3 flex items-center justify-between">
              <h2 className="tracking-tight text-base font-semibold text-gray-900">원문</h2>
              <ShareButton
                memo={memo}
                tabType="original"
                contentRef={tabRefs.original}
                onShareSuccess={handleShareSuccess}
                onShareError={handleShareError}
              />
            </div>
            {/* 원본 콘텐츠 */}
            <div className="flex-1 flex flex-col ">
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
                        <p className=" text-gray-600 break-all">{memo.original_url}</p>
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

                      {/* 원문 내용보기 버튼 추가 */}
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
                    <div className="w-full aspect-video  flex  gap-4 p-4 border-4 border-gray-200 relative">
                      <img
                        src={memo.original_image}
                        alt="Original Image"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg "
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          console.log('이미지 로드 실패:', e);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-video  flex flex-col items-center justify-center gap-4 p-4 border-4 border-gray-200">
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
        );

      default:
        return null;
    }
  };

  return (
    <div ref={componentRef} onTouchStart={handleTouchStart} className="">
      {/* 전체듣기 */}
      <div className="w-full flex justify-end items-center gap-2 py-2">
        {/* hideThoughtButton이 false일 때만 ThoughtButton 렌더링 */}
        {!hideThoughtButton && (
          <>
            <ThoughtButton
              memoId={memo.id || ''}
              initialThought={memo.i_think}
              onSaveThought={(memoId, thought) => {
                console.log('ThoughtButton에서 MemoContent로:', memoId, thought);
                return handleSaveThoughtFromDialog(thought);
              }}
              onDeleteThought={handleDeleteThought}
            />
            <p className="text-gray-400">||</p>
          </>
        )}

        <TTSButton
          text={getAllContentText()}
          showLabel={true}
          originalImage={memo.original_image}
        />
      </div>
      {/* 탭 네비게이션 - 수정된 버전 */}
      <div className="mt-2 border-y border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeTab(0)}
            className={`relative p-2 sm:px-3 py-2 text-sm transition-colors ${
              activeTab === 0
                ? 'font-bold text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            아이디어
          </button>

          <button
            onClick={() => changeTab(1)}
            className={`relative p-2 sm:px-3 py-2 text-sm transition-colors ${
              activeTab === 1
                ? 'font-bold text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            아이디어 맵
          </button>

          <button
            onClick={() => changeTab(2)}
            className={`relative p-2 sm:px-3 py-2 text-sm transition-colors ${
              activeTab === 2
                ? 'font-bold text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            주요 내용
          </button>

          {/* 내 생각 탭 - 가용성 확인 */}
          {(memo.i_think !== null && memo.i_think !== undefined) ||
          (localThought !== null && localThought !== undefined) ? (
            <button
              onClick={() => changeTab(3)} /* 수정됨: 4에서 3으로 */
              className={`relative p-2 sm:px-3 py-2 text-sm transition-colors ${
                activeTab === 3 /* 수정됨: 4에서 3으로 */
                  ? 'font-bold text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              내 생각
            </button>
          ) : null}

          <button
            onClick={() => changeTab(4)}
            className={`relative p-2 sm:px-3 py-2 text-sm transition-colors ${
              activeTab === 4
                ? 'font-bold text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            원문
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.3,
              // 높이 변화도 애니메이션 추가
              height: { duration: 0.3, ease: 'easeInOut' },
            }}
            className="w-full min-h-[400px]" // 최소 높이 추가
            style={{ minHeight: '400px' }} // 일관성을 위해 style로도 설정
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
            onAnimationComplete={handleAnimationComplete}
          >
            {renderTabContent(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* ThoughtDialog 직접 추가 */}
      <ThoughtDialog
        isOpen={isThoughtDialogOpen}
        onClose={() => setIsThoughtDialogOpen(false)}
        initialThought={memo.i_think}
        onSave={handleSaveThoughtFromDialog}
        onDelete={handleDeleteThought}
      />
    </div>
  );
};

export default MemoContent;
