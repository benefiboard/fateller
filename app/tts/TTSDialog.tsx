'use client';

import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Volume2, PauseCircle, PlayCircle, CircleStop } from 'lucide-react';
import React from 'react';
import NoSleep from 'nosleep.js';

interface TTSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  originalImage?: string;
}

export default function TTSDialog({
  isOpen,
  onClose,
  initialText = '',
  originalImage = '',
}: TTSDialogProps) {
  const [text] = useState<string>(initialText);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [currentChunkIndex, setCurrentChunkIndex] = useState<number>(-1);
  const [currentTitle, setCurrentTitle] = useState<string>('');

  // 화면 크기 감지를 위한 상태 추가
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const koreanVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef<number>(0);
  const shouldStopRef = useRef<boolean>(false);
  const cinematicContainerRef = useRef<HTMLDivElement>(null);
  const noSleepRef = useRef<NoSleep | null>(null);
  const titlesRef = useRef<{ [key: number]: string }>({});

  // 속도 관련 상태
  const [rate, setRate] = useState<number>(() => {
    const savedRate = localStorage.getItem('tts-rate');
    return savedRate ? parseFloat(savedRate) : 1.0;
  });
  const [selectedRate, setSelectedRate] = useState<string>('1.0');

  // 컨트롤 UI 표시 여부
  const [showControls, setShowControls] = useState<boolean>(true);

  // 화면 크기 변화 감지 (모바일 여부 확인)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 770);
    };

    // 초기 확인
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 초기 로딩 시 텍스트를 청크로 미리 분할하기
  useEffect(() => {
    if (text && isOpen) {
      const { chunks, titles } = splitTextIntoSafeChunks(text);
      textChunksRef.current = chunks;
      titlesRef.current = titles;

      // 첫 번째 제목 설정 (있다면)
      const firstTitleIndex = Object.keys(titles)
        .map(Number)
        .sort((a, b) => a - b)[0];
      if (firstTitleIndex !== undefined) {
        setCurrentTitle(titles[firstTitleIndex]);
      }
    }
  }, [text, isOpen]);

  // 자동 재생 설정
  useEffect(() => {
    if (isOpen) {
      // 0.5초 후에 자동 재생
      const timer = setTimeout(() => {
        handlePlay();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      } else if (e.key === ' ' && isOpen) {
        // Space to toggle play/pause
        if (isSpeaking) {
          handlePause();
        } else {
          handlePlay();
        }
        e.preventDefault();
      } else if (e.key === 'c' && isOpen) {
        // Toggle controls visibility
        setShowControls((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSpeaking]);

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

  // NoSleep 초기화
  useEffect(() => {
    noSleepRef.current = new NoSleep();
    return () => {
      if (noSleepRef.current) {
        noSleepRef.current.disable();
      }
    };
  }, []);

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
        // 완료 상태 설정 (특별한 값으로 설정)
        setCurrentChunkIndex(-2);
      } else {
        setCurrentChunkIndex(-1);
      }
      setIsSpeaking(false);
      setIsPaused(false);
      return;
    }

    // UI와 내부 상태 동기화 확실히 하기
    setCurrentChunkIndex(currentIndex);
    const chunk = chunks[currentIndex];
    setStatusMessage(`읽는 중`);

    // 현재 위치에 해당하는 제목이 있는지 확인하고 업데이트
    let currentSectionTitle = '';
    for (let i = currentIndex; i >= 0; i--) {
      if (titlesRef.current[i]) {
        setCurrentTitle(titlesRef.current[i]);
        currentSectionTitle = titlesRef.current[i];
        break;
      }
    }

    // 대괄호로 감싸진 제목인지 확인
    if (chunk.match(/^\[.*?\]/) || chunk.match(/^\[.*?\]$/)) {
      // 대괄호 내부 텍스트 추출 및 정규화 (앞뒤 공백 제거)
      const bracketContent = chunk.replace(/^\[|\]$/g, '').trim();
      console.log('대괄호 내부 텍스트:', bracketContent);

      // 정확히 4개의 특별 섹션만, 인덱스 시그니처 추가하여 타입 오류 해결
      const exactSpecialSections: { [key: string]: string } = {
        제목: '제목 입니다.',
        '핵심 내용': '핵심 내용 입니다.',
        '아이디어 맵': '아이디어 맵 입니다.',
        '주요 내용': '주요 내용 입니다.',
      };

      // 정확히 일치하는 섹션인지 확인
      let announcementText = exactSpecialSections[bracketContent];

      if (announcementText) {
        console.log('특별 섹션 정확히 일치:', bracketContent);

        // 안내문 읽기
        try {
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(announcementText);

          if (koreanVoiceRef.current) {
            utterance.voice = koreanVoiceRef.current;
            utterance.lang = 'ko-KR';
          }

          utterance.rate = currentRate;

          let onEndCalled = false;

          utterance.onend = () => {
            if (onEndCalled) return;
            onEndCalled = true;

            // 다음 청크로 진행 - 1초 지연 추가 (섹션 전환 느낌을 주기 위해)
            currentChunkRef.current = currentIndex + 1;
            setTimeout(() => {
              speakNextChunk(currentRate);
            }, 1000); // 1초 지연으로 변경
          };

          utterance.onerror = () => {
            if (onEndCalled) return;
            onEndCalled = true;

            // 오류 발생해도 다음으로 진행
            currentChunkRef.current = currentIndex + 1;
            setTimeout(() => {
              speakNextChunk(currentRate);
            }, 1000); // 1초 지연으로 변경
          };

          synth.speak(utterance);
        } catch (error) {
          console.error('특별 섹션 안내 발화 오류:', error);
          currentChunkRef.current = currentIndex + 1;
          setTimeout(() => {
            speakNextChunk(currentRate);
          }, 1000); // 1초 지연으로 변경
        }

        return;
      } else {
        // 정확히 일치하는 특별 섹션이 아니면 읽지 않고 다음 청크로 넘어감
        console.log('특별 섹션 아님, 건너뜀:', bracketContent);
        currentChunkRef.current = currentIndex + 1;
        setTimeout(() => {
          speakNextChunk(currentRate);
        }, 50);
        return;
      }
    }

    // 불릿 포인트 기호 제거 (•, ◦)
    let textToSpeak = chunk.replace(/[•◦]/g, '');

    try {
      const synth = window.speechSynthesis;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

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
      return { chunks: [], titles: {} };
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

    // 각 청크의 인덱스에 해당하는 제목을 기록하는 객체 생성
    const titles: { [key: number]: string } = {};

    // 대괄호로 감싸진 제목 찾기
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const titleMatch = chunk.match(/^\[(.*?)\]$/);

      if (titleMatch) {
        titles[i] = titleMatch[1]; // 대괄호 내부 텍스트만 저장
      }
    }

    return { chunks, titles };
  };

  // 재생 버튼 클릭 핸들러
  const handlePlay = () => {
    if (isSpeaking) return;

    // 화면 깨우기 활성화
    if (noSleepRef.current) {
      noSleepRef.current
        .enable()
        .then(() => console.log('NoSleep 활성화됨'))
        .catch((error) => console.error('NoSleep 활성화 오류:', error));
    }

    // 청크가 비어 있으면 초기화
    if (textChunksRef.current.length === 0) {
      const { chunks, titles } = splitTextIntoSafeChunks(text);
      textChunksRef.current = chunks;
      titlesRef.current = titles;
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

    // 화면 깨우기 비활성화
    if (noSleepRef.current) {
      noSleepRef.current.disable();
      console.log('NoSleep 비활성화됨');
    }
  };

  // 속도 변경 핸들러
  const handleRateChange = (newRate: number, rateName: string) => {
    // 이전 속도와 동일하면 작업 중단
    if (newRate === rate) return;

    // 상태 업데이트
    setRate(newRate);
    setSelectedRate(rateName);

    // localStorage에 속도 저장 - 다음에 앱을 열 때도 기억하기 위함
    localStorage.setItem('tts-rate', newRate.toString());

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

    // 화면 깨우기 비활성화
    if (noSleepRef.current) {
      noSleepRef.current.disable();
    }

    onClose();
  };

  // 컨트롤 토글 핸들러
  const toggleControls = () => {
    setShowControls((prev) => !prev);
  };

  // 현재 청크 렌더링
  const renderCurrentChunk = () => {
    // 완료 상태인 경우 완료 메시지 표시
    if (currentChunkIndex === -2) {
      return (
        <div
          className={`py-8 px-4 ${isMobile ? 'text-xl' : 'text-3xl'} text-emerald-400 text-center`}
        >
          읽기가 완료되었습니다
        </div>
      );
    }

    // 현재 청크 인덱스가 유효하지 않으면 재생 안내 메시지 보여주기
    if (currentChunkIndex < 0 || currentChunkIndex >= textChunksRef.current.length) {
      return (
        <div className={`text-center text-white ${isMobile ? 'text-xl' : 'text-3xl'} font-medium`}>
          {isSpeaking ? '재생 중...' : '재생 버튼을 눌러 시작하세요'}
        </div>
      );
    }

    const chunk = textChunksRef.current[currentChunkIndex];

    // 특수 섹션 체크 (제목 등)
    const isTitle = chunk.match(/^\[.*?\]/) && chunk.length < 20;

    // 대괄호로 감싸진 제목이면 표시하지 않음 (제목은 상단에 별도로 표시)
    if (isTitle) {
      return null;
    }

    // 불릿 포인트 기호 제거 (•, ◦)
    const processedChunk = chunk.replace(/[•◦]/g, '');

    return <div className={`py-8  ${isMobile ? 'text-xl' : 'text-3xl'}`}>{processedChunk}</div>;
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  // Use createPortal to render the cinematic view
  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center"
          onClick={toggleControls}
        >
          {/* 16:9 컨테이너 - 모바일에서는 높이 조정 */}
          <div
            ref={cinematicContainerRef}
            className={`w-full ${
              isMobile ? 'aspect-auto min-h-[60vh]' : 'max-w-6xl aspect-video'
            } bg-black relative border-t border-b border-gray-800 overflow-hidden flex items-center justify-center`}
            style={
              originalImage
                ? {
                    backgroundImage: `url(${originalImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    backgroundBlendMode: 'overlay',
                  }
                : {}
            }
          >
            {/* 제목 표시 부분 - 모바일에서는 크기 조정 */}
            {currentTitle && (
              <div
                className={`absolute inset-x-0 ${isMobile ? 'top-6' : 'top-12'} animate-fade-in`}
              >
                <div className="mx-auto max-w-3xl px-4">
                  <h2
                    className={`text-gray-100 font-bold ${
                      isMobile ? 'text-2xl p-2' : 'text-4xl p-4'
                    } text-center rounded-lg`}
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    }}
                  >
                    {currentTitle}
                  </h2>
                </div>
              </div>
            )}

            {/* 영화 자막 스타일의 텍스트 - 모바일에서는 위치 조정 */}
            <div
              className={`absolute inset-x-0 ${
                isMobile ? 'bottom-6' : 'bottom-12'
              } animate-fade-in`}
            >
              <div className={`mx-auto ${isMobile ? 'max-w-full px-2' : 'max-w-3xl px-4'}`}>
                {/* 반투명 배경 추가 + 텍스트 스타일 개선 */}
                <div
                  className="text-white font-bold leading-relaxed tracking-wide py-4 px-6 rounded-lg"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', // 반투명 검은색 배경
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)', // 약간의 그림자 효과
                    border: '1px solid rgba(255, 255, 255, 0.2)', // 미세한 테두리로 구분감 강화
                  }}
                >
                  {renderCurrentChunk()}
                </div>
              </div>
            </div>

            {/* 닫기 버튼 - 항상 표시 (모바일에서는 크기 축소) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className={`absolute rounded-full bg-gray-800 ${
                isMobile ? 'top-2 right-2' : 'top-4 right-4'
              } text-gray-100 hover:text-white focus:outline-none z-10 p-2`}
            >
              <X className={isMobile ? 'h-6 w-6' : 'h-8 w-8'} />
            </button>
          </div>

          {/* 컨트롤 패널 - 토글 가능 (모바일에서는 세로 배치) */}
          {showControls && (
            <div
              className={`bg-gray-900 bg-opacity-70 w-full ${
                isMobile ? 'max-w-full' : 'max-w-6xl'
              } p-4 flex ${isMobile ? 'flex-col' : 'flex-wrap'} gap-4 items-center justify-center`}
              onClick={(e) => e.stopPropagation()}
            >
              {!isSpeaking ? (
                <button
                  onClick={handlePlay}
                  disabled={!text.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 flex items-center"
                >
                  <PlayCircle className={`${isMobile ? 'h-5 w-5 mr-1' : 'h-6 w-6 mr-2'}`} />
                  재생
                </button>
              ) : (
                <div className={`flex ${isMobile ? 'w-full justify-center' : ''} gap-3`}>
                  <button
                    onClick={handlePause}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 flex items-center"
                  >
                    {isPaused ? (
                      <>
                        <PlayCircle className={`${isMobile ? 'h-5 w-5 mr-1' : 'h-6 w-6 mr-2'}`} />
                        계속
                      </>
                    ) : (
                      <>
                        <PauseCircle className={`${isMobile ? 'h-5 w-5 mr-1' : 'h-6 w-6 mr-2'}`} />
                        일시정지
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleStop}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                  >
                    <CircleStop className={`${isMobile ? 'h-5 w-5 mr-1' : 'h-6 w-6 mr-2'}`} />
                    정지
                  </button>
                </div>
              )}

              {/* 속도 조절 - 모바일에서는 너비 조정 */}
              <div className={`flex items-center ${isMobile ? 'w-full justify-center' : ''} gap-3`}>
                <span className="text-white">속도:</span>
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
                  className={`${
                    isMobile ? 'w-24' : 'w-32'
                  } h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500`}
                />
                <span className="text-emerald-400 font-medium min-w-[40px] text-center">
                  {rate.toFixed(1)}x
                </span>
              </div>

              {/* 진행상황 표시 */}
              <div className={`text-gray-300 text-sm ${isMobile ? 'w-full text-center' : ''}`}>
                {currentChunkIndex >= 0 && textChunksRef.current.length > 0
                  ? `${currentChunkIndex + 1} / ${textChunksRef.current.length}`
                  : statusMessage}
              </div>
            </div>
          )}
        </div>,
        document.body
      )
    : null;
}
