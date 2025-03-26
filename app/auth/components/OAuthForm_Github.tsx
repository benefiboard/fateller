'use client';

import { createBrowserClient } from '@supabase/ssr';
import React, { useCallback } from 'react';
import { FaGithub } from 'react-icons/fa';
import { Button } from '@/components/ui/button';

interface GithubButtonProps {
  referralCode?: string;
}

export default function GithubButton({ referralCode = '' }: GithubButtonProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const loginWithGithub = useCallback(async () => {
    // 추천인 코드가 있으면 쿠키에 저장
    if (referralCode) {
      document.cookie = `referral_code=${referralCode}; path=/; max-age=3600`; // 1시간 유효
    }

    await supabase.auth.signInWithOAuth({
      provider: 'github',
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
    <Button onClick={loginWithGithub} className="w-full flex gap-2 bg-emerald-800">
      <FaGithub size="1.6rem" fill="#eee" />
      Sign in with GitHub
    </Button>
  );
}
