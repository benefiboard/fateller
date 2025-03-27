//app/tts/TTSDialog.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Volume2, PauseCircle, PlayCircle, CircleStop } from 'lucide-react';
import React from 'react';

interface TTSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
}

export default function TTSDialog({ isOpen, onClose, initialText = '' }: TTSDialogProps) {
  const [text] = useState<string>(initialText);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(-1);

  const koreanVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef<number>(0);
  const shouldStopRef = useRef<boolean>(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  // 속도 관련 상태
  const [rate, setRate] = useState<number>(1.0); // 기본 속도 1.1
  const [selectedRate, setSelectedRate] = useState<string>('1.0');

  // 초기 로딩 시 텍스트를 청크로 미리 분할하기
  useEffect(() => {
    if (text && isOpen) {
      textChunksRef.current = splitTextIntoSafeChunks(text);
    }
  }, [text, isOpen]);

  // Handle close on ESC key
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

  // Prevent body scrolling when dialog is open
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

  // 현재 읽고 있는 청크가 변경될 때 해당 위치로 스크롤
  useEffect(() => {
    if (currentChunkIndex >= 0 && textDisplayRef.current) {
      const chunkElements = textDisplayRef.current.querySelectorAll('.tts-chunk');
      if (chunkElements[currentChunkIndex]) {
        chunkElements[currentChunkIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentChunkIndex]);

  // Load available voices and find Korean voice
  useEffect(() => {
    if (!isOpen) return;

    const loadVoices = () => {
      try {
        const synth = window.speechSynthesis;
        const voices = synth.getVoices();

        // Try to find Google Korean voice first
        let koreanVoice = voices.find(
          (v) =>
            v.name.includes('Google') &&
            (v.name.includes('한국의') || v.name.includes('KR') || v.name.includes('헤미')) &&
            v.lang.includes('ko')
        );

        // If not found, try any Korean voice
        if (!koreanVoice) {
          koreanVoice = voices.find((v) => v.lang.includes('ko'));
        }

        if (koreanVoice) {
          koreanVoiceRef.current = koreanVoice;
          setStatusMessage(`음성: ${koreanVoice.name}`);
          console.log('Selected voice:', koreanVoice.name);
        } else {
          setStatusMessage('한국어 음성을 찾을 수 없습니다');
          console.warn('Korean voice not found');
        }
      } catch (error) {
        console.error('Error loading voices:', error);
        setStatusMessage('음성 로딩 중 오류 발생');
      }
    };

    // Chrome requires onvoiceschanged, Safari does not
    if (window.speechSynthesis) {
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      loadVoices();
    }
  }, [isOpen]);

  // Safety measure: when component unmounts or dialog closes, cancel speech
  useEffect(() => {
    return () => {
      stopSpeaking();
      setCurrentChunkIndex(-1);
    };
  }, [isOpen]);

  // 읽기 시작 함수
  const startSpeaking = () => {
    if (!textChunksRef.current.length) return;

    setIsSpeaking(true);
    shouldStopRef.current = false;
    speakNextChunk();
  };

  // 읽기 중지 함수
  const stopSpeaking = () => {
    shouldStopRef.current = true;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentChunkIndex(-1);
  };

  // 다음 청크 읽기 함수
  // 다음 청크 읽기 함수 (매개변수로 현재 속도를 받을 수 있도록 수정)
  const speakNextChunk = (currentRate = rate) => {
    // speechSynthesis가 누적된 발화가 있다면 모두 취소
    try {
      window.speechSynthesis.cancel();
    } catch (error) {
      console.error('Speech synthesis cancel error:', error);
    }

    const chunks = textChunksRef.current;
    const currentIndex = currentChunkRef.current;

    // 읽을 청크가 없거나 중지 신호가 있으면 종료
    if (currentIndex >= chunks.length || shouldStopRef.current) {
      if (!shouldStopRef.current) {
        setStatusMessage('읽기 완료');
      }
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentChunkIndex(-1);
      return;
    }

    // UI와 내부 상태 동기화 확실히 하기
    setCurrentChunkIndex(currentIndex);
    const chunk = chunks[currentIndex];
    setStatusMessage(`읽는 중`);

    try {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(chunk);

      // 음성 설정
      if (koreanVoiceRef.current) {
        utterance.voice = koreanVoiceRef.current;
        utterance.lang = 'ko-KR';
      }

      // 매개변수로 받은 속도 사용
      utterance.rate = currentRate;

      // 완료 이벤트가 확실히 발생하게 처리
      let onEndCalled = false;

      utterance.onend = () => {
        if (onEndCalled) return;
        onEndCalled = true;

        if (!shouldStopRef.current) {
          // 다음 청크로 이동
          currentChunkRef.current = currentIndex + 1;

          // 문장 끝이나 숫자로 시작하는 항목 사이에 짧은 지연 추가
          const nextChunk = chunks[currentIndex + 1];
          const isEndOfSentence = chunk.trim().match(/[.!?]$/);
          const isNextItemNumbered =
            nextChunk &&
            nextChunk
              .trim()
              .match(
                /^(첫째,|둘째,|셋째,|넷째,|다섯째,|여섯째,|일곱째,|여덟째,|아홉째,|열째,|\d+,)/
              );

          // 섹션 구분선은 더 긴 지연 추가
          const isSectionBreak = chunk.includes('===') || (nextChunk && nextChunk.includes('==='));

          // 지연 시간 결정
          let delay = 5;
          if (isSectionBreak) {
            delay = 50; // 섹션 구분선은 더 긴 지연
          } else if (isEndOfSentence || isNextItemNumbered) {
            delay = 20; // 문장 끝이나 번호 항목은 중간 지연
          }

          setTimeout(() => {
            // 동일한 속도로 다음 청크 재생
            speakNextChunk(currentRate);
          }, delay);
        }
      };

      utterance.onerror = (event) => {
        console.error('발화 오류:', event);

        if (onEndCalled) return;
        onEndCalled = true;

        if (!shouldStopRef.current) {
          currentChunkRef.current = currentIndex + 1;
          setTimeout(() => {
            // 동일한 속도로 다음 청크 재생
            speakNextChunk(currentRate);
          }, 100);
        }
      };

      synth.speak(utterance);
    } catch (error) {
      console.error('speakNextChunk 오류:', error);
      // 오류 발생 시 다음 청크로 진행
      if (!shouldStopRef.current) {
        currentChunkRef.current = currentIndex + 1;
        setTimeout(() => {
          // 동일한 속도로 다음 청크 재생
          speakNextChunk(currentRate);
        }, 100);
      }
    }
  };

  // Safely split text into smaller chunks with improved handling for numbered lists
  const splitTextIntoSafeChunks = (text: string) => {
    // 빈 텍스트인 경우 빈 배열 반환
    if (!text || text.trim() === '') {
      return [];
    }

    // 텍스트 전처리 - 리스트 항목 앞에 공백 추가하여 더 잘 인식되도록 함
    text = text
      .replace(/^1\.\s+/gm, '첫째, ')
      .replace(/\n1\.\s+/gm, '\n첫째, ')
      .replace(/^2\.\s+/gm, '둘째, ')
      .replace(/\n2\.\s+/gm, '\n둘째, ')
      .replace(/^3\.\s+/gm, '셋째, ')
      .replace(/\n3\.\s+/gm, '\n셋째, ')
      .replace(/^4\.\s+/gm, '넷째, ')
      .replace(/\n4\.\s+/gm, '\n넷째, ')
      .replace(/^5\.\s+/gm, '다섯째, ')
      .replace(/\n5\.\s+/gm, '\n다섯째, ')
      .replace(/^6\.\s+/gm, '여섯째, ')
      .replace(/\n6\.\s+/gm, '\n여섯째, ')
      .replace(/^7\.\s+/gm, '일곱째, ')
      .replace(/\n7\.\s+/gm, '\n일곱째, ')
      .replace(/^8\.\s+/gm, '여덟째, ')
      .replace(/\n8\.\s+/gm, '\n여덟째, ')
      .replace(/^9\.\s+/gm, '아홉째, ')
      .replace(/\n9\.\s+/gm, '\n아홉째, ')
      .replace(/^10\.\s+/gm, '열번째, ')
      .replace(/\n10\.\s+/gm, '\n열번째, ')
      .replace(/^(\d+)\.\s+/gm, '$1, ')
      .replace(/\n(\d+)\.\s+/gm, '\n$1, ')
      .replace(/•/g, ' • ');

    // 구분선 및 제목 라인을 별도로 처리하기 위해 특별히 처리
    const lines = text.split(/\n/);
    const chunks: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 빈 줄 건너뛰기
      if (!line) continue;

      // 구분선은 그대로 추가 (별도 그룹으로 처리하기 위해)
      if (line.match(/^={3,}$/)) {
        chunks.push(line);
        continue;
      }

      // 섹션 제목은 그대로 추가 (별도 그룹으로 처리하기 위해)
      if (line.includes('=====')) {
        chunks.push(line);
        continue;
      }

      // 짧은 줄은 바로 추가
      if (line.length <= 100) {
        chunks.push(line);
        continue;
      }

      // 리스트 항목(숫자나 불릿으로 시작)인지 확인
      const isListItem = line.match(
        /^\s*(첫째,|둘째,|셋째,|넷째,|다섯째,|여섯째,|일곱째,|여덟째,|아홉째,|열번째,|\d+,|•|\[|\])/
      );

      // 리스트 항목은 문장 단위로 분할하지 않고 전체로 처리
      if (isListItem) {
        // 리스트 항목이 길다면 콤마 등으로 분할
        if (line.length > 80) {
          const parts = line.split(/(?<=[,;:])\s+/);
          let currentChunk = '';

          for (const part of parts) {
            if ((currentChunk + part).length > 80) {
              if (currentChunk) chunks.push(currentChunk.trim());
              currentChunk = part;
            } else {
              currentChunk += (currentChunk ? ' ' : '') + part;
            }
          }

          if (currentChunk) chunks.push(currentChunk.trim());
        } else {
          chunks.push(line);
        }
        continue;
      }

      // 일반 텍스트는 문장 단위로 분할
      const sentences = line.match(/[^.!?]+[.!?]+/g);
      if (sentences && sentences.length > 0) {
        for (const sentence of sentences) {
          const trimmedSentence = sentence.trim();

          // 문장이 충분히 짧으면 그대로 추가
          if (trimmedSentence.length <= 60) {
            chunks.push(trimmedSentence);
          } else {
            // 긴 문장은 구두점으로 나누기
            const parts = trimmedSentence.split(/(?<=[,;:])\s+/);
            let currentChunk = '';

            for (const part of parts) {
              if ((currentChunk + part).length > 60) {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = part;
              } else {
                currentChunk += (currentChunk ? ' ' : '') + part;
              }
            }

            if (currentChunk) chunks.push(currentChunk.trim());
          }
        }
      } else {
        // 문장 구분자가 없는 경우 적절한 크기로 분할
        if (line.length <= 60) {
          chunks.push(line);
        } else {
          // 단어 단위로 분할
          const words = line.split(/\s+/);
          let currentChunk = '';

          for (const word of words) {
            if ((currentChunk + ' ' + word).length > 60) {
              if (currentChunk) chunks.push(currentChunk.trim());
              currentChunk = word;
            } else {
              currentChunk += (currentChunk ? ' ' : '') + word;
            }
          }

          if (currentChunk) chunks.push(currentChunk.trim());
        }
      }
    }

    return chunks;
  };

  // 재생 버튼 클릭 핸들러
  const handlePlay = () => {
    if (isSpeaking) return;

    // 청크가 비어 있으면 초기화
    if (textChunksRef.current.length === 0) {
      textChunksRef.current = splitTextIntoSafeChunks(text);
    }

    currentChunkRef.current = 0;
    console.log(`재생 시작: ${textChunksRef.current.length}개 청크`);

    startSpeaking();
  };

  // 일시정지/재개 버튼 클릭 핸들러
  const handlePause = () => {
    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setStatusMessage('재생 재개');
    } else {
      synth.pause();
      setIsPaused(true);
      setStatusMessage('일시정지됨');
    }
  };

  // 중지 버튼 클릭 핸들러
  const handleStop = () => {
    stopSpeaking();
    setStatusMessage('정지됨');
  };

  // 속도 변경 버튼 클릭 핸들러
  const handleRateChange = (newRate: number, rateName: string) => {
    // 이전 속도와 동일하면 작업 중단
    if (newRate === rate) return;

    // 상태 업데이트
    setRate(newRate);
    setSelectedRate(rateName);

    // 재생 중인 경우
    if (isSpeaking) {
      // 현재 상태 저장
      const currentIndex = currentChunkRef.current;
      const wasPaused = isPaused;

      // Web Speech API 완전 정지
      shouldStopRef.current = true;
      window.speechSynthesis.cancel();

      // 충분히 긴 지연 설정 (500ms)
      setTimeout(() => {
        // 정지 신호 해제
        shouldStopRef.current = false;

        // 재생 위치 복원 (UI와 실제 재생 위치 모두 동기화)
        currentChunkRef.current = currentIndex;
        setCurrentChunkIndex(currentIndex);

        // 여기가 중요! - 참조 변수를 생성해서 현재 속도를 저장
        const currentRate = newRate; // 클로저에서 현재 전달된 newRate 값 사용

        // 재생 상태였을 경우에만 재개
        if (!wasPaused) {
          setIsSpeaking(true);
          setTimeout(() => {
            // 수정된 speakNextChunk 호출
            speakNextChunk(currentRate);
          }, 100);
        } else {
          // 일시정지 상태 복원
          setIsSpeaking(true);
          setIsPaused(true);
        }
      }, 500); // 충분히 긴 지연 시간
    }
  };

  // 다이얼로그 닫기 핸들러
  const handleClose = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    onClose();
  };

  // 청크 렌더링 - 노래방 스타일 하이라이트 및 구분선 처리
  // 청크 렌더링 - 노래방 스타일 하이라이트 및 구분선 처리
  const renderChunks = () => {
    if (textChunksRef.current.length === 0) {
      return text;
    }

    return (
      <div>
        {textChunksRef.current.map((chunk, index) => {
          // 아이디어 맵 또는 주요 내용 앞에 줄바꿈 3개 추가
          const isSpecialSection =
            chunk.includes('[ 아이디어 맵 ]') || chunk.includes('[ 주요 내용 ]');

          return (
            <React.Fragment key={index}>
              {/* 특별 섹션 앞에 공백 추가 */}
              {isSpecialSection && (
                <div className="h-12"></div> // 약 3줄 정도의 공백을 위한 높이
              )}

              {/* [제목], [키워드] 등 대괄호로 감싸진 라벨 처리 */}
              {chunk.match(/^\[.*?\]/) && chunk.length < 20 ? (
                <div
                  className={`tts-chunk p-1 mb-1 rounded leading-relaxed font-bold text-gray-700 ${
                    index === currentChunkIndex ? 'bg-emerald-600 text-white' : 'bg-gray-100'
                  }`}
                >
                  {chunk}
                </div>
              ) : (
                // 일반 텍스트
                <div
                  className={`tts-chunk p-1 mb-1 rounded leading-relaxed ${
                    index === currentChunkIndex ? 'bg-emerald-600 text-white' : ''
                  }`}
                >
                  {chunk}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  // Use createPortal to render dialog outside of parent component's DOM hierarchy
  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(
        <div
          className="tracking-tighter fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 isolate"
          onMouseDown={(e) => {
            // Only close if clicking the backdrop, not the dialog content
            if (e.target === e.currentTarget) {
              handleClose();
            }
            // Stop propagation to prevent interactions with underlying page
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
                <h2 className="text-2xl font-bold text-gray-800">아이디어 읽기</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                {/* <label
                  htmlFor="text-display"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  읽을 텍스트
                </label> */}
                <div
                  ref={textDisplayRef}
                  id="text-display"
                  className="w-full px-3 py-2 mt-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 overflow-y-auto max-h-[480px] sm:max-h-[640px]"
                >
                  {renderChunks()}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {!isSpeaking && (
                  <button
                    onClick={handlePlay}
                    disabled={!text.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                  >
                    <span className="flex items-center">
                      <Volume2 className="h-5 w-5 mr-1" />
                      재생
                    </span>
                  </button>
                )}

                {isSpeaking && (
                  <>
                    <button
                      onClick={handlePause}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      <span className="flex items-center">
                        {isPaused ? (
                          <>
                            <PlayCircle className="h-5 w-5 mr-1" />
                            계속
                          </>
                        ) : (
                          <>
                            <PauseCircle className="h-5 w-5 mr-1" />
                            일시정지
                          </>
                        )}
                      </span>
                    </button>

                    <button
                      onClick={handleStop}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <span className="flex items-center">
                        <CircleStop className="h-5 w-5 mr-1" />
                        정지
                      </span>
                    </button>
                  </>
                )}
              </div>

              {/* 속도 조절 버튼 */}
              <div className="mt-4 flex items-center">
                <span className="text-sm mr-3 text-gray-600">재생 속도:</span>

                <div className="flex-1 flex items-center">
                  <input
                    type="range"
                    min="0.8"
                    max="1.8"
                    step="0.1"
                    value={rate}
                    onChange={(e) => {
                      const newRate = parseFloat(e.target.value);
                      handleRateChange(newRate, newRate.toString());
                    }}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />

                  <span className="ml-3 text-sm font-medium text-emerald-600 min-w-[40px] text-right">
                    {rate.toFixed(1)}x
                  </span>
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
