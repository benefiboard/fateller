// app/(landing)/introduce/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Brain, ArrowRight, Check, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';

export default function LandingAuthUserPage() {
  const router = useRouter();
  const { currentUser, isInitialized } = useUserStore();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-10 bg-white shadow-sm py-4 md:py-6">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/icons/icon-192x192.png" alt="" className="object-cover h-12 w-12" />
              <span className="ml-2 text-xl font-bold text-gray-900">Brain Labeling</span>
            </div>
            <div className="flex items-center space-x-4 md:space-x-6">
              {!currentUser && (
                <Link href="/auth" className="text-gray-600 hover:text-gray-900">
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

      {/* 히어로 섹션 - 고객 중심 메시지로 개선 */}
      <section className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-emerald-600 block sm:inline mb-2 sm:mb-0">
                콘텐츠 정리의 부담,
              </span>
              <span> 이제 벗어나세요</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              복잡한 웹 콘텐츠, 유튜브 영상, 외국어 자료가 자동으로 정리되어 시간과 에너지를
              아껴드립니다
            </p>
            <Link href="/memo">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center text-lg">
                1분만에 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">무료 크레딧 10개로 바로 체험하세요</p>
          </div>

          {/* 대형 히어로 이미지/애니메이션 */}
          <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-[16/9] w-full bg-gray-200 relative">
              <img src="/landing/main.webp" alt="" className="object-cover w-full h-full" />
              {/* 이미지 위에 오버레이 텍스트 추가 - 고객 중심 메시지 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white text-lg md:text-xl font-medium">
                  "하루에 읽는 콘텐츠 중 정말 가치 있는 것은 몇 개인가요?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 문제 시각화 섹션 */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            <span className="inline-block">당신의 콘텐츠 소비에</span>{' '}
            <span className="inline-block">어떤 문제가 있나요?</span>
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
            매일 쏟아지는 콘텐츠의 홍수 속에서 정작 필요한 지식을 찾고 정리하기는 점점 더 어려워지고
            있습니다
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* 문제 시각화 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md transform transition hover:scale-105">
              <div className="aspect-square relative bg-gray-200">
                <img src="/landing/1-1.webp" alt="" className="object-cover w-full h-full" />
                {/* 감정적 텍스트 오버레이 추가 */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-lg font-medium p-4 text-center">
                    "어떤 콘텐츠가 내게 가치 있는지 판단하기가 너무 어려워요"
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">콘텐츠 과부하</h3>
                <p className="text-gray-600">
                  수많은 콘텐츠 중 정말 가치 있는 것을 찾아내기 위해 시간을 낭비하고 있습니다
                </p>
              </div>
            </div>

            {/* 문제 시각화 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md transform transition hover:scale-105">
              <div className="aspect-square relative bg-gray-200">
                <img src="/landing/1-2.webp" alt="" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-lg font-medium p-4 text-center">
                    "정리되지 않은 메모는 결국 디지털 쓰레기가 됩니다"
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">정리의 부담</h3>
                <p className="text-gray-600">
                  메모는 쉽게 작성하지만 이를 체계적으로 정리하는 과정이 큰 심리적 부담이 됩니다
                </p>
              </div>
            </div>

            {/* 문제 시각화 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md transform transition hover:scale-105">
              <div className="aspect-square relative bg-gray-200">
                <img src="/landing/1-3.webp" alt="" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-lg font-medium p-4 text-center">
                    "중요한 글로벌 콘텐츠를 놓치고 있지는 않을까요?"
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">언어 장벽</h3>
                <p className="text-gray-600">
                  외국어 콘텐츠는 내용 파악에 더 많은 시간이 소요되어 자주 무시하게 됩니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 밀키트 비교 이미지 섹션 */}
      <section className="py-16 md:py-24 bg-emerald-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">당신을 위한 해결책</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
            직접 요리하는 대신 손질된 재료를 받는 것처럼, 콘텐츠 정리도 AI에게 맡기고 활용에만
            집중하세요
          </p>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-20 items-center">
            {/* Before 이미지 */}
            <div className="rounded-xl overflow-hidden shadow-md transform transition hover:shadow-lg">
              <div className="aspect-video relative bg-gray-200">
                <img
                  src="/landing/2-1.webp"
                  alt=""
                  className="object-cover w-full h-full opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="p-6 bg-black/80">
                    <p className="text-gray-100 text-4xl font-semibold">요약? 정리?</p>
                    <p className="text-gray-300 mt-3">
                      복잡한 정리 작업에 시간을 낭비하고 있습니다
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 p-6 text-center">
                <h3 className="font-semibold text-lg">기존 메모 앱</h3>
                <p className="text-gray-600 mt-2">정리, 요약 등 모두 사용자가 직접 해야 함</p>
              </div>
            </div>

            {/* After 이미지 */}
            <div className="rounded-xl overflow-hidden shadow-md transform transition hover:shadow-lg">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/2-2.webp" alt="" className="object-cover w-full h-full" />
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="p-6 bg-emerald-600/80 rounded-lg">
                    <p className="text-white text-2xl font-semibold">자동으로 정리된 지식</p>
                    <p className="text-white/90 mt-3">
                      콘텐츠 소비에 집중하고 정리는 AI에게 맡기세요
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-600 p-6 text-center">
                <h3 className="font-semibold text-lg text-white">
                  Brain Labeling: 손질된 콘텐츠 제공
                </h3>
                <p className="text-emerald-100 mt-2">AI가 정리하고 사용자는 활용에만 집중</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 이미지 쇼케이스 - 스토리텔링 접근 강화 */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            AI 가이드와 함께하는 여정
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
            Brain Labeling은 당신의 지식 정리 여정에서 신뢰할 수 있는 가이드가 되어드립니다
          </p>

          {/* 기능 1: 다양한 입력 방식 */}
          <div className="mb-24 bg-white rounded-xl overflow-hidden shadow-lg border-2 border-emerald-100">
            <div className="bg-emerald-600 text-white py-3 px-6">
              <h3 className="text-xl md:text-2xl font-bold">첫 번째 단계: 콘텐츠 입력</h3>
            </div>

            <div className="p-6 md:p-8">
              <p className="text-gray-600 text-lg mb-6">
                중요한 콘텐츠를 발견했을 때, 가장 편리한 방식으로 Brain Labeling에 공유하세요.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Check className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">
                        텍스트 직접 입력 - 생각과 아이디어를 바로 기록
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">웹페이지 URL 입력 - 기사, 블로그 자동 추출</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">유튜브 영상 링크 - 영상 내용 자동 분석</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl overflow-hidden border-4 border-emerald-100">
                  <div className="aspect-[4/3] relative bg-gray-200">
                    <img src="/landing/3-1.webp" alt="" className="object-cover w-full h-full" />
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 p-4">
                      <p className="text-white text-sm md:text-base">
                        "평균적으로 콘텐츠 수집에 드는 시간이 70% 감소했습니다"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 기능 2: AI 분석 */}
          <div className="mb-24 bg-white rounded-xl overflow-hidden shadow-lg border-2 border-emerald-100">
            <div className="bg-emerald-600 text-white py-3 px-6">
              <h3 className="text-xl md:text-2xl font-bold">두 번째 단계: AI 분석 및 정리</h3>
            </div>

            <div className="p-6 md:p-8">
              <p className="text-gray-600 text-lg mb-6">
                귀찮은 정리는 AI가 대신해드립니다. 당신의 목적에 맞게 최적화된 형태로 변환해 드려요.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className="order-2 md:order-1 rounded-xl overflow-hidden border-4 border-emerald-100">
                  <div className="aspect-[4/3] relative bg-gray-200">
                    <img src="/landing/3-2.webp" alt="" className="object-cover w-full h-full" />
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 p-4">
                      <p className="text-white text-sm md:text-base">
                        "기존 앱 설정 보다 100배 쉬워요. 그냥 목적만 선택하면 끝!"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="order-1 md:order-2">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Check className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">목적별 최적화 - 일상/업무/개인/학습 중 선택</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">핵심 내용 추출 - 중요한 콘텐츠만 골라 요약</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">자동 태그와 카테고리 - 나중에 찾기 쉽게 정리</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 기능 3: 구조화된 결과 */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border-2 border-emerald-100">
            <div className="bg-emerald-600 text-white py-3 px-6">
              <h3 className="text-xl md:text-2xl font-bold">세 번째 단계: 지식 활용</h3>
            </div>

            <div className="p-6 md:p-8">
              <p className="text-gray-600 text-lg mb-6">
                구조화된 콘텐츠를 통해 빠르게 핵심을 파악하고 필요할 때 언제든 찾아보세요.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Check className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">아이디어맵 - 전체 구조를 한눈에 파악</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">단계별 정리 - 세부 내용을 체계적으로 탐색</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">검색과 필터링 - 필요한 콘텐츠를 즉시 찾기</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl overflow-hidden border-4 border-emerald-100">
                  <div className="aspect-[4/3] relative bg-gray-200">
                    <img src="/landing/3-3.webp" alt="" className="object-cover w-full h-full" />
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 p-4">
                      <p className="text-white text-sm md:text-base">
                        "이제 콘텐츠를 소비하는 방식이 완전히 바뀌었어요"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 활용 사례 갤러리 - 고객 중심 스토리 강화 */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            당신의 스토리에 함께합니다
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
            Brain Labeling은 다양한 목표를 가진 사용자들의 여정에 함께하는 가이드입니다
          </p>

          {/* 사례 이미지 갤러리 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {/* 사례 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow transform  hover:scale-105">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-1.webp" alt="" className="object-cover w-full h-full " />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-center p-6">
                    "콘텐츠를 다 읽기 전에 가치를 판단할 수 있어 시간이 절약됩니다"
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">웹 콘텐츠 요약</h3>
                <p className="text-gray-600">중요한 내용만 추출하여 가치 빠르게 판단하세요</p>
              </div>
            </div>

            {/* 사례 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow transform  hover:scale-105">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-2.webp" alt="" className="object-cover w-full h-full " />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-center p-6">
                    "1시간 영상을 3분 안에 핵심만 파악할 수 있게 되었어요"
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">유튜브 영상 분석</h3>
                <p className="text-gray-600">전체 영상을 보지 않고도 핵심 내용을 파악하세요</p>
              </div>
            </div>

            {/* 사례 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow transform  hover:scale-105">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-3.webp" alt="" className="object-cover w-full h-full " />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-center p-6">
                    "외국어 콘텐츠도 이제 부담 없이 접할 수 있게 되었습니다"
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">외국어 콘텐츠 이해</h3>
                <p className="text-gray-600">언어 장벽 없이 핵심 내용을 한글로 파악하세요</p>
              </div>
            </div>

            {/* 사례 4 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow transform  hover:scale-105">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-4.webp" alt="" className="object-cover w-full h-full " />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-center p-6">
                    "회의록 정리 시간이 90% 이상 단축되었습니다"
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">회의 내용 정리</h3>
                <p className="text-gray-600">핵심 사항과 액션 아이템을 자동으로 추출하세요</p>
              </div>
            </div>

            {/* 사례 5 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow transform  hover:scale-105">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-5.webp" alt="" className="object-cover w-full h-full " />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-center p-6">
                    "복잡한 개념도 체계적으로 이해할 수 있게 되었어요"
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">학습 자료 정리</h3>
                <p className="text-gray-600">복잡한 콘텐츠를 학습에 최적화된 형태로 변환하세요</p>
              </div>
            </div>

            {/* 사례 6 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow transform  hover:scale-105">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-6.webp" alt="" className="object-cover w-full h-full " />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-white text-center p-6">
                    "소셜 미디어 대신 가치 있는 콘텐츠에 시간을 투자하게 되었어요"
                  </p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-3">콘텐츠 소비 효율화</h3>
                <p className="text-gray-600">가치 있는 콘텐츠를 선별하여 시간을 절약하세요</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 사용자 스토리 & 추천사 섹션 추가 */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16">사용자들의 이야기</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* 추천사 1 */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-md transform transition hover:shadow-lg">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center mr-4">
                  <User className="text-emerald-600 h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">미나</h4>
                  <p className="text-gray-500 mt-1">마케팅 전략가</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "노션을 세 번 시작하고 세 번 포기했습니다. Brain Labeling은 달랐어요. 첫째 날부터
                가치를 느꼈고, 지금은 스마트폰을 열 때마다 인스타그램 대신 내 아이디어를 먼저
                확인합니다."
              </p>
            </div>

            {/* 추천사 2 */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-md transform transition hover:shadow-lg">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center mr-4">
                  <User className="text-emerald-600 h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">준호</h4>
                  <p className="text-gray-500 mt-1">대학원생</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "시간이 없어 읽지 못했던 수많은 아티클들. 이제는 Brain Labeling으로 핵심만 빠르게
                파악하고, 진짜 가치 있는 내용만 깊이 읽습니다. 한 달 만에 읽은 책이 두 배로
                늘었어요."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 시작하기 단계 안내 섹션 추가 */}
      <section className="py-16 md:py-24 bg-emerald-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            시작하기: 1분이면 충분합니다
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-16">
            복잡한 설정 없이 바로 콘텐츠 정리의 혜택을 경험하세요
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* 단계 1 */}
            <div className="bg-white border-2 border-emerald-100 rounded-xl shadow-md transform transition hover:shadow-lg overflow-hidden">
              <div className="bg-emerald-600 text-white py-3 px-4">
                <span className="inline-block bg-white text-emerald-600 rounded-full w-8 h-8 mr-2 text-center font-bold text-lg leading-8">
                  1
                </span>
                <span className="font-bold text-xl">첫 번째 단계</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-4 text-emerald-700">콘텐츠 입력</h3>
                <p className="text-gray-600 text-lg mb-4">
                  정리하고 싶은 웹 콘텐츠, 유튜브 영상 또는 텍스트를 준비하세요
                </p>
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <p className="text-sm text-gray-500 italic">
                    "간단한 준비만으로 콘텐츠 관리의 첫 단계를 시작하세요"
                  </p>
                </div>
              </div>
            </div>

            {/* 단계 2 */}
            <div className="bg-white border-2 border-emerald-100 rounded-xl shadow-md transform transition hover:shadow-lg overflow-hidden">
              <div className="bg-emerald-600 text-white py-3 px-4">
                <span className="inline-block bg-white text-emerald-600 rounded-full w-8 h-8 mr-2 text-center font-bold text-lg leading-8">
                  2
                </span>
                <span className="font-bold text-xl">두 번째 단계</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-4 text-emerald-700">입력 방식 선택</h3>
                <p className="text-gray-600 text-lg mb-4">
                  URL 붙여넣기, 직접 텍스트 입력 등 가장 편한 방법으로 공유하세요
                </p>
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <p className="text-sm text-gray-500 italic">
                    "어떤 방식이든 간편하게 콘텐츠를 공유할 수 있습니다"
                  </p>
                </div>
              </div>
            </div>

            {/* 단계 3 */}
            <div className="bg-white border-2 border-emerald-100 rounded-xl shadow-md transform transition hover:shadow-lg overflow-hidden">
              <div className="bg-emerald-600 text-white py-3 px-4">
                <span className="inline-block bg-white text-emerald-600 rounded-full w-8 h-8 mr-2 text-center font-bold text-lg leading-8">
                  3
                </span>
                <span className="font-bold text-xl">세 번째 단계</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-4 text-emerald-700">목적 선택</h3>
                <p className="text-gray-600 text-lg mb-4">
                  일반, 업무, 개인 성장, 학습 중 원하는 목적을 선택하면 즉시 정리 완료
                </p>
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <p className="text-sm text-gray-500 italic">
                    "목적만 선택하면 AI가 알아서 최적화된 형태로 정리합니다"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/memo">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-lg font-medium inline-flex items-center text-lg">
                지금 바로 시작하기
                <ArrowRight className="ml-2 h-6 w-6" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 마지막 CTA 섹션 - 이미지 배경 */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
            무의미한 스크롤링에서 벗어나세요
          </h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            소셜 미디어에 소비하는 30분만 Brain Labeling으로 전환하면,
            <br className="hidden md:block" />한 달 후 당신만의 가치 있는 지식 라이브러리가
            완성됩니다
          </p>
          <Link href="/memo">
            <button className="bg-white hover:bg-emerald-50 text-emerald-600 px-10 py-5 rounded-lg font-medium inline-flex items-center text-xl">
              나의 지식 여정 시작하기
              <ArrowRight className="ml-3 h-6 w-6" />
            </button>
          </Link>
          <p className="text-emerald-100 mt-6 text-lg">
            매일 10개의 무료 크레딧으로 부담 없이 시작하세요
          </p>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-12 md:py-16">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <div className="flex justify-center items-center mb-6">
            <img src="/icons/icon-192x192.png" alt="" className="object-cover h-10 w-10" />
            <span className="ml-3 text-xl font-bold text-white">Brain Labeling</span>
          </div>
          <p className="mb-6 max-w-2xl mx-auto text-lg">
            AI 기반의 메모 정리 서비스로 콘텐츠 과잉 시대의 지식 관리 문제를 해결합니다.
          </p>
          <div className="flex flex-wrap justify-center space-x-4 md:space-x-8 mb-6">
            <a href="#" className="hover:text-white my-2">
              이용약관
            </a>
            <a href="#" className="hover:text-white my-2">
              개인콘텐츠처리방침
            </a>
            <a href="#" className="hover:text-white my-2">
              자주 묻는 질문
            </a>
            <a href="#" className="hover:text-white my-2">
              문의하기
            </a>
          </div>
          <p>© 2025 Brain Labeling. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
