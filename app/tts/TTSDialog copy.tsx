//app/tts/TTSDialog.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Volume2, PauseCircle, PlayCircle, CircleStop } from 'lucide-react';

interface TTSDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
}

export default function TTSDialog({ isOpen, onClose, initialText = '' }: TTSDialogProps) {
  const [text, setText] = useState<string>(initialText);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const koreanVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const cancelSpeechRef = useRef<boolean>(false);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef<number>(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Set initial text when it changes
  useEffect(() => {
    if (initialText) {
      setText(initialText);
    }
  }, [initialText]);

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

  // Load available voices and find Korean voice
  useEffect(() => {
    if (!isOpen) return;

    const loadVoices = () => {
      try {
        const synth = window.speechSynthesis;
        const voices = synth.getVoices();

        console.log(
          'Available voices:',
          voices.map((v) => v.name)
        );

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
      cancelSpeechRef.current = true;
      window.speechSynthesis?.cancel();
    };
  }, [isOpen]);

  // Safely split text into smaller chunks with improved handling for numbered lists
  const splitTextIntoSafeChunks = (text: string) => {
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
      .replace(/^(\d+)\.\s+/gm, '$1, ')
      .replace(/\n(\d+)\.\s+/gm, '\n$1, ')
      .replace(/•/g, ' • ');

    // 줄 단위로 분할
    const lines = text.split(/\n/);
    const chunks: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 빈 줄 건너뛰기
      if (!line) continue;

      // 구분선은 "구분선"이라는 텍스트로 대체 (읽기 쉽게)
      if (line.match(/^---+$/)) {
        chunks.push('구분선');
        continue;
      }

      // 짧은 줄은 바로 추가
      if (line.length <= 20) {
        chunks.push(line);
        continue;
      }

      // 리스트 항목(숫자나 불릿으로 시작)인지 확인
      const isListItem = line.match(/^\s*(첫째,|둘째,|셋째,|넷째,|다섯째,|\d+,|•)/);

      // 리스트 항목은 문장 단위로 분할하지 않고 전체로 처리
      if (isListItem) {
        // 리스트 항목이 길다면 콤마 등으로 분할
        if (line.length > 50) {
          const parts = line.split(/(?<=[,;:])\s+/);
          let currentChunk = '';

          for (const part of parts) {
            if ((currentChunk + part).length > 50) {
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
          if (trimmedSentence.length <= 40) {
            chunks.push(trimmedSentence);
          } else {
            // 긴 문장은 구두점으로 나누기
            const parts = trimmedSentence.split(/(?<=[,;:])\s+/);
            let currentChunk = '';

            for (const part of parts) {
              if ((currentChunk + part).length > 40) {
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
        if (line.length <= 40) {
          chunks.push(line);
        } else {
          // 단어 단위로 분할
          const words = line.split(/\s+/);
          let currentChunk = '';

          for (const word of words) {
            if ((currentChunk + ' ' + word).length > 40) {
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

    // 로그로 분할된 청크 확인
    console.log('Chunks:', chunks);

    return chunks;
  };

  // Function to speak a single chunk with promise
  const speakChunk = (text: string) => {
    return new Promise<void>((resolve, reject) => {
      try {
        if (!text.trim() || cancelSpeechRef.current) {
          resolve();
          return;
        }

        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);

        // Set Korean voice if available
        if (koreanVoiceRef.current) {
          utterance.voice = koreanVoiceRef.current;
          utterance.lang = 'ko-KR';
        }

        // Set event handlers
        utterance.onend = () => {
          resolve();
        };

        utterance.onerror = (event) => {
          console.warn(`Error speaking: "${text}"`, event);
          // Don't reject, just resolve to continue with next chunk
          resolve();
        };

        synth.speak(utterance);
      } catch (error) {
        console.error('Error in speakChunk:', error);
        // Don't reject, just resolve to continue
        resolve();
      }
    });
  };

  // Main function to speak text in chunks
  const speakAllChunks = async () => {
    const chunks = textChunksRef.current;

    if (!chunks.length) {
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    cancelSpeechRef.current = false;

    try {
      for (let i = currentChunkRef.current; i < chunks.length; i++) {
        // If we've been asked to stop, break the loop
        if (cancelSpeechRef.current) {
          break;
        }

        currentChunkRef.current = i;

        // Update status with current chunk info
        setStatusMessage(`읽는 중: ${i + 1}/${chunks.length}`);

        // Speak the current chunk
        await speakChunk(chunks[i]);

        // Small delay between chunks for better flow, longer delay after periods
        if (i < chunks.length - 1 && !cancelSpeechRef.current) {
          const endsWithPeriod = chunks[i].trim().match(/[.!?]$/);
          const nextChunkStartsWithNumber = chunks[i + 1]
            .trim()
            .match(/^(첫째,|둘째,|셋째,|넷째,|다섯째,|\d+,)/);

          // 문장 끝이나 숫자로 시작하는 다음 항목이면 더 긴 지연
          const delayTime = endsWithPeriod || nextChunkStartsWithNumber ? 20 : 5;
          await new Promise((resolve) => setTimeout(resolve, delayTime));
        }
      }
    } catch (error) {
      console.error('Error in speakAllChunks:', error);
    } finally {
      if (!cancelSpeechRef.current) {
        setStatusMessage('읽기 완료');
      }
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  // Start speaking
  const speak = () => {
    if (!text.trim() || isSpeaking) return;

    // Always cancel any ongoing speech
    const synth = window.speechSynthesis;
    synth.cancel();

    // Split text into manageable chunks and start speaking
    textChunksRef.current = splitTextIntoSafeChunks(text);
    currentChunkRef.current = 0;
    console.log(`Speaking ${textChunksRef.current.length} chunks`);

    speakAllChunks();
  };

  // Pause or resume speech
  const togglePause = () => {
    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setStatusMessage('다시 시작');
    } else {
      synth.pause();
      setIsPaused(true);
      setStatusMessage('일시 정지됨');
    }
  };

  // Stop speech completely
  const stop = () => {
    cancelSpeechRef.current = true;
    const synth = window.speechSynthesis;
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setStatusMessage('정지됨');

    // Forcibly cancel again after a small delay as a safety measure
    setTimeout(() => {
      synth.cancel();
    }, 100);
  };

  // Handle dialog close
  const handleClose = () => {
    // Stop any speech first
    if (isSpeaking) {
      stop();
    }
    onClose();
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  // Use createPortal to render dialog outside of parent component's DOM hierarchy
  return typeof document !== 'undefined'
    ? ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 isolate"
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
                <h2 className="text-2xl font-bold text-gray-800">텍스트 음성 변환</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="text-input"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  읽을 텍스트
                </label>
                <textarea
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="여기에 텍스트를 입력하세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  rows={5}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {!isSpeaking && (
                  <button
                    onClick={speak}
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
                      onClick={togglePause}
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
                      onClick={stop}
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
