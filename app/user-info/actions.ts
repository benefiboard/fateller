// app/user-info/actions.ts
'use server';

import { createSupabaseServerClient } from '@/lib/supabse/server';
import { SajuInformation, SaveSajuResponse } from '../dailytalk/types/user';

export async function saveSajuInformation(
  userId: string,
  sajuInfo: SajuInformation
): Promise<SaveSajuResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('userdata')
      .update({
        saju_information: {
          ...sajuInfo,
          location: 'seoul', // 기본값 설정
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
