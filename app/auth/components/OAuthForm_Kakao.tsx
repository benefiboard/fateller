'use client';

import { createBrowserClient } from '@supabase/ssr';
import React, { useCallback } from 'react';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { Button } from '@/components/ui/button';

interface KakaoButtonProps {
  referralCode?: string;
}

export default function KakaoButton({ referralCode = '' }: KakaoButtonProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loginWithKakao = useCallback(async () => {
    // 추천인 코드가 있으면 쿠키에 저장
    if (referralCode) {
      document.cookie = `referral_code=${referralCode}; path=/; max-age=3600`; // 1시간 유효
    }

    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          // 추천인 코드가 있으면 쿼리 파라미터로도 전달
          ...(referralCode ? { ref_code: referralCode } : {}),
        },
      },
    });
  }, [supabase.auth, referralCode]);

  return (
    <Button onClick={loginWithKakao} className="w-full flex gap-2 bg-yellow-400 text-gray-600">
      <RiKakaoTalkFill size="24" fill="#333" />
      Sign in with Kakao
    </Button>
  );
}
