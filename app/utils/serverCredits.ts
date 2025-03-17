// app/utils/serverCredits.ts
import { createSupabaseServerClient } from '@/lib/supabse/server';

// 크레딧 확인 및 필요시 리셋 (매일 첫 접속 시 리셋)
export async function checkAndResetCredits(userId: string) {
  const supabase = await createSupabaseServerClient();

  // SQL 함수를 호출하여 필요시 크레딧 리셋
  await supabase.rpc('maybe_reset_credits', { uid: userId });

  // 최신 크레딧 정보 가져오기
  const { data, error } = await supabase
    .from('user_credits')
    .select('credits_remaining, last_reset_date')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('크레딧 확인 오류:', error);
    return { credits: 0, lastReset: new Date().toISOString().split('T')[0] };
  }

  return {
    credits: data.credits_remaining,
    lastReset: data.last_reset_date,
  };
}

// 크레딧 차감 - Supabase.sql 대신 수정된 버전
export async function useCredits(userId: string, amount: number) {
  const supabase = await createSupabaseServerClient();

  // 1. 현재 크레딧 정보 가져오기
  const { data: currentData, error: fetchError } = await supabase
    .from('user_credits')
    .select('credits_remaining')
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    console.error('크레딧 정보 가져오기 오류:', fetchError);
    return false;
  }

  // 충분한 크레딧이 있는지 확인
  if (currentData.credits_remaining < amount) {
    console.error('크레딧 부족:', currentData.credits_remaining, '필요:', amount);
    return false;
  }

  // 2. 크레딧 차감하여 업데이트
  const newCreditsRemaining = currentData.credits_remaining - amount;

  const { data, error } = await supabase
    .from('user_credits')
    .update({ credits_remaining: newCreditsRemaining })
    .eq('user_id', userId)
    .select('credits_remaining')
    .single();

  if (error) {
    console.error('크레딧 차감 오류:', error);
    return false;
  }

  return true; // 차감 성공
}

// 텍스트 길이에 따른 필요 크레딧 계산
export function calculateRequiredCredits(textLength: number): number {
  return Math.max(1, Math.ceil(textLength / 10000));
}

// 크레딧 환불 (새로 추가)
export async function refundCredits(userId: string, amount: number) {
  const supabase = await createSupabaseServerClient();

  // 1. 현재 크레딧 정보 가져오기
  const { data: currentData, error: fetchError } = await supabase
    .from('user_credits')
    .select('credits_remaining')
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    console.error('크레딧 정보 가져오기 오류:', fetchError);
    return false;
  }

  // 2. 크레딧 환불하여 업데이트
  const newCreditsRemaining = currentData.credits_remaining + amount;

  const { data, error } = await supabase
    .from('user_credits')
    .update({ credits_remaining: newCreditsRemaining })
    .eq('user_id', userId)
    .select('credits_remaining')
    .single();

  if (error) {
    console.error('크레딧 환불 오류:', error);
    return false;
  }

  return true; // 환불 성공
}
