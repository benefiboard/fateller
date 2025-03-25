'use client';

import { useState, useEffect, useRef } from 'react';

export default function TTSPage() {
  const [text, setText] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const koreanVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const cancelSpeechRef = useRef<boolean>(false);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef<number>(0);

  // Load available voices and find Korean voice
  useEffect(() => {
    const loadVoices = () => {
      try {
        const synth = window.speechSynthesis;
        const voices = synth.getVoices();

        console.log(
          'Available voices:',
          voices.map((v) => v.name)
        );

        // Try to find Microsoft Heami first
        let koreanVoice = voices.find(
          (v) =>
            v.name.includes('Google') &&
            (v.name.includes('한국의') || v.name.includes('KR') || v.name.includes('헤미')) &&
            v.lang.includes('ko')
        );
        // let koreanVoice = voices.find(
        //   (v) =>
        //     v.name.includes('Microsoft') &&
        //     (v.name.includes('Heami') || v.name.includes('Haemi') || v.name.includes('헤미')) &&
        //     v.lang.includes('ko')
        // );

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

    // Add cleanup for page unload
    const handleBeforeUnload = () => {
      window.speechSynthesis?.cancel();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Safely split text into smaller chunks
  const splitTextIntoSafeChunks = (text: string) => {
    // Try to split at natural boundaries first
    const splitByLines = text.split(/\n+/);
    const chunks: string[] = [];

    for (const line of splitByLines) {
      // Skip empty lines
      if (!line.trim()) continue;

      // If line is very short, add directly
      if (line.length <= 15) {
        chunks.push(line);
        continue;
      }

      // Try to split by sentences
      const sentences = line.match(/[^.!?]+[.!?]+/g);
      if (sentences && sentences.length > 0) {
        for (const sentence of sentences) {
          if (sentence.length <= 30) {
            chunks.push(sentence.trim());
          } else {
            // Split long sentences by commas or other breaks
            const parts = sentence.split(/[,;:]/);
            for (const part of parts) {
              if (part.trim()) {
                chunks.push(part.trim());
              }
            }
          }
        }
      } else {
        // No sentence breaks, split by length
        if (line.length <= 30) {
          chunks.push(line);
        } else {
          // Split by words, roughly 20 characters per chunk
          let currentChunk = '';
          const words = line.split(/\s+/);

          for (const word of words) {
            if ((currentChunk + ' ' + word).length > 20) {
              if (currentChunk) chunks.push(currentChunk);
              currentChunk = word;
            } else {
              currentChunk += (currentChunk ? ' ' : '') + word;
            }
          }

          if (currentChunk) chunks.push(currentChunk);
        }
      }
    }

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

        // Small delay between chunks for better flow
        if (i < chunks.length - 1 && !cancelSpeechRef.current) {
          await new Promise((resolve) => setTimeout(resolve, 250));
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

  // Safety measure: when component unmounts, cancel speech
  useEffect(() => {
    return () => {
      cancelSpeechRef.current = true;
      window.speechSynthesis?.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">텍스트 음성 변환</h1>

          <div className="mb-4">
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
              읽을 텍스트
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="여기에 텍스트를 입력하세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={5}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {!isSpeaking && (
              <button
                onClick={speak}
                disabled={!text.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
                      clipRule="evenodd"
                    />
                  </svg>
                  재생
                </span>
              </button>
            )}

            {isSpeaking && (
              <>
                <button
                  onClick={togglePause}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <span className="flex items-center">
                    {isPaused ? (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                        계속
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                        clipRule="evenodd"
                      />
                    </svg>
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
    </div>
  );
}
