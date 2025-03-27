import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type CookieOptions, createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // 추천인 코드 가져오기 (쿼리 파라미터 또는 쿠키에서)
  const refCode = searchParams.get('ref_code');

  if (code) {
    const cookieStore = cookies();

    // 쿠키에서 추천인 코드 확인 (쿼리 파라미터에 없을 경우)
    const cookieRefCode = cookieStore.get('referral_code')?.value || '';
    const referralCode = refCode || cookieRefCode;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.session) {
      // 세션 데이터를 쿠키에 저장 - sameSite 속성 추가
      cookieStore.set('access_token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: data.session.expires_in,
        path: '/',
        sameSite: 'lax', // 추가: 익스텐션에서 접근 가능하도록
      });

      // userdata 테이블의 사용자 정보 확인
      const { data: existingUser, error: selectError } = await supabase
        .from('userdata')
        .select('id, user_type')
        .eq('id', data.session.user.id)
        .single();

      let userType = 'regular'; // 기본값

      // 기존 사용자의 user_type 가져오기 (있는 경우)
      if (!selectError && existingUser && existingUser.user_type) {
        userType = existingUser.user_type; // 기존 등급 유지
      }

      // 추천인 코드 처리
      if (referralCode) {
        // 코드 유효성 검증
        const { data: codeData, error: codeError } = await supabase
          .from('referral_codes')
          .select('tier, current_uses, max_uses')
          .eq('code', referralCode)
          .single();

        if (!codeError && codeData) {
          // 유효한 코드인 경우
          if (codeData.max_uses === null || codeData.current_uses < codeData.max_uses) {
            userType = codeData.tier; // 코드에 해당하는 등급으로 설정

            // 사용 기록 및 카운트 증가
            await supabase.from('referral_usage').insert({
              code: referralCode,
              user_id: data.session.user.id,
              used_at: new Date().toISOString(),
            });

            await supabase
              .from('referral_codes')
              .update({ current_uses: codeData.current_uses + 1 })
              .eq('code', referralCode);
          }
        }
        // 유효하지 않은 코드는 무시 (기존 userType 유지)
      }

      // 사용자 정보 구성
      const userData = {
        id: data.session.user.id,
        email: data.session.user.email,
        username:
          data.session.user.user_metadata.full_name || data.session.user.email?.split('@')[0],
        user_type: userType, // 결정된 user_type
        avatar_url: data.session.user.user_metadata.avatar_url,
        // 추가 필드가 있다면 여기에 포함시키세요
      };

      // 사용자 데이터 저장
      let upsertError;
      if (existingUser) {
        // 사용자가 이미 존재하면 업데이트
        const { error } = await supabase
          .from('userdata')
          .update(userData)
          .eq('id', data.session.user.id);
        upsertError = error;
      } else {
        // 사용자가 존재하지 않으면 삽입
        const { error } = await supabase.from('userdata').insert(userData);
        upsertError = error;

        // 신규 사용자는 user_credits 테이블에도 초기화
        if (!error) {
          await supabase.rpc('maybe_reset_credits', { uid: data.session.user.id });
        }
      }

      if (upsertError) {
        console.error('Error upserting user data:', upsertError);
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      // 사용자 데이터를 쿠키에 저장 - sameSite 속성 추가
      cookieStore.set('currentUser', JSON.stringify(userData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'lax', // 추가: 익스텐션에서 접근 가능하도록
      });

      // 추천인 코드 쿠키 삭제 (처리 완료)
      if (cookieRefCode) {
        cookieStore.delete('referral_code');
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
