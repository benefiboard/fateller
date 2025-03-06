//app/ui/MemoContent.tsx

import React from 'react';
import { Memo } from '../utils/types';

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
    // <strong> 태그를 Tailwind CSS 클래스로 변환
    return text.replace(
      /<hi>(.*?)<\/hi>/g,
      '<span class="font-bold underline underline-offset-4  px-[2px]">$1</span>'
    );
  };

  // renderHTML 함수 추가
  const renderHTML = (htmlString: string) => {
    return <span dangerouslySetInnerHTML={{ __html: processStrongTags(htmlString) }} />;
  };

  return (
    <>
      <h2 className=" mt-1  flex  gap-1">
        <span className="text-sm">▷</span> {memo.title}
      </h2>
      <p className=" py-8 my-2  font-semibold tracking-tighter leading-relaxed  underline-offset-4">
        " {removeHtmlTags(memo.labeling.key_sentence)} "
      </p>
      {/* <p className="py-4 mt-2 text-gray-700">{renderHTML(memo.tweet_main)}</p> */}
      <div className="flex flex-wrap items-center gap-1 py-2 bg-emerald-50 text-emerald-700">
        {memo.labeling.keywords.map((keyword, keywordIndex) => (
          <span key={keywordIndex} className="text-sm text-emerald-700 px-2 py-0.5 rounded">
            #{keyword}
          </span>
        ))}
      </div>
      <hr className="border-1 border-gray-200 my-2" />

      {/* 버튼 영역 - 항상 같은 위치에 고정 */}
      <div className="flex space-x-4">
        <button onClick={onToggleLabeling} className="text-gray-400 text-sm font-medium">
          핵심 문장
        </button>

        <p className="text-gray-400">|</p>

        <button onClick={onToggleThread} className="text-gray-400 text-sm font-medium">
          주요 내용
        </button>

        <p className="text-gray-400">|</p>

        <button onClick={onToggleOriginal} className="text-gray-400 text-sm font-medium">
          원문
        </button>
      </div>
      <hr className="border-1 border-gray-200 mt-2" />

      {/* 요약 표시 (토글 가능) */}
      {showLabeling && (
        <>
          <div className="mt-2 border-l-2 border-gray-300 pl-3 space-y-3">
            <div className="rounded-lg">
              <div className="flex items-center cursor-pointer" onClick={onToggleLabeling}>
                <span className="text-teal-500 mr-2">{showLabeling ? '▼' : '▲'}</span>
                <h3 className="text-sm font-medium text-teal-700">핵심 문장</h3>
              </div>
              <div className="space-y-2 mt-2">
                <p className="py-2 text-sm  mt-1 italic text-gray-800 bg-gray-100 p-2 rounded leading-relaxed">
                  "{renderHTML(memo.tweet_main)}"
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      {/* {showLabeling && (
        <>
          <div className="mt-2 border-l-2 border-gray-300 pl-3 space-y-3">
            <div className="rounded-lg">
              <div className="flex items-center cursor-pointer" onClick={onToggleLabeling}>
                <span className="text-teal-500 mr-2">{showLabeling ? '▼' : '▲'}</span>
                <h3 className="text-sm font-medium text-teal-700">요약</h3>
              </div>
              <div className="space-y-2 mt-2">
                <div>
                  <span className="text-sm font-medium text-teal-600">카테고리:</span>
                  <span className="ml-2 text-sm bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                    {memo.labeling.category}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-teal-600">키워드:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {memo.labeling.keywords.map((keyword, keywordIndex) => (
                      <span
                        key={keywordIndex}
                        className="text-sm bg-teal-200 text-teal-700 px-2 py-0.5 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-teal-600">핵심 문장:</span>
                  <p className="py-2 text-sm text-teal-800 mt-1 italic bg-teal-100 p-2 rounded">
                    "{renderHTML(memo.tweet_main)}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )} */}

      {/* 주요 내용 표시 (토글 가능) */}
      {expanded && (
        <>
          <div className="mt-2 border-l-2 border-gray-300 pl-3 space-y-3">
            <div className="flex items-center cursor-pointer" onClick={onToggleThread}>
              <span className="text-teal-500 mr-2">{expanded ? '▼' : '▲'}</span>
              <h3 className="text-sm font-medium text-teal-700">주요내용</h3>
            </div>
            <div className="mt-2">
              {memo.thread.map((tweet, tweetIndex) => (
                <p key={tweetIndex} className="text-gray-700 text-sm mb-4">
                  {renderHTML(tweet)}
                </p>
              ))}
            </div>
          </div>
          <hr className="border-1 border-gray-200 mt-4 mb-2" />
        </>
      )}

      {/* 원문 표시 (토글 가능) */}
      {showOriginal && (
        <>
          <div className="mt-2 border-l-2 border-gray-300 pl-3 space-y-3">
            <div className="rounded-lg">
              <div className="flex items-center cursor-pointer" onClick={onToggleOriginal}>
                <span className="text-teal-500 mr-2">{showOriginal ? '▼' : '▲'}</span>
                <h3 className="text-sm font-medium text-teal-700">원문</h3>
              </div>

              {memo.original_text && isUrl(memo.original_text) ? (
                // URL인 경우 링크와 바로가기 버튼 표시
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">원본 URL:</p>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-700 break-all mr-2">
                      {memo.original_text}
                    </span>
                    <a
                      href={memo.original_text}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      바로가기
                    </a>
                  </div>
                </div>
              ) : (
                // 일반 텍스트인 경우 기존처럼 표시
                <p className="text-sm text-gray-700 whitespace-pre-wrap mt-2">
                  {memo.original_text || '원문이 없습니다.'}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MemoContent;
