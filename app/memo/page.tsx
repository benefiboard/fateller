import { Brain } from 'lucide-react';
import { ThumbnailCard } from './ThumbnailCard';

interface ResearchData {
  title: string;
  subject: string;
  keywords: string[];
}

export default function MemoPage() {
  const researchData: ResearchData = {
    title: `씹는 횟수 증가,\n치매 위험 높인다`,
    subject: '씹는 횟수와 치매 위험의 상관관계',
    keywords: ['치매', '씹는 횟수', '노인', '연구', '알츠하이머병'],
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <ThumbnailCard
        title={researchData.title}
        subject={researchData.subject}
        bgColor="from-blue-900 to-blue-700"
        bgImage="/fortune/crystal/amethyst-cave.jpg"
      />
      <ThumbnailCard title={researchData.title} subject={researchData.subject} imageQuery="brain" />
      <ThumbnailCard
        title={researchData.title}
        subject={researchData.subject}
        bgColor="https://cdn.jhealthmedia.joins.com/news/photo/202005/21746_18960_0924.jpg"
        bgImage="https://cdn.jhealthmedia.joins.com/news/photo/202005/21746_18960_0924.jpg"
      />
      <ThumbnailCard
        title={researchData.title}
        subject={researchData.subject}
        bgColor="from-pink-200 to-red-50"
      />
    </div>
  );
}
