// app/ui/MemoItem.tsx
'use client';

import React, { useState } from 'react';
import {
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Trash2,
  Share,
  BookmarkPlus,
  Network,
  Lightbulb,
  ExternalLink,
  Tag,
  // 카테고리별 아이콘들
  BookOpen, // 인문/철학
  BarChart3, // 경영/경제
  LandPlot, // 정치
  Users, // 사회과학
  Atom, // 자연과학
  PiSquare, // 수학
  Cpu, // 기술/공학
  Stethoscope, // 의학/건강
  Palette, // 예술/문화
  PenTool,
  Languages,
  Globe,
  SquareRadical,
  User,
  GraduationCap,
  Briefcase,
  Hourglass,
  Share2, // 문학/창작
} from 'lucide-react';
import { Memo, Profile } from '../utils/types';
import MemoContent from './MemoContent';

interface MemoItemProps {
  memo: Memo;
  profile: Profile;
  memoState: {
    expanded: boolean;
    showLabeling: boolean;
    showOriginal: boolean;
  };
  onToggleThread: (id: string) => void;
  onToggleLabeling: (id: string) => void;
  onToggleOriginal: (id: string) => void;
  onEdit: (memo: Memo) => void;
  onAnalyze: (memo: Memo) => void;
  onDelete: (id: string) => void;
  onShare?: (memo: Memo) => void; // 공유 기능 추가
  onFindRelated?: (id: string) => void; // 관련 메모 찾기 기능 추가
  onGenerateInsight?: (id: string) => void; // 인사이트 생성 기능 추가
}

const MemoItem: React.FC<MemoItemProps> = ({
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
}) => {
  // 옵션 드롭다운 상태
  const [showOptions, setShowOptions] = useState(false);

  // 새로운 상태: 저장됨 표시
  const [isSaved, setIsSaved] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // 처리 함수들
  const handleShare = () => {
    if (onShare && memo) {
      onShare(memo);
    }
    setShowOptions(false);
  };

  const handleFindRelated = () => {
    if (onFindRelated && memo.id) {
      onFindRelated(memo.id);
    }
    setShowOptions(false);
  };

  const handleGenerateInsight = () => {
    if (onGenerateInsight && memo.id) {
      onGenerateInsight(memo.id);
    }
    setShowOptions(false);
  };

  // 저장 토글
  const toggleSave = () => {
    setIsSaved(!isSaved);
    // 여기에 저장 API 호출 또는 상태 업데이트 로직 추가
  };

  // 원본 URL로 이동하는 함수
  const openOriginalSource = () => {
    if (memo.original_text && isValidUrl(memo.original_text)) {
      window.open(memo.original_text, '_blank');
    }
  };

  // URL 유효성 검사
  const isValidUrl = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  // 카테고리에 따른 아이콘 반환 함수
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

  // 카테고리에 따른 배경색 반환 함수 (선택 사항)
  // const getCategoryBgColor = () => {
  //   const category = memo.labeling?.category || '';

  //   switch (category) {
  //     case '인문/철학':
  //       return 'bg-purple-100 text-purple-600';
  //     case '경영/경제':
  //       return 'bg-blue-100 text-blue-600';
  //     case '정치':
  //       return 'bg-red-100 text-red-600';
  //     case '사회과학':
  //       return 'bg-amber-100 text-amber-600';
  //     case '자연과학':
  //       return 'bg-green-100 text-green-600';
  //     case '수학':
  //       return 'bg-indigo-100 text-indigo-600';
  //     case '기술/공학':
  //       return 'bg-gray-100 text-gray-600';
  //     case '의학/건강':
  //       return 'bg-rose-100 text-rose-600';
  //     case '예술/문화':
  //       return 'bg-pink-100 text-pink-600';
  //     case '문학/창작':
  //       return 'bg-orange-100 text-orange-600';
  //     default:
  //       return 'bg-emerald-100 text-emerald-600';
  //   }
  // };

  return (
    <article className="p-4 pl-2 border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="flex">
        {/* 카테고리 아이콘 (각 카테고리에 맞게 변경) */}
        <div className="mr-1 flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center border border-emerald-800 text-emerald-800`}
          >
            {getCategoryIcon()}
          </div>
        </div>

        {/* 메모 내용 */}
        <div className="flex-1 min-w-0">
          {/* 헤더 - 카테고리, 시간 및 옵션 */}
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {/* <span
                className={`w-8 h-8 rounded-full flex items-center justify-center border border-emerald-800 text-emerald-800`}
              >
                {getCategoryIcon()}
              </span> */}
              <span
                className={` text-sm px-1 py-0.5 rounded-full  font-semibold b text-emerald-800`}
              >
                {memo.labeling?.category || '미분류'}
              </span>
              <span className="text-gray-400 text-sm ml-1 mr-2">|</span>
              <span className="text-gray-400 text-sm">{memo.time || '방금 전'}</span>
            </div>

            {/* 옵션 메뉴 */}
            <div className="relative ">
              <button
                onClick={toggleOptions}
                className="text-gray-500 hover:text-emerald-400 p-1 rounded-full hover:bg-emerald-50"
              >
                <MoreHorizontal size={18} />
              </button>

              {/* 드롭다운 메뉴 - 지식 관리 시스템에 맞게 수정 */}
              {showOptions && (
                <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 w-52 z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit(memo);
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Pencil size={16} className="text-gray-600" />
                      <p>메모수정</p>
                    </button>

                    {/* <button
                      onClick={handleShare}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Share2 size={16} className="text-gray-600" />
                      <p>공유하기</p>
                    </button> */}

                    {/* 추후 추가 버튼들 삭제금지 */}
                    {/* <button
                      onClick={() => {
                        onAnalyze(memo);
                        setShowOptions(false);
                      }}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <RotateCcw size={16} className="text-gray-600" />
                      <p>AI 재분석</p>
                    </button>

                    <button
                      onClick={handleFindRelated}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Network size={16} className="text-gray-600" />
                      <p>관련 메모 찾기</p>
                    </button>

                    <button
                      onClick={handleGenerateInsight}
                      className="w-full flex items-center gap-2 text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Lightbulb size={16} className="text-gray-600" />
                      <p>인사이트 생성</p>
                    </button> */}

                    <button
                      onClick={() => {
                        memo.id && onDelete(memo.id);
                        setShowOptions(false);
                      }}
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
          />
        </div>
      </div>
    </article>
  );
};

export default MemoItem;
