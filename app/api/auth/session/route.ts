//app/api/auth/session/route.ts

import { createSupabaseServerClient } from '@/lib/supabse/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();

  // CORS 헤더 추가
  const origin = request.headers.get('origin') || '';
  const response = NextResponse.json({ user: data.session?.user || null });

  if (origin.startsWith('chrome-extension://')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}
