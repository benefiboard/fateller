// app/dailytalk/actions.ts
'use server';

import { createSupabaseServerClient } from '@/lib/supabse/server';
import { FortuneResultType } from './data/types';

export async function checkExistingFortune(userId: string | null) {
  // 로그인하지 않은 경우 null 반환
  if (!userId) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const today = new Date()
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('.')
    .slice(0, -1)
    .join('-')
    .replace(/ /g, '');

  const { data, error } = await supabase
    .from('daily_talk')
    .select('daily_fortune')
    .eq('user_id', userId)
    .eq('today', today)
    .single();

  if (error) return null;
  return data?.daily_fortune;
}

export async function saveDailyFortune(userId: string | null, fortune: FortuneResultType) {
  // 개발자 모드나 로그인하지 않은 경우 저장하지 않음
  if (!userId || userId === 'dev') {
    return {
      success: true,
      isLocalStorage: true,
      data: fortune,
    };
  }

  const supabase = await createSupabaseServerClient();
  const today = new Date()
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .split('.')
    .slice(0, -1)
    .join('-')
    .replace(/ /g, '');

  try {
    const { error } = await supabase.from('daily_talk').insert([
      {
        user_id: userId,
        daily_fortune: fortune,
        today: today,
      },
    ]);

    if (error) throw error;
    return {
      success: true,
      isLocalStorage: false,
      data: fortune,
    };
  } catch (error) {
    console.error('Save error:', error);
    return {
      success: false,
      isLocalStorage: false,
      data: null,
    };
  }
}
