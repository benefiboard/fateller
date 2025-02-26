'use client';

import { useState } from 'react';

export default function TextExtractor() {
  const [originalText, setOriginalText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    originalLength: number;
    extractedLength: number;
    reductionRate: number;
    detectedLanguage: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [extractionRate, setExtractionRate] = useState(0.3);

  const handleExtract = async () => {
    if (!originalText.trim()) {
      setError('텍스트를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: originalText,
          extractionRate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '텍스트 처리 중 오류가 발생했습니다.');
      }

      setExtractedText(data.extractedText);
      setStats({
        originalLength: data.originalLength,
        extractedLength: data.extractedLength,
        reductionRate: data.reductionRate,
        detectedLanguage: data.detectedLanguage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToLLM = async () => {
    // 여기에 LLM API 호출 구현
    alert('이 부분은 2차 처리를 위한 LLM API 호출 부분입니다.');
  };

  // 언어 이름을 사용자 친화적으로 변환
  const getLanguageName = (lang: string) => {
    switch (lang) {
      case 'korean':
        return '한국어';
      case 'english':
        return '영어';
      case 'mixed':
        return '혼합 (한국어 + 영어)';
      default:
        return '알 수 없음';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">텍스트 중요 내용 추출기</h1>
      <p className="mb-4 text-gray-600">
        한국어와 영어 텍스트를 자동으로 감지하여 중요 내용을 추출합니다.
      </p>

      <div className="mb-4">
        <label className="block mb-2">
          추출 비율: {(extractionRate * 100).toFixed(0)}%
          <input
            type="range"
            min="0.1"
            max="0.5"
            step="0.05"
            value={extractionRate}
            onChange={(e) => setExtractionRate(parseFloat(e.target.value))}
            className="w-full mt-1"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2 font-medium">원본 텍스트</label>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="여기에 원본 텍스트를 입력하세요... (한국어 또는 영어)"
            className="w-full h-96 p-2 border rounded resize-none"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">추출된 중요 내용</label>
          <textarea
            value={extractedText}
            readOnly
            placeholder="중요 내용이 여기에 표시됩니다..."
            className="w-full h-96 p-2 border rounded resize-none bg-gray-50"
          />
        </div>
      </div>

      {error && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {stats && (
        <div className="mt-4 p-3 bg-blue-50 rounded">
          <h3 className="font-medium">통계:</h3>
          <ul className="mt-1 space-y-1">
            <li>
              감지된 언어:{' '}
              <span className="font-medium">{getLanguageName(stats.detectedLanguage)}</span>
            </li>
            <li>원본 길이: {stats.originalLength.toLocaleString()} 자</li>
            <li>추출 길이: {stats.extractedLength.toLocaleString()} 자</li>
            <li>축소율: {stats.reductionRate.toFixed(1)}%</li>
            <li>API 비용 절감 추정: 약 {stats.reductionRate.toFixed(0)}%</li>
          </ul>
        </div>
      )}

      <div className="mt-4 space-x-4">
        <button
          onClick={handleExtract}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? '처리 중...' : '중요 내용 추출 (1차)'}
        </button>

        <button
          onClick={handleSendToLLM}
          disabled={!extractedText || loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
        >
          LLM API로 전송 (2차)
        </button>
      </div>
    </div>
  );
}
