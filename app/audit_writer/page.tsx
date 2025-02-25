// app/audit_writer/page.tsx
'use client';

import { useState } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export default function AuditWriter() {
  const [isTraining, setIsTraining] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const startTraining = async () => {
    try {
      setIsTraining(true);
      const response = await fetch('/api/audit_writer/train', {
        method: 'POST',
      });
      const data = await response.json();
      setJobId(data.fineTune.id);
    } catch (error) {
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">데이비드 이글먼 스타일 AI 라이터</h1>
      <button
        onClick={startTraining}
        disabled={isTraining}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isTraining ? '학습 중...' : '모델 학습 시작'}
      </button>
      {jobId && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>학습 Job ID: {jobId}</p>
        </div>
      )}
    </div>
  );
}
