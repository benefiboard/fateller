'use server';

import { createSupabaseServerClient } from '@/lib/supabse/server';
import { SajuInformation, SaveSajuResponse } from '../dailytalk/types/user';

export async function saveSajuInformation(
  userId: string,
  sajuInfo: SajuInformation
): Promise<SaveSajuResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    // 먼저 현재 사용자의 데이터를 조회
    const { data: currentUserData, error: fetchError } = await supabase
      .from('userdata')
      .select('saju_information')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // 기존 specialNumber 확인 또는 새로 생성
    let specialNumber: number;

    if (currentUserData?.saju_information?.specialNumber) {
      // 기존 specialNumber가 있으면 그대로 사용
      specialNumber = currentUserData.saju_information.specialNumber;
    } else {
      // 없으면 1~3 중 랜덤 생성
      specialNumber = Math.floor(Math.random() * 3) + 1;
    }

    // 업데이트 실행
    const { error } = await supabase
      .from('userdata')
      .update({
        saju_information: {
          ...sajuInfo,
          location: 'seoul',
          specialNumber: specialNumber,
        },
      })
      .eq('id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error saving saju information:', error);
    return {
      success: false,
      error: '사주 정보 저장 중 오류가 발생했습니다.',
    };
  }
}
