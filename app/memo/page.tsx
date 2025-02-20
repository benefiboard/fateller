import { Brain } from 'lucide-react';
import { ThumbnailCard } from './ThumbnailCard';
import ThumbnailCardAnimation from './ThumbnailCardAnimation';

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
      <ThumbnailCard
        title={researchData.title}
        subject={researchData.subject}
        imageQuery="dementia"
      />
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
      <ThumbnailCardAnimation
        title="씹는 횟수 증가, 치매 위험 높인다"
        subject="씹는 횟수와 치매 위험의 상관관계"
        keywords={['#치매', '#씹는 횟수', '#노인', '#연구', '#알츠하이머병']}
        keyPoints={[
          '밥 씹는 횟수가 늘어나면 치매 위험이 높아진다는 연구 결과가 나왔다.',
          '씹는 기능 저하가 치매 발생에 미치는 영향을 60세 이상 노인 5064명을 대상으로 8년간 추적 관찰하여 확인했다.',
          '씹는 횟수가 30회 이상인 남성은 10회 미만인 남성에 비해 치매 발생 위험이 2.9배 높았다.',
        ]}
        bgColor="from-gray-900 to-gray-600"
      />
    </div>
  );
}
