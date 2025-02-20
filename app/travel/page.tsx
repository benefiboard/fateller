'use client';

import { useState } from 'react';

export default function Home() {
  const [userInput, setUserInput] = useState('');
  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponses([]);
    setCurrentStep(0);

    try {
      const response = await fetch('/api/travel-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput }),
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            setResponses((prev) => {
              const newResponses = [...prev];
              newResponses[data.step] = data.response;
              return newResponses;
            });
            setCurrentStep(data.step + 1);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setCurrentStep(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">여행 계획 도우미</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="여행 취향을 입력해주세요..."
          className="w-full p-4 border rounded-lg mb-4 h-32"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg"
        >
          {loading ? '계획 생성 중...' : '여행 계획 생성'}
        </button>
      </form>

      {responses.map((response, index) => (
        <div key={index} className="mb-6 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bold">단계 {index + 1}</h2>
            {currentStep === index && (
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            )}
          </div>
          <div className="whitespace-pre-wrap">{response}</div>
        </div>
      ))}
    </div>
  );
}
