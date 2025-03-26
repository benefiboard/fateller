'use client';

import { createBrowserClient } from '@supabase/ssr';
import React, { useCallback } from 'react';
import { RiKakaoTalkFill } from 'react-icons/ri';

interface KakaoButtonInAppProps {
  referralCode?: string;
}

export default function KakaoButtonInApp({ referralCode = '' }: KakaoButtonInAppProps) {
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
    <div
      onClick={loginWithKakao}
      className="w-full h-16 flex gap-2 bg-yellow-400 text-gray-900 rounded-2xl items-center justify-center shadow-md"
    >
      <RiKakaoTalkFill size={32} fill="#111" />
      <p className="font-bold">카카오로 3초만에 시작하기</p>
    </div>
  );
}
