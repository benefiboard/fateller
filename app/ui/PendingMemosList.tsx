// app/ui/PendingMemosList.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

// 간단한 타입 정의
type PendingMemo = {
  id: string;
  status: 'extracting' | 'processing' | 'analyzing' | 'completed' | 'error';
  inputText: string;
  error?: string;
  extractedData?: {
    title?: string;
    content?: string;
    imageUrl?: string;
    sourceUrl?: string | null;
  };
};

interface PendingMemosListProps {
  pendingMemos: PendingMemo[];
  onRemove: (id: string) => void;
  onRemoveAll: () => void;
  onHeaderDoubleClick?: () => void;
}

// 메모 아이콘 결정 함수
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'extracting':
      return <span className="animate-pulse">⬇️</span>;
    case 'processing':
      return <span className="animate-pulse">⚙️</span>;
    case 'analyzing':
      return <span className="animate-pulse">🧠</span>;
    case 'completed':
      return <span>✅</span>;
    case 'error':
      return <span>❌</span>;
    default:
      return <span>📝</span>;
  }
};

// 메모 상태 텍스트 결정 함수
const getStatusText = (status: string, error?: string) => {
  switch (status) {
    case 'extracting':
      return 'URL에서 콘텐츠를 추출하는 중...';
    case 'processing':
      return '추출된 데이터 정제 및 구조화 중...';
    case 'analyzing':
      return 'AI 분석 중...';
    case 'completed':
      return <span className="text-green-500">처리 완료!</span>;
    case 'error':
      return <span className="text-red-500">{error || '오류 발생'}</span>;
    default:
      return '처리 중...';
  }
};

const PendingMemosList: React.FC<PendingMemosListProps> = ({
  pendingMemos,
  onRemove,
  onRemoveAll,
  onHeaderDoubleClick,
}) => {
  // 빈 목록이면 렌더링하지 않음
  if (pendingMemos.length === 0) return null;

  // 더블 탭 감지를 위한 상태와 타이머
  const [lastTap, setLastTap] = useState<number>(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 헤더 클릭 핸들러
  const handleHeaderClick = () => {
    const now = new Date().getTime();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // 더블 탭 감지
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
        tapTimerRef.current = null;
      }

      onRemoveAll();
      onHeaderDoubleClick?.();
    } else {
      // 첫 번째 탭
      setLastTap(now);

      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }

      tapTimerRef.current = setTimeout(() => {
        tapTimerRef.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="p-2 bg-gray-50">
      <h3
        className="text-sm font-medium text-gray-700 mb-2 px-2 flex justify-between items-center"
        onClick={handleHeaderClick}
      >
        <span>처리 중인 메모</span>
        <span className="text-xs text-gray-400">({pendingMemos.length})</span>
      </h3>

      <div className="space-y-2">
        {pendingMemos.map((memo) => (
          <div key={memo.id} className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center">
              {/* 상태 아이콘 */}
              <div className="mr-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  {getStatusIcon(memo.status)}
                </div>
              </div>

              <div className="flex-1">
                <p className="font-medium text-sm">
                  {memo.status === 'extracting'
                    ? '내용 추출 중...'
                    : memo.status === 'processing'
                    ? '데이터 정제 중...'
                    : memo.status === 'analyzing'
                    ? 'AI 분석 중...'
                    : memo.extractedData?.title || '처리 중인 메모'}
                </p>
                <p className="text-xs text-gray-500">{getStatusText(memo.status, memo.error)}</p>

                {/* 추출 중일 때 입력 텍스트 표시 */}
                {memo.status === 'extracting' && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">{memo.inputText}</p>
                )}
              </div>

              {/* 이미지 미리보기 */}
              {memo.extractedData?.imageUrl && (
                <div className="ml-2 w-12 h-12">
                  <img
                    src={memo.extractedData.imageUrl}
                    alt="미리보기"
                    className="w-full h-full object-cover rounded"
                    width={48}
                    height={48}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* 제거 버튼 */}
              <button
                className="ml-2 p-1 text-gray-400 hover:text-red-500"
                onClick={() => onRemove(memo.id)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 성능 최적화를 위해 React.memo로 감싸기
export default React.memo(PendingMemosList);
