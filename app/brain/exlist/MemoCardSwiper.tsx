'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowRight, BookCheck, Bookmark, DownloadCloud, Quote } from 'lucide-react';

// 타입 정의
interface Category {
  main: string;
  sub: string;
}

interface ParentCardType {
  title: string;
  content: string;
  keywords: string[];
  type: 'parent';
  category?: Category;
  key_sentence: string;
}

interface ChildCardType {
  title: string;
  content: string;
  key_sentence: string;
  keywords: string[];
  type: 'child';
}

interface CardDataType {
  parent_card: ParentCardType;
  child_cards: ChildCardType[];
}

// 뷰 모드 상수
const VIEW_MODES = {
  PARENT: 'parent',
  CHILDREN_LIST: 'children_list',
  CHILD_DETAIL: 'child_detail',
} as const;

type ViewModeType = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];

// 샘플 데이터
const sampleData: CardDataType = {
  parent_card: {
    title: '브랜드 커뮤니케이션 및 초기 브랜딩 전략',
    content:
      '브랜드 커뮤니케이션은 가치와 지향점을 지속적으로 내외부와 소통하며 유지하는 것이며, 초기 브랜딩에서 차별성을 강조해야 한다. 매출 증가를 위한 원리와 고객 경험을 중시하는 전략이 필요하다.',
    keywords: ['브랜드 커뮤니케이션', '차별성', '고객 경험'],
    type: 'parent',
    category: {
      main: '마케팅',
      sub: '브랜드 관리',
    },
    key_sentence: '브랜드 커뮤니케이션은 차별성과 고객 경험을 중심으로 이루어져야 한다.',
  },
  child_cards: [
    {
      title: '브랜드 커뮤니케이션의 중요성',
      content:
        '브랜드는 가치와 지향점을 지속적으로 소통하며 지켜가야 하며, 이는 도덕적이지 않더라도 가능하다. 브랜드의 핵심 메시지를 행동으로 보여주는 것이 중요하다.',
      key_sentence: '브랜드의 핵심 메시지를 행동으로 보여주는 것이 중요하다.',
      keywords: ['브랜드 가치', '소통', '행동'],
      type: 'child',
    },
    {
      title: '매출 증가를 위한 3원리',
      content:
        '매출을 증가시키기 위해서는 고객 수를 늘리고, 고객이 자주 이용하게 하며, 고객이 이용할 때 객단가를 올리는 것이 중요하다.',
      key_sentence: '매출 증가를 위해 고객 수, 이용 빈도, 객단가를 고려해야 한다.',
      keywords: ['매출', '고객 수', '객단가'],
      type: 'child',
    },
    {
      title: '초기 브랜딩에서의 차별성',
      content:
        '초기 브랜딩은 확실한 차별성을 갖추는 것이 중요하며, 고객이 인식하고 효용을 느낄 수 있어야 한다. 디자인이 가장 쉽게 차별적으로 보일 수 있는 방법 중 하나이다.',
      key_sentence: '초기 브랜딩에서는 고객이 인식할 수 있는 확실한 차별성이 중요하다.',
      keywords: ['초기 브랜딩', '차별성', '디자인'],
      type: 'child',
    },
    {
      title: '초기 브랜딩에서의 차별성',
      content:
        '초기 브랜딩은 확실한 차별성을 갖추는 것이 중요하며, 고객이 인식하고 효용을 느낄 수 있어야 한다. 디자인이 가장 쉽게 차별적으로 보일 수 있는 방법 중 하나이다.',
      key_sentence: '초기 브랜딩에서는 고객이 인식할 수 있는 확실한 차별성이 중요하다.',
      keywords: ['초기 브랜딩', '차별성', '디자인'],
      type: 'child',
    },
    {
      title: '초기 브랜딩에서의 차별성',
      content:
        '초기 브랜딩은 확실한 차별성을 갖추는 것이 중요하며, 고객이 인식하고 효용을 느낄 수 있어야 한다. 디자인이 가장 쉽게 차별적으로 보일 수 있는 방법 중 하나이다.',
      key_sentence: '초기 브랜딩에서는 고객이 인식할 수 있는 확실한 차별성이 중요하다.',
      keywords: ['초기 브랜딩', '차별성', '디자인'],
      type: 'child',
    },
    {
      title: '초기 브랜딩에서의 차별성',
      content:
        '초기 브랜딩은 확실한 차별성을 갖추는 것이 중요하며, 고객이 인식하고 효용을 느낄 수 있어야 한다. 디자인이 가장 쉽게 차별적으로 보일 수 있는 방법 중 하나이다.',
      key_sentence: '초기 브랜딩에서는 고객이 인식할 수 있는 확실한 차별성이 중요하다.',
      keywords: ['초기 브랜딩', '차별성', '디자인'],
      type: 'child',
    },
  ],
};

interface CardSwiperProps {
  data?: CardDataType;
}

interface CardWrapperProps {
  children: React.ReactNode;
}

interface ParentCardProps {
  card: ParentCardType;
}

interface ChildrenListCardProps {
  childCards: ChildCardType[];
  onSelectChild: (index: number) => void;
}

interface ChildDetailCardProps {
  card: ChildCardType;
  parentCategory?: Category; // 부모 카드의 카테고리 정보를 추가
}

interface IndicatorProps {
  active: boolean;
}

// MemoCardSwiper 컴포넌트에서 drag 설정 부분 수정
// MemoCardSwiper 컴포넌트에서 수정된 부분
const MemoCardSwiper: React.FC<CardSwiperProps> = ({ data = sampleData }) => {
  // 상태 관리
  const [viewMode, setViewMode] = useState<ViewModeType>(VIEW_MODES.PARENT);
  const [currentChildIndex, setCurrentChildIndex] = useState<number>(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  // 서브 카드가 있는지 확인 - 안전하게 확인
  const hasChildCards = data?.child_cards && data.child_cards.length > 0;

  // 데이터가 없을 경우 기본 데이터 사용
  const cardData = data || sampleData;

  // 드래그 종료 시 처리
  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: PanInfo
  ) => {
    const swipeThreshold = 50; // 스와이프 임계값
    const swipe = offset.x < -swipeThreshold ? 'left' : offset.x > swipeThreshold ? 'right' : null;

    if (swipe === 'left') {
      setDirection('left');
      // 왼쪽으로 스와이프 (다음 화면으로)
      if (viewMode === VIEW_MODES.PARENT && hasChildCards) {
        setViewMode(VIEW_MODES.CHILDREN_LIST);
      } else if (viewMode === VIEW_MODES.CHILDREN_LIST && hasChildCards) {
        setViewMode(VIEW_MODES.CHILD_DETAIL);
        setCurrentChildIndex(0);
      } else if (
        viewMode === VIEW_MODES.CHILD_DETAIL &&
        currentChildIndex < cardData.child_cards.length - 1
      ) {
        setCurrentChildIndex(currentChildIndex + 1);
      } else if (
        viewMode === VIEW_MODES.CHILD_DETAIL &&
        currentChildIndex === cardData.child_cards.length - 1
      ) {
        // 마지막 서브 카드에서 다시 부모로
        setViewMode(VIEW_MODES.PARENT);
      }
    } else if (swipe === 'right') {
      setDirection('right');
      // 오른쪽으로 스와이프 (이전 화면으로)
      if (viewMode === VIEW_MODES.CHILD_DETAIL && currentChildIndex > 0) {
        setCurrentChildIndex(currentChildIndex - 1);
      } else if (viewMode === VIEW_MODES.CHILD_DETAIL && currentChildIndex === 0) {
        setViewMode(VIEW_MODES.CHILDREN_LIST);
      } else if (viewMode === VIEW_MODES.CHILDREN_LIST) {
        setViewMode(VIEW_MODES.PARENT);
      }
    }
  };

  // 애니메이션 variants
  const variants = {
    enter: (direction: 'left' | 'right' | null) => {
      return {
        x: direction === 'right' ? -300 : 300,
        opacity: 0,
      };
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: 'left' | 'right' | null) => {
      return {
        x: direction === 'right' ? 300 : -300,
        opacity: 0,
      };
    },
  };

  // 하위 컴포넌트 클릭 처리
  const handleChildSelect = (index: number, e: React.MouseEvent) => {
    // 클릭 이벤트가 상위로 전파되지 않도록 중지
    if (e) {
      e.stopPropagation();
    }
    setCurrentChildIndex(index);
    setViewMode(VIEW_MODES.CHILD_DETAIL);
    setDirection('left');
  };

  // ChildrenListCard를 위한 수정된 컴포넌트
  const ModifiedChildrenListCard = () => {
    return (
      <CardWrapper>
        {/* 전체 카드 영역에 pointer-events-none 클래스 추가하지 않음 */}
        <div className="relative aspect-square bg-blue-50/75 p-2 flex flex-col">
          {/* 상단 */}
          <div className="flex items-center justify-between py-2">
            <p className="whitespace-pre-line font-semibold">서브 카드 목록</p>
            <p className="text-xs text-gray-600">2025.02.25-22:23:39</p>
          </div>
          {/* 중앙 */}
          <div className="flex-1 flex flex-col gap-2 overflow-auto pt-2 pb-1 justify-between">
            {cardData.child_cards.length > 0 ? (
              cardData.child_cards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white p-[6px] rounded-lg shadow cursor-pointer flex items-center justify-between"
                  onClick={(e) => handleChildSelect(index, e)}
                >
                  <p className="pointer-events-none">{`${index + 1}. ${
                    card.title || '제목 없음'
                  }`}</p>
                  <ArrowRight className="w-4 h-4 text-gray-600 pointer-events-none" />
                </div>
              ))
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg text-center">서브 카드가 없습니다</div>
            )}
          </div>
        </div>
        <div className="relative aspect-[6/1] bg-green-5 grid grid-cols-12 border-gray-200 border rounded-b-2xl">
          <div className="col-span-2 bg-violet-20 flex items-center justify-center">
            <DownloadCloud className="w-8 h-8 text-gray-600" />
          </div>
          <div className="col-span-7 bg-violet-30 flex items-center p-2">
            <p className="text-sm">총 {cardData.child_cards.length}개의 서브 카드</p>
          </div>
          <div className="col-span-3 bg-violet-40 flex items-center justify-center">
            <p className="p-2 px-4 bg-black text-sm text-white rounded-full">더보기</p>
          </div>
        </div>
      </CardWrapper>
    );
  };

  // 렌더링할 현재 카드 결정
  const renderCurrentCard = () => {
    switch (viewMode) {
      case VIEW_MODES.PARENT:
        return <ParentCard card={cardData.parent_card} />;
      case VIEW_MODES.CHILDREN_LIST:
        return <ModifiedChildrenListCard />;
      case VIEW_MODES.CHILD_DETAIL:
        return hasChildCards ? (
          <ChildDetailCard
            card={cardData.child_cards[currentChildIndex]}
            parentCategory={cardData.parent_card.category}
          />
        ) : null;
      default:
        return <ParentCard card={cardData.parent_card} />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full gap-2">
      {/* 카드를 일관된 크기로 유지하기 위한 래퍼 추가 */}
      <div className="w-full aspect-square">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={`${viewMode}-${currentChildIndex}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="cursor-grab w-full h-full"
            style={{ touchAction: 'pan-y' }} // 수평 스와이프만 허용
          >
            {renderCurrentCard()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center gap-2">
        <Indicator active={viewMode === VIEW_MODES.PARENT} />
        <Indicator active={viewMode === VIEW_MODES.CHILDREN_LIST} />
        {viewMode === VIEW_MODES.CHILD_DETAIL &&
          hasChildCards &&
          cardData.child_cards.map((_, index) => (
            <Indicator key={index} active={currentChildIndex === index} />
          ))}
      </div>
    </div>
  );
};
// 카드 래퍼 컴포넌트 - 모든 카드에 일관된 크기 보장
const CardWrapper: React.FC<CardWrapperProps> = ({ children }) => {
  return <div className="flex flex-col tracking-tighter w-full h-full">{children}</div>;
};

// 부모 카드 컴포넌트
const ParentCard: React.FC<ParentCardProps> = ({ card }) => {
  if (!card) return <div className="bg-red-100 p-4">카드 데이터가 없습니다</div>;

  return (
    <CardWrapper>
      <div className="relative aspect-square bg-blue-50 p-4 flex flex-col gap-2 border border-gray-200 rounded-t-2xl">
        {/* 카테고리 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Bookmark className="w-6 h-6 text-gray-600" />
            <p className="whitespace-pre-line text-sm">{`${card.category?.main || '카테고리'} > ${
              card.category?.sub || '서브'
            }`}</p>
          </div>
          <p className="text-xs text-gray-600">2025.02.25-22:23:39</p>
        </div>
        {/* 상단 */}
        <hr className="mb-1 border-gray-400" />
        <div className="flex items-center ">
          <p className="italic tracking-tighter text-sm text-gray-600">
            {card.title || '내용 없음'}
          </p>
        </div>
        <hr className="mt-1 border-gray-400" />
        {/* 중앙 */}
        <div className="flex-1 flex flex-col gap-2 justify-center items-center">
          <Quote className="text-gray-600 w-4 h-4" />
          <p className="text-xl font-semibold col-span-8 whitespace-pre-line ">
            {card.key_sentence || '제목 없음'}
          </p>
          <Quote className="text-gray-600 w-4 h-4" />
        </div>
      </div>
      <div className="relative aspect-[6/1] bg-green-5 grid grid-cols-12 border-gray-200 border rounded-b-2xl">
        <div className="col-span-2 bg-violet-20 flex items-center justify-center">
          <DownloadCloud className="w-8 h-8 text-gray-600" />
        </div>
        <div className="col-span-7 bg-violet-30 flex flex-wrap gap-[2px] p-[2px] items-center overflow-hidden">
          {(card.keywords || []).map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-[2px] rounded-full text-xs font-medium text-gray-800 bg-gray-100"
            >
              #{keyword}
            </span>
          ))}
        </div>
        <div className="col-span-3 bg-violet-40 flex items-center justify-center">
          <p className="p-2 px-4 bg-black text-sm text-white rounded-full">더보기</p>
        </div>
      </div>
    </CardWrapper>
  );
};

// 서브 카드 목록 컴포넌트
const ChildrenListCard: React.FC<ChildrenListCardProps> = ({ childCards = [], onSelectChild }) => {
  const handleCardClick = (e: React.MouseEvent, index: number) => {
    // Stop propagation to prevent interference with the parent's drag handler
    e.stopPropagation();
    onSelectChild(index);
  };

  return (
    <CardWrapper>
      <div className="relative aspect-square bg-blue-50/75 p-2 flex flex-col">
        {/* 상단 */}
        <div className="flex items-center justify-between py-2">
          <p className="whitespace-pre-line font-semibold">서브 카드 목록</p>
          <p className="text-xs text-gray-600">2025.02.25-22:23:39</p>
        </div>
        {/* 중앙 */}
        <div className="flex-1 flex flex-col gap-2 overflow-auto pt-2 pb-1 justify-between">
          {childCards.length > 0 ? (
            childCards.map((card, index) => (
              <div
                key={index}
                className="bg-red-200 p-[6px]  rounded-lg shadow cursor-pointer flex items-center justify-between"
              >
                <p>{`${index + 1}. ${card.title || '제목 없음'}`}</p>
                <ArrowRight
                  className="w-4 h-4 text-gray-600"
                  onClick={(e) => handleCardClick(e, index)}
                />
              </div>
            ))
          ) : (
            <div className="bg-gray-100 p-4 rounded-lg text-center">서브 카드가 없습니다</div>
          )}
        </div>
      </div>
      <div className="relative aspect-[6/1] bg-green-5 grid grid-cols-12 border-gray-200 border rounded-b-2xl">
        <div className="col-span-2 bg-violet-20 flex items-center justify-center">
          <DownloadCloud className="w-8 h-8 text-gray-600" />
        </div>
        <div className="col-span-7 bg-violet-30 flex items-center p-2">
          <p className="text-sm">총 {childCards.length}개의 서브 카드</p>
        </div>
        <div className="col-span-3 bg-violet-40 flex items-center justify-center">
          <p className="p-2 px-4 bg-black text-sm text-white rounded-full">더보기</p>
        </div>
      </div>
    </CardWrapper>
  );
};

// 서브 카드 상세 컴포넌트
const ChildDetailCard: React.FC<ChildDetailCardProps> = ({ card, parentCategory }) => {
  if (!card) return <div className="bg-red-100 p-4">카드 데이터가 없습니다</div>;

  return (
    <CardWrapper>
      <div className="relative aspect-square bg-blue-50 p-4 flex flex-col gap-2">
        {/* 카테고리 - 이제 부모 카드에서 전달받은 카테고리 사용 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Bookmark className="w-6 h-6 text-gray-600" />
            <p className="whitespace-pre-line text-sm">{`${parentCategory?.main || '카테고리'} > ${
              parentCategory?.sub || '서브'
            }`}</p>
          </div>
          <p className="text-xs text-gray-600">2025.02.25-22:23:39</p>
        </div>

        {/* 상단 */}
        <hr className="mb-1 border-gray-400" />
        <div className="flex items-center ">
          <p className="italic tracking-tighter text-sm text-gray-600">
            {card.title || '내용 없음'}
          </p>
        </div>
        <hr className="mt-1 border-gray-400" />
        {/* 중앙 */}
        <div className="flex-1 flex flex-col gap-2 justify-center items-center">
          <Quote className="text-gray-600 w-3 h-3" />
          <p className="text-xl font-semibold col-span-8 whitespace-pre-line ">
            {card.content || '제목 없음'}
          </p>
          <Quote className="text-gray-600 w-3 h-3" />
        </div>
      </div>
      <div className="relative aspect-[6/1] bg-green-5 grid grid-cols-12 border-gray-200 border rounded-b-2xl">
        <div className="col-span-2 bg-violet-20 flex items-center justify-center">
          <DownloadCloud className="w-8 h-8 text-gray-600" />
        </div>
        <div className="col-span-7 bg-violet-30 flex flex-wrap gap-[2px] p-[2px] items-center overflow-hidden">
          {(card.keywords || []).map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-800 bg-gray-100"
            >
              #{keyword}
            </span>
          ))}
        </div>
        <div className="col-span-3 bg-violet-40 flex items-center justify-center">
          <p className="p-2 px-4 bg-black text-sm text-white rounded-full">더보기</p>
        </div>
      </div>
    </CardWrapper>
  );
};

// 인디케이터 컴포넌트
const Indicator: React.FC<IndicatorProps> = ({ active }) => {
  return (
    <div
      className={`h-2 w-2 rounded-full transition-all duration-300 ${
        active ? 'bg-black w-4' : 'bg-gray-300'
      }`}
    />
  );
};

export default MemoCardSwiper;
