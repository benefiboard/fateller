'use client';

import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 지연 로딩 유지
const SignInForm = dynamic(() => import('./SignInForm'), {
  loading: () => <p>Login is loading...</p>,
});
const RegisterForm = dynamic(() => import('./RegisterForm'), {
  loading: () => <p>SignUp is loading...</p>,
});
const GoogleButton = dynamic(() => import('./OAuthForm_Google'), {
  loading: () => <p>Google Login is loading...</p>,
});
const GithubButton = dynamic(() => import('./OAuthForm_Github'), {
  loading: () => <p>Github Login is loading...</p>,
});
const KakaoButton = dynamic(() => import('./OAuthForm_Kakao'), {
  loading: () => <p>Kakao Login is loading...</p>,
});

export function AuthForm() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; content: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');

  useEffect(() => {
    const success = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (success) {
      setMessage({ type: 'success', content: decodeURIComponent(success) });
    } else if (errorParam) {
      setMessage({ type: 'error', content: decodeURIComponent(errorParam) });
    }

    // URL에서 referralCode가 있으면 자동으로 채움
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  // 메모이제이션은 referralCode를 props로 전달하도록 수정
  const memoizedGoogleButton = useMemo(
    () => <GoogleButton referralCode={referralCode} />,
    [referralCode]
  );
  const memoizedGithubButton = useMemo(
    () => <GithubButton referralCode={referralCode} />,
    [referralCode]
  );
  const memoizedKakaoButton = useMemo(
    () => <KakaoButton referralCode={referralCode} />,
    [referralCode]
  );

  return (
    <div className="w-full space-y-6">
      {message && (
        <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
          <AlertTitle>{message.type === 'success' ? '성공' : '오류'}</AlertTitle>
          <AlertDescription>{message.content}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 추천인 코드 입력 필드 추가 */}
      <div className="space-y-2">
        <Label htmlFor="referralCode">추천인 코드 (선택사항)</Label>
        <Input
          id="referralCode"
          placeholder="추천인 코드를 입력하세요"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4">
        {memoizedKakaoButton}
        {memoizedGoogleButton}
        {memoizedGithubButton}
      </div>
    </div>
  );
}
