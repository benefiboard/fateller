//app/(main)/memo/@modal/(...detail)/[id]/page.tsx

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
import { MemoItemProps } from '@/app/utils/types';
import MemoContent from '@/app/ui/MemoContent';

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
  onSelectMemo, // 새로운 prop
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const memoRef = useRef<HTMLDivElement>(null);

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

  // 메모 클릭 핸들러 - 상세 페이지로 이동
  const handleMemoClick = (e: React.MouseEvent) => {
    // 옵션 버튼 영역 클릭 시 무시
    if (
      (e.target as HTMLElement).closest('.memo-options') ||
      (e.target as HTMLElement).closest('.memo-actions')
    ) {
      return;
    }

    // 상위 컴포넌트의 메모 선택 핸들러 호출
    if (onSelectMemo && memo.id) {
      onSelectMemo(memo.id);
    }
  };

  const toggleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  // 처리 함수들
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare && memo) {
      onShare(memo);
    }
    setShowOptions(false);
  };

  const handleFindRelated = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFindRelated && memo.id) {
      onFindRelated(memo.id);
    }
    setShowOptions(false);
  };

  const handleGenerateInsight = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGenerateInsight && memo.id) {
      onGenerateInsight(memo.id);
    }
    setShowOptions(false);
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const openOriginalSource = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (memo.original_text && isValidUrl(memo.original_text)) {
      window.open(memo.original_text, '_blank');
    }
  };

  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch (e) {
      return false;
    }
  };

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

  return (
    <article
      ref={memoRef}
      onClick={handleMemoClick}
      className="p-4 mb-2 border-y border-gray-50 bg-gradient-to-r from-emerald-50/50 to-yellow-50/50 shadow-lg transition-all duration-150 ease-in-out cursor-pointer"
    >
      {/* 메모 내용 */}
      <div className="w-full min-w-0">
        {/* 헤더 - 카테고리, 시간 및 옵션 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            {/* 카테고리 아이콘 (각 카테고리에 맞게 변경) */}
            <div className="mr-1 flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border border-emerald-800 text-emerald-800`}
              >
                {getCategoryIcon()}
              </div>
            </div>
            <span className={`text-sm px-1 py-0.5 rounded-full font-semibold b text-emerald-800`}>
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

            {/* 드롭다운 메뉴 - 지식 관리 시스템에 맞게 수정 */}
            {showOptions && (
              <div
                className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-52 z-50"
                onClick={(e) => e.stopPropagation()} // 클릭 전파 중지
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

        {/* 메모 내용 - 이벤트 핸들러 추가 */}
        <div className="memo-actions" onClick={(e) => e.stopPropagation()}>
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
      </div>
    </article>
  );
};

export default memo(MemoItemAtMain, (prevProps, nextProps) => {
  return (
    prevProps.memo.id === nextProps.memo.id &&
    JSON.stringify(prevProps.memoState) === JSON.stringify(nextProps.memoState)
  );
});
