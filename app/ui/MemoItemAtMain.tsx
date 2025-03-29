'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Tag,
  // 카테고리별 아이콘들
  BookOpen,
  BarChart3,
  LandPlot,
  Users,
  Atom,
  PiSquare,
  Cpu,
  Stethoscope,
  Palette,
  PenTool,
  Languages,
  Globe,
  SquareRadical,
  User,
  GraduationCap,
  Briefcase,
  Hourglass,
  Share2,
} from 'lucide-react';
import { Memo, MemoItemProps } from '../utils/types';
import MemoContent from './MemoContent';

// props 인터페이스 확장
interface MemoItemAtMainProps extends MemoItemProps {
  onSelectMemo?: (id: string) => void; // 메모 선택 핸들러 추가
}

const MemoItemAtMain: React.FC<MemoItemAtMainProps> = ({
  memo,
  profile,
  memoState,
  onToggleThread,
  onToggleLabeling,
  onToggleOriginal,
  onEdit,
  onAnalyze,
  onDelete,
  onShare,
  onFindRelated,
  onGenerateInsight,
  onSaveThought,
  onDeleteThought,
  onSelectMemo,
}) => {
  // 옵션 드롭다운 상태
  const [showOptions, setShowOptions] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const memoRef = useRef<HTMLDivElement>(null);

  // 디버깅 로그 추가
  useEffect(() => {
    console.log('MemoItemAtMain 렌더링됨:', memo.id);
  }, [memo.id]);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (memoRef.current) {
            observer.unobserve(memoRef.current);
          }
        }
      },
      {
        threshold: 0.35,
      }
    );

    if (memoRef.current) {
      observer.observe(memoRef.current);
    }

    return () => {
      if (memoRef.current) {
        observer.unobserve(memoRef.current);
      }
    };
  }, []);

  // 메모 클릭 핸들러 - 디버깅 로그 추가
  const handleMemoClick = (e: React.MouseEvent) => {
    console.log('메모 클릭됨:', memo.id);
    console.log('타겟 요소:', e.target);

    // 이벤트 전파 확인
    if ((e.target as HTMLElement).closest('.memo-options')) {
      console.log('옵션 영역 클릭 - 모달 열지 않음');
      return;
    }

    // 메모 선택 핸들러 호출
    if (onSelectMemo && memo.id) {
      console.log('모달 열기 함수 호출:', memo.id);
      onSelectMemo(memo.id);
    } else {
      console.log('onSelectMemo 함수 없음 또는 memo.id 없음:', { onSelectMemo, memoId: memo.id });
    }
  };

  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  // 옵션 메뉴 핸들러들
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(memo);
    setShowOptions(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (memo.id) {
      onDelete(memo.id);
    }
    setShowOptions(false);
  };

  // 카테고리 아이콘
  const getCategoryIcon = () => {
    const category = memo.labeling?.category || '';

    switch (category) {
      case '인문/철학':
        return <BookOpen size={16} />;
      case '역사':
        return <Hourglass size={16} />;
      case '경영/경제':
        return <BarChart3 size={16} />;
      case '언어':
        return <Languages size={16} />;
      case '정치':
        return <LandPlot size={16} />;
      case '사회':
        return <Users size={16} />;
      case '국제':
        return <Globe size={16} />;
      case '과학/IT':
        return <Atom size={16} />;
      case '수학':
        return <SquareRadical size={16} />;
      case '기술/공학':
        return <Cpu size={16} />;
      case '의학/건강':
        return <Stethoscope size={16} />;
      case '예술/문화':
        return <Palette size={16} />;
      case '문학/창작':
        return <PenTool size={16} />;
      case '개인':
        return <User size={16} />;
      case '학습':
        return <GraduationCap size={16} />;
      case '업무':
        return <Briefcase size={16} />;
      default:
        return <Tag size={16} />;
    }
  };

  return (
    // 중요: z-index 추가 및 relative 추가
    <div className="relative z-10">
      <article
        ref={memoRef}
        className="p-4 mb-2 border-y border-gray-50 bg-gradient-to-r from-emerald-50/50 to-yellow-50/50 shadow-lg transition-all duration-150 ease-in-out cursor-pointer"
      >
        <div className="w-full min-w-0">
          {/* 헤더 - 카테고리, 시간 및 옵션 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="mr-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center border border-emerald-800 text-emerald-800">
                  {getCategoryIcon()}
                </div>
              </div>
              <span className="text-sm px-1 py-0.5 rounded-full font-semibold b text-emerald-800">
                {memo.labeling?.category || '미분류'}
              </span>
              <span className="text-gray-400 text-sm ml-1 mr-2">|</span>
              <span className="text-gray-400 text-sm">{memo.time || '방금 전'}</span>
            </div>

            {/* 옵션 메뉴 */}
            <div className="relative memo-options">
              <button
                onClick={toggleOptions}
                className="text-gray-500 hover:text-emerald-400 p-1 rounded-full hover:bg-emerald-50"
              >
                <MoreHorizontal size={18} />
              </button>

              {showOptions && (
                <div
                  className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-52 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <button
                      onClick={handleEdit}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Pencil size={16} className="text-gray-600" />
                      <p>메모수정</p>
                    </button>

                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} className="text-red-600" />
                      <p>삭제하기</p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 메모 내용 */}
          <MemoContent
            memo={memo}
            expanded={memoState.expanded}
            showLabeling={memoState.showLabeling}
            showOriginal={memoState.showOriginal}
            onToggleThread={() => memo.id && onToggleThread(memo.id)}
            onToggleLabeling={() => memo.id && onToggleLabeling(memo.id)}
            onToggleOriginal={() => memo.id && onToggleOriginal(memo.id)}
            isVisible={isVisible}
            onSaveThought={onSaveThought}
            onDeleteThought={onDeleteThought}
          />
        </div>
      </article>

      {/* 투명한 클릭 오버레이 - 전체 영역 클릭 가능하게 */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleMemoClick}
        style={{ zIndex: 5 }}
      />
    </div>
  );
};

export default memo(MemoItemAtMain, (prevProps, nextProps) => {
  return (
    prevProps.memo.id === nextProps.memo.id &&
    JSON.stringify(prevProps.memoState) === JSON.stringify(nextProps.memoState)
  );
});
