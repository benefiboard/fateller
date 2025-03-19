// app/(landing)/introduce/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Brain, ArrowRight, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/userStore';

export default function LandingAuthUserPage() {
  const router = useRouter();
  const { currentUser, isInitialized } = useUserStore();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* 네비게이션 */}
      <nav className="sticky top-0 z-10 bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img src="/icons/icon-192x192.png" alt="" className="object-cover h-12 w-12" />
              <span className="ml-2 text-xl font-bold text-gray-900">Brain Labeling</span>
            </div>
            <div className="flex items-center space-x-4">
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

      {/* 히어로 섹션 - 대형 이미지 중심 */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              AI가 <span className="text-emerald-600">정보 정리의 부담</span>을 덜어드립니다
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              웹 콘텐츠, 유튜브 영상, 외국어 자료도 Brain Labeling으로 쉽게 정리하세요
            </p>
            <Link href="/memo">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center">
                바로 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>

          {/* 대형 히어로 이미지/애니메이션 */}
          <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-[16/9] w-full bg-gray-200 relative">
              <img src="/landing/main.jpg" alt="" className="object-cover w-full h-full" />
              {/* 여기에 실제 히어로 이미지나 애니메이션 삽입 */}
              {/* <Image src="/hero-image.png" alt="Brain Labeling 앱 화면" fill className="object-cover" /> */}
              {/* <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500 font-medium">
                  복잡한 정보가 간결하게 정리되는 Brain Labeling 앱 인터페이스 애니메이션
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* 핵심 문제 시각화 섹션 */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            정보 정리의 불편함, 이제 AI가 해결합니다
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 문제 시각화 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="aspect-square relative bg-gray-200">
                <img src="/landing/1-1.jpg" alt="" className="object-cover w-full h-full" />
                {/* <Image src="/problem-image-1.png" alt="정보 과부하" fill className="object-cover" /> */}
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">정보 과부하로 고통받는 사람 이미지</p>
                </div> */}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">정보 과부하</h3>
                <p className="text-gray-600 text-sm">
                  수많은 콘텐츠, 어떤 것이 가치 있는지 판단하기 어려움
                </p>
              </div>
            </div>

            {/* 문제 시각화 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="aspect-square relative bg-gray-200">
                <img src="/landing/1-2.jpg" alt="" className="object-cover w-full h-full" />
                {/* <Image src="/problem-image-2.png" alt="메모 정리의 부담" fill className="object-cover" /> */}
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">복잡한 메모 정리에 시간 쏟는 모습 이미지</p>
                </div> */}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">정리의 부담</h3>
                <p className="text-gray-600 text-sm">
                  메모는 쉽게 작성하지만 정리는 시간이 많이 소요됨
                </p>
              </div>
            </div>

            {/* 문제 시각화 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md">
              <div className="aspect-square relative bg-gray-200">
                <img src="/landing/1-3.jpg" alt="" className="object-cover w-full h-full" />
                {/* <Image src="/problem-image-3.png" alt="외국어 콘텐츠 장벽" fill className="object-cover" /> */}
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">외국어 콘텐츠를 이해하기 어려워하는 모습 이미지</p>
                </div> */}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">언어 장벽</h3>
                <p className="text-gray-600 text-sm">
                  외국어 콘텐츠는 내용 파악에 더 많은 시간 소요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 밀키트 비교 이미지 섹션 */}
      <section className="py-12 bg-emerald-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">정보 정리 솔루션</h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            직접 요리하는 대신 손질된 재료를 받는 것처럼, 정보 정리도 편리하게
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16 items-center">
            {/* Before 이미지 */}
            <div className="rounded-xl overflow-hidden shadow-md">
              <div className="aspect-video relative bg-gray-200">
                <img
                  src="/landing/2-1.jpg"
                  alt=""
                  className="object-cover w-full h-full opacity-50"
                />
                {/* <Image src="/before-image.png" alt="기존 메모 앱" fill className="object-cover" /> */}
                <div
                  className="absolute inset-0 flex items-center justify-center p-4 
                "
                >
                  <div className="p-4 bg-black/80">
                    <p className="text-gray-100 text-4xl font-semibold">요약? 정리?</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 p-4 text-center">
                <h3 className="font-semibold">기존 메모 앱</h3>
                <p className="text-sm text-gray-600">정리, 요약 등 모두 사용자가 직접 해야 함</p>
              </div>
            </div>

            {/* After 이미지 */}
            <div className="rounded-xl overflow-hidden shadow-md">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/2-2.jpg" alt="" className="object-cover w-full h-full" />
                {/* <Image src="/after-image.png" alt="Brain Labeling" fill className="object-cover" /> */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  {/* <p className="text-gray-500">AI가 깔끔하게 정리한 구조화된 메모 이미지</p> */}
                </div>
              </div>
              <div className="bg-emerald-600 p-4 text-center">
                <h3 className="font-semibold text-white">Brain Labeling: 손질된 컨텐츠 제공</h3>
                <p className="text-sm text-emerald-100">AI가 정리하고 사용자는 활용에만 집중</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 이미지 쇼케이스 */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">어떻게 작동하나요?</h2>

          {/* 기능 1: 다양한 입력 방식 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
            <div className="order-2 md:order-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4">다양한 방식으로 콘텐츠 입력</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="text-emerald-600 h-5 w-5 mr-2 mt-1" />
                  <span>텍스트 직접 입력</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-600 h-5 w-5 mr-2 mt-1" />
                  <span>웹페이지 URL 자동 추출</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-600 h-5 w-5 mr-2 mt-1" />
                  <span>유튜브 영상 자막 분석</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 rounded-xl overflow-hidden shadow-lg border-4 border-emerald-100">
              <div className="aspect-[4/3] relative bg-gray-200 ">
                <img src="/landing/3-1.jpg" alt="" className="object-cover w-full h-full " />
                {/* <Image src="/feature-input.png" alt="다양한 입력 방식" fill className="object-cover" /> */}
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">다양한 입력 방식 화면 이미지</p>
                </div> */}
              </div>
            </div>
          </div>

          {/* 기능 2: AI 분석 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-16">
            <div className="rounded-xl overflow-hidden shadow-lg border-4 border-emerald-100">
              <div className="aspect-[4/3] relative bg-gray-200">
                <img src="/landing/3-2.jpg" alt="" className="object-cover w-full h-full" />
                {/* <Image src="/feature-analysis.png" alt="AI 분석" fill className="object-cover" /> */}
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">AI가 콘텐츠를 분석하는 과정 시각화 이미지</p>
                </div> */}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI가 자동으로 분석하고 정리</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="text-emerald-600 h-5 w-5 mr-2 mt-1" />
                  <span>목적별 최적화 (일반/업무/개인/학습)</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-600 h-5 w-5 mr-2 mt-1" />
                  <span>핵심 내용 추출 및 요약</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-600 h-5 w-5 mr-2 mt-1" />
                  <span>자동 태그와 카테고리 생성</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 기능 3: 구조화된 결과 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 ">
              <h3 className="text-xl font-bold text-gray-900 mb-4">구조화된 형태로 정보 제공</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="text-emerald-600 h-5 w-5 mr-2 mt-1" />
                  <span>아이디어맵으로 핵심 개념 파악</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-600 h-5 w-5 mr-2 mt-1" />
                  <span>주요 내용 단계별 정리</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-600 h-5 w-5 mr-2 mt-1" />
                  <span>쉬운 검색과 필터링</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 rounded-xl overflow-hidden shadow-lg border-4 border-emerald-100">
              <div className="aspect-[4/3] relative bg-gray-200">
                <img src="/landing/3-3.jpg" alt="" className="object-cover w-full h-full " />
                {/* <Image src="/feature-structure.png" alt="구조화된 결과" fill className="object-cover" /> */}
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">구조화된 메모 결과 화면 이미지</p>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 활용 사례 갤러리 */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">다양한 활용 사례</h2>

          {/* 사례 이미지 갤러리 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 사례 1 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-1.jpg" alt="" className="object-cover w-full h-full " />
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">웹 기사가 요약된 화면 이미지</p>
                </div> */}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">웹 콘텐츠 요약</h3>
                <p className="text-gray-600 text-sm">중요한 내용만 추출하여 가치 빠르게 판단</p>
              </div>
            </div>

            {/* 사례 2 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-2.jpg" alt="" className="object-cover w-full h-full " />
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">유튜브 영상 자막이 요약된 화면 이미지</p>
                </div> */}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">유튜브 영상 분석</h3>
                <p className="text-gray-600 text-sm">전체 영상을 보지 않고도 핵심 내용 파악</p>
              </div>
            </div>

            {/* 사례 3 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-3.jpg" alt="" className="object-cover w-full h-full " />
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">외국어 콘텐츠가 한글로 요약된 화면 이미지</p>
                </div> */}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">외국어 콘텐츠 이해</h3>
                <p className="text-gray-600 text-sm">언어 장벽 없이 핵심 내용 한글로 제공</p>
              </div>
            </div>

            {/* 사례 4 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-4.jpg" alt="" className="object-cover w-full h-full " />
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">회의 내용이 구조화된 화면 이미지</p>
                </div> */}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">회의 내용 정리</h3>
                <p className="text-gray-600 text-sm">핵심 사항과 액션 아이템 자동 추출</p>
              </div>
            </div>

            {/* 사례 5 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-5.jpg" alt="" className="object-cover w-full h-full " />
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">학습 자료가 구조화된 화면 이미지</p>
                </div> */}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">학습 자료 정리</h3>
                <p className="text-gray-600 text-sm">복잡한 정보를 학습에 최적화된 형태로 제공</p>
              </div>
            </div>

            {/* 사례 6 */}
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="aspect-video relative bg-gray-200">
                <img src="/landing/4-6.jpg" alt="" className="object-cover w-full h-full " />
                {/* <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-gray-500">콘텐츠 가치 판단 인터페이스 이미지</p>
                </div> */}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">정보 소비 효율화</h3>
                <p className="text-gray-600 text-sm">가치 있는 콘텐츠를 선별하여 시간 절약</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 외국어 콘텐츠 특화 이미지 */}
      {/* <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl overflow-hidden shadow-xl">
            <div className="aspect-[21/9] relative bg-gray-200">
              
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <p className="text-gray-500">
                  외국어가 한국어로 요약되는 과정을 보여주는 큰 이미지
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/70 to-transparent flex items-center">
                <div className="p-6 md:p-12 max-w-md">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    외국어 콘텐츠도
                    <br />
                    쉽게 이해하세요
                  </h2>
                  <p className="text-emerald-50 mb-6">
                    영어, 일본어 등 외국어 콘텐츠의 핵심을 한국어로 요약하여 언어 장벽 없이 중요한
                    정보를 확인할 수 있습니다.
                  </p>
                  <button className="bg-white text-emerald-800 hover:bg-emerald-50 px-6 py-2 rounded-lg font-medium">
                    더 알아보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* 마지막 CTA 섹션 - 이미지 배경 */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">지금 바로 시작하세요</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            더 이상 정보 정리에 시간을 낭비하지 마세요
          </p>
          <Link href="/memo">
            <button className="bg-white hover:bg-emerald-700 text-emerald-600 px-6 py-3 rounded-lg font-medium inline-flex items-center">
              바로 시작하기
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <img src="/icons/icon-192x192.png" alt="" className="object-cover h-8 w-8" />
            <span className="ml-2 text-lg font-bold text-white">Brain Labeling</span>
          </div>
          <p className="mb-4">
            AI 기반의 메모 정리 서비스로 정보 과잉 시대의 지식 관리 문제를 해결합니다.
          </p>
          <p>© 2025 Brain Labeling. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
