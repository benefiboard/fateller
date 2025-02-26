import { Metadata } from 'next';
import TextExtractor from './TextExtractor';

export const metadata: Metadata = {
  title: '텍스트 중요 내용 추출기',
  description: 'LLM API 비용 절감을 위한 텍스트 중요 내용 추출기',
};

export default function ExtractPage() {
  return (
    <main className="container mx-auto py-8">
      <TextExtractor />

      <footer className="mt-8 p-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} 텍스트 중요 내용 추출기 - LLM API 비용 절감 솔루션
      </footer>
    </main>
  );
}
