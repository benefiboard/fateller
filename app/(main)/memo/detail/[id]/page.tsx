//app/(main)/memo/detail/[id]/page.tsx

'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useMemos from '@/app/hooks/useMemos';
import MemoContent from '@/app/ui/MemoContent';

export default function MemoDetailPage() {
  const params = useParams();
  const memoId = params.id as string;

  // 상태 관리
  const [memo, setMemo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useMemos 훅에서 필요한 기능만 가져오기
  const { memos } = useMemos({});

  // 메모 데이터 가져오기
  useEffect(() => {
    // 메모 ID로 특정 메모 찾기
    const findMemo = memos.find((m) => m.id === memoId);

    if (findMemo) {
      setMemo(findMemo);
    }

    setIsLoading(false);
  }, [memoId, memos]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mt-10"></div>
        <p className="text-center mt-2">로딩 중...</p>
      </div>
    );
  }

  // 메모를 찾지 못한 경우
  if (!memo) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg mt-10 text-center">
          <p className="mb-4">메모를 찾을 수 없습니다</p>
          <Link href="/memo">
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600">
              메모 목록으로
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // 메모 상세 페이지 UI
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* 뒤로 가기 링크 */}
      <div className="mb-4">
        <Link href="/memo" className="text-emerald-600 hover:underline flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          메모 목록으로
        </Link>
      </div>

      {/* 메모 내용 */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="p-4">
          <MemoContent
            memo={memo}
            expanded={true}
            showLabeling={true}
            showOriginal={false}
            onToggleThread={() => {}}
            onToggleLabeling={() => {}}
            onToggleOriginal={() => {}}
            isVisible={true}
            onSaveThought={(id, thought) => Promise.resolve()}
            onDeleteThought={(id) => Promise.resolve()}
          />
        </div>
      </div>
    </div>
  );
}
