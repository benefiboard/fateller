// app/api/credits/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabse/server';
import { checkAndResetCredits } from '@/app/utils/serverCredits';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: '인증 필요' }, { status: 401 });
    }

    const userId = session.user.id;
    const { credits, lastReset } = await checkAndResetCredits(userId);

    return NextResponse.json({
      remaining: credits,
      lastReset,
    });
  } catch (error) {
    console.error('크레딧 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '크레딧 정보를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
