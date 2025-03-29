// app/(landing)/welcome-extension/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Brain, ArrowRight, Check, Chrome, Copy, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../../store/userStore';

export default function WelcomeExtension() {
  const router = useRouter();
  const { currentUser, isInitialized } = useUserStore();

  useEffect(() => {
    if (isInitialized && currentUser) {
      // 이미 로그인한 사용자는 메모 페이지로 리다이렉트
      router.push('/memo');
    }
  }, [currentUser, isInitialized, router]);

  return (
    <main className="flex min-h-screen flex-col bg-white tracking-tighter">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-10 bg-white shadow-sm py-4 md:py-6">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative h-12 w-12">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="Brain Labeling Logo"
                  fill
                  sizes="48px"
                  priority
                  className="object-cover"
                />
              </div>
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">
                Brain Labeling
              </span>
            </div>
            <div className="flex items-center space-x-4 md:space-x-6">
              <Link href="/blog" className="text-gray-800 font-semibold hover:text-gray-900">
                블로그
              </Link>
              {!currentUser && (
                <Link href="/auth" className="hidden sm:block text-gray-600 hover:text-gray-900">
                  로그인
                </Link>
              )}
              <Link
                href="/memo"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 확장 프로그램 설치 축하 섹션 */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-8 md:mb-12">
            <Chrome className="inline-block h-16 w-16 mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              BrainLabeling 익스텐션이 설치되었습니다!
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              웹 서핑 중 발견한 가치 있는 콘텐츠를 단 한 번의 클릭으로 저장하고 정리해 보세요.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center">
              <div className="relative h-16 w-16 mr-4">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="Brain Labeling Logo"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">Brain Labeling</h2>
                <p className="text-emerald-100">AI 기반 콘텐츠 정리 도우미</p>
              </div>
              <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
                설치됨
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 사용 방법 간단 안내 */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">익스텐션 사용 방법</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Brain Labeling 익스텐션으로 웹 콘텐츠를 저장하는 세 가지 쉬운 방법
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* 방법 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-emerald-100">
              <div className="aspect-video bg-emerald-50 flex items-center justify-center">
                <Chrome className="h-16 w-16 text-emerald-600" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3 text-emerald-700">
                  1. 익스텐션 아이콘 클릭
                </h3>
                <p className="text-gray-600">
                  브라우저 상단의 BrainLabeling 아이콘을 클릭하여 현재 페이지 저장
                </p>
              </div>
            </div>

            {/* 방법 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-emerald-100">
              <div className="aspect-video bg-emerald-50 flex items-center justify-center">
                <Copy className="h-16 w-16 text-emerald-600" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3 text-emerald-700">2. 우클릭 메뉴 사용</h3>
                <p className="text-gray-600">
                  페이지에서 우클릭하여 "BrainLabeling 저장" 메뉴 선택
                </p>
              </div>
            </div>

            {/* 방법 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md border border-emerald-100">
              <div className="aspect-video bg-emerald-50 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-emerald-600" />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3 text-emerald-700">3. 직접 입력 사용</h3>
                <p className="text-gray-600">아이콘 클릭 후 나오는 팝업에서 저장하기 누르기</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 익스텐션 특징 소개 */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            익스텐션의 특별한 기능
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
            BrainLabeling 익스텐션이 제공하는 강력한 기능들
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* 기능 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex">
              <div className="mr-4 flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-emerald-700">원클릭 콘텐츠 저장</h3>
                <p className="text-gray-600">
                  복잡한 과정 없이 한 번의 클릭만으로 웹페이지 내용을 자동 추출하고 저장합니다.
                </p>
              </div>
            </div>

            {/* 기능 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex">
              <div className="mr-4 flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-emerald-700">AI 자동 정리</h3>
                <p className="text-gray-600">
                  AI가 자동으로 콘텐츠를 분석하고 키워드, 카테고리, 요약을 생성합니다.
                </p>
              </div>
            </div>

            {/* 기능 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex">
              <div className="mr-4 flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-emerald-700">목적별 최적화</h3>
                <p className="text-gray-600">
                  일반, 업무, 개인, 학습 등 다양한 목적에 맞게 콘텐츠 저장 방식을 선택할 수
                  있습니다.
                </p>
              </div>
            </div>

            {/* 기능 4 */}
            <div className="bg-white p-6 rounded-xl shadow-md flex">
              <div className="mr-4 flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 text-emerald-700">크롬 통합</h3>
                <p className="text-gray-600">
                  브라우저와 완벽하게 통합되어 웹 서핑 중에도 끊김 없이 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 사용 예시 및 시연 */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">실제 사용 예시</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
            익스텐션으로 콘텐츠를 저장하고 정리하는 과정을 살펴보세요
          </p>

          <div className="bg-white rounded-xl overflow-hidden shadow-lg max-w-4xl mx-auto border-2 border-emerald-100">
            <div className="aspect-video relative bg-gray-200">
              <Image
                src="/landing/3-1.webp"
                alt="익스텐션 사용 예시"
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
              {/* 이미지 위에 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6">
                  <div className="inline-block bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-2">
                    쉬운 저장
                  </div>
                  <h3 className="text-white text-xl font-semibold">
                    원클릭으로 웹 콘텐츠 저장하기
                  </h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-emerald-600 font-bold">1</span>
                </div>
                <p className="text-gray-700">브라우저에서 저장하고 싶은 페이지를 열고</p>
              </div>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-emerald-600 font-bold">2</span>
                </div>
                <p className="text-gray-700">툴바의 BrainLabeling 아이콘을 클릭하세요</p>
              </div>
              <div className="flex items-center">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-emerald-600 font-bold">3</span>
                </div>
                <p className="text-gray-700">AI가 자동으로 콘텐츠를 분석하고 정리합니다</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 시작하기 및 계정 로그인 안내 */}
      <section className="py-16 md:py-20 bg-emerald-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">이제 바로 시작하세요</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            최고의 경험을 위해 Brain Labeling 계정으로 로그인하고 매일 무료 크레딧으로 서비스를
            이용하세요.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link href="/auth">
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-lg font-medium inline-flex items-center justify-center text-lg">
                로그인하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <Link href="/memo">
              <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 rounded-lg font-medium inline-flex items-center justify-center text-lg">
                메모 페이지로 이동
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            로그인하면 모든 기기에서 저장한 컨텐츠에 접근할 수 있습니다
          </p>
        </div>
      </section>

      {/* 크레딧 시스템 안내 */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="bg-emerald-50 rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-emerald-700 mb-4">무료 크레딧 안내</h3>
            <p className="text-gray-600 mb-4">
              Brain Labeling은 매일 10개의 무료 크레딧을 제공합니다. 하나의 콘텐츠를 저장할 때 1개의
              크레딧이 사용됩니다.
            </p>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">
                크레딧은 매일 자정에 10개로 초기화됩니다. 무료 계정으로도 충분히 서비스를 활용해
                보세요!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="relative h-10 w-10">
              <Image
                src="/icons/icon-192x192.png"
                alt="Brain Labeling 로고"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <span className="ml-3 text-xl font-bold text-white">Brain Labeling</span>
          </div>
          <p className="mb-6 max-w-2xl mx-auto text-lg">
            AI 기반의 메모 정리 서비스로 콘텐츠 과잉 시대의 지식 관리 문제를 해결합니다.
          </p>
          <div className="flex justify-center space-x-4 md:space-x-8 mb-6">
            contact : benefoboard@gmail.com
          </div>
          <p>© 2025 Brain Labeling. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
