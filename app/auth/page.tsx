import React from 'react';
import Image from 'next/image';
import { AuthForm } from './components/AuthForm';
import SignOut from './components/SignOut';
import { getUser } from '@/lib/supabse/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ClientButton from './components/ClientButton';

export default async function AuthPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const currentUser = await getUser();

  // 익스텐션에서 왔는지 확인
  const isFromExtension = searchParams.redirect === 'extension';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto ">
        {/* 로고 */}
        <div className="flex justify-center">
          <Link href="/memo">
            <div className="relative w-48 h-48 ">
              <Image
                src="/icons/icon-512x512.png"
                alt="Brainlabeling-logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Link>
        </div>

        {currentUser && (
          <div className="w-full flex justify-center mt-4 mb-6">
            <Link href="/memo" className="w-full ">
              <Button
                size="lg"
                className="w-full flex items-center text-xl py-8 bg-emerald-800 shadow-lg hover:bg-emerald-700 transition-colors"
              >
                <p>▶ 메인페이지로 이동</p>
              </Button>
            </Link>
          </div>
        )}

        {/* 메인 컨텐츠 */}
        {currentUser ? (
          <div className="flex flex-col items-center gap-6">
            {/* 이미 로그인된 상태 - 익스텐션용 메시지 표시 */}
            {isFromExtension && (
              <Card className="border-emerald-100 mb-4">
                <CardContent className="p-4 text-center">
                  <p className="text-emerald-700 font-medium">
                    이미 로그인되어 있습니다. 이제 익스텐션을 사용할 수 있습니다.
                  </p>
                  {/* Client Component 사용 */}
                  <ClientButton className="mt-3 bg-emerald-600">이 창 닫기</ClientButton>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <>
            <Card className="border-brand-100">
              <CardContent className="pt-8 pb-6">
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-2xl font-bold text-gradient-brand">환영합니다</h1>
                  {isFromExtension && (
                    <p className="text-sm text-emerald-600 font-medium">
                      익스텐션을 사용하려면 로그인해주세요
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    당신만의 특별한 공간으로
                    <br />
                    초대합니다
                  </p>
                </div>
                <AuthForm />
              </CardContent>
            </Card>
          </>
        )}

        {/* 로그아웃 버튼 */}
        <div className="flex justify-start mt-4">
          <SignOut />
        </div>
      </div>
    </div>
  );
}
