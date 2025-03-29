'use client';

import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Save, Trash2 } from 'lucide-react';

interface ThoughtDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialThought?: string;
  onSave: (thought: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function ThoughtDialog({
  isOpen,
  onClose,
  initialThought = '',
  onSave,
  onDelete,
}: ThoughtDialogProps) {
  const [thought, setThought] = useState<string>(initialThought);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const dialogRef = useRef<HTMLDivElement>(null);

  // 초기 로딩 시 초기값 설정
  useEffect(() => {
    if (isOpen) {
      setThought(initialThought);
    }
  }, [initialThought, isOpen]);

  // ESC 키 눌렀을 때 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // 다이얼로그 열려있을 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 저장 핸들러
  const handleSave = async () => {
    if (!thought.trim()) {
      setStatusMessage('내용을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      setStatusMessage('저장 중...');
      console.log('ThoughtDialog에서 저장하려는 내용:', thought);
      await onSave(thought); // 여기서 호출되는 함수가 ThoughtButton의 handleSave
      setStatusMessage('저장되었습니다.');

      // 잠시 후 닫기
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('저장 중 오류:', error);
      setStatusMessage('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!onDelete) return;

    if (!window.confirm('정말로 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setStatusMessage('삭제 중...');
      await onDelete();
      setStatusMessage('삭제되었습니다.');

      // 잠시 후 닫기
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('삭제 중 오류:', error);
      setStatusMessage('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 닫기 핸들러
  const handleClose = () => {
    if (isSaving || isDeleting) return; // 작업 중에는 닫기 방지
    onClose();
  };

  // 렌더링하지 않는 경우
  if (!isOpen) return null;

  // createPortal을 사용하여 다이얼로그를 body에 직접 렌더링
  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 isolate"
          onMouseDown={(e) => {
            // 배경 클릭 시에만 닫기 (다이얼로그 내용 클릭 시 닫지 않음)
            if (e.target === e.currentTarget) {
              handleClose();
            }
            // 이벤트 전파 방지
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div
            ref={dialogRef}
            className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md w-full mx-4 animate-fade-in"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">내 생각 기록하기</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  disabled={isSaving || isDeleting}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <textarea
                  className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 min-h-[200px]"
                  value={thought}
                  onChange={(e) => setThought(e.target.value)}
                  placeholder="이 글에 대한 나만의 생각을 자유롭게 작성해보세요..."
                  disabled={isSaving || isDeleting}
                />
              </div>

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isDeleting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 flex items-center"
                  >
                    <Save className="h-5 w-5 mr-1" />
                    저장하기
                  </button>

                  {initialThought && onDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={isSaving || isDeleting}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
                    >
                      <Trash2 className="h-5 w-5 mr-1" />
                      삭제하기
                    </button>
                  )}
                </div>
              </div>

              {statusMessage && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">{statusMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
}
