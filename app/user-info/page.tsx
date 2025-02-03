// app/user-info/page.tsx
import { getUser } from '@/lib/supabse/server';
import { UserInfoForm } from './UserInfoForm';

export default async function UserInfoPage() {
  const currentUser = await getUser();

  if (!currentUser?.id) {
    // 로그인되지 않은 경우의 처리
    return (
      <div className="min-h-screen p-4 space-y-6">
        <div className="text-center">
          <p>로그인이 필요한 서비스입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gradient-brand">사주 정보 입력</h1>
        <p className="text-sm text-gray-500">
          정확한 운세를 위해
          <br />
          태어난 시간 정보를 입력해주세요
        </p>
      </div>
      <UserInfoForm userId={currentUser.id} />
    </div>
  );
}
