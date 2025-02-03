// app/dailytalk/page.tsx
import { DailyTalkClient } from './components/DailyTalkMainClient';
import { FileWarning } from 'lucide-react';
import { getUser } from '@/lib/supabse/server';
import { cookies } from 'next/headers';

export default async function DailyTalkPage() {
  const currentUser = await getUser();
  const cookieStore = cookies();

  // 서버에서 초기 데이터 확인
  let initialData = {
    hasSajuData: false,
    hasMbtiData: false,
  };

  if (currentUser) {
    initialData = {
      hasSajuData: currentUser.saju_information != null,
      hasMbtiData: currentUser.mbti_information != null,
    };
  }

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gradient-brand">오늘의 운세</h1>
        <p className="text-sm text-gray-500">
          AI가 그리는 당신의 특별한 하루
          <br />
          누가 말해줄까요?
        </p>
      </div>
      <DailyTalkClient userBasicData={currentUser} />
    </div>
  );
}
