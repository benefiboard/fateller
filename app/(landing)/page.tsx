// app/(landing)/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Brain,
  ArrowRight,
  Check,
  User,
  Clock,
  Shield,
  Chrome,
  Youtube,
  Volume2,
  FileText,
  Search,
  PenTool,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../store/userStore';

export default function Home() {
  const router = useRouter();
  const { currentUser, isInitialized } = useUserStore();

  useEffect(() => {
    if (isInitialized && currentUser) {
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
              <div className=" relative h-12 w-12">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="Brain Labeling Logo"
                  fill
                  sizes="48px"
                  priority
                  className="object-cover"
                />
              </div>
              <span className="no-mobile-show ml-2 text-lg sm:text-xl font-bold text-gray-900">
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
                className=" bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                시작하기
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 히어로 섹션 - 크롬 익스텐션과 즉시 캡처 강조 */}
      <section className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-emerald-600 block sm:inline mb-2 sm:mb-0">
                한 번의 클릭으로,
              </span>
              <span> 소중한 콘텐츠를 영원히</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              복잡한 웹 콘텐츠, 유튜브 영상, 외국어 자료를 <strong>탭 전환 없이</strong> 바로
              저장하고 AI가 자동으로 정리해드립니다
            </p>

            {/* 익스텐션 강조 배지 추가 */}
            <div className="flex flex-wrap justify-center items-center mb-6 gap-4">
              <div className="bg-emerald-50 text-emerald-600 py-2 px-4 rounded-full flex items-center">
                <Chrome className="h-6 w-6 mr-2" />
                <span className="text-xl font-medium">크롬 익스텐션으로 즉시 저장</span>
              </div>
              <div className="bg-emerald-50 text-emerald-600 py-2 px-4 rounded-full flex items-center">
                <Volume2 className="h-6 w-6 mr-2" />
                <span className="text-xl font-medium">읽어주는 TTS 기능</span>
              </div>
            </div>

            <Link href="/memo">
              <button className=" bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center text-lg">
                1분만에 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              하루 15크레딧 무료 (유튜브 영상 2시간 분량)
            </p>
          </div>

          {/* 익스텐션 작동 방식 시각화 */}
          <div className="relative w-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl">
            <div className="aspect-[16/9] w-full relative">
              <Image
                src="/landing/main.webp"
                alt="Brain Labeling 익스텐션 작동 방식"
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
              />
              {/* 이미지 위에 오버레이 텍스트 추가 - 고객 중심 메시지 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <div className="flex items-center">
                  <Chrome className="h-6 w-6 text-white mr-2" />
                  <p className="text-white text-lg md:text-xl font-medium">
                    "웹서핑, 유튜브 시청 중 우클릭 한 번으로 중요한 콘텐츠를 바로 저장하세요"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 노트북LM과의 직접 비교 섹션 추가 */}
      <section className="py-16 md:py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Brain Labeling이 다른 점
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
            <div className="border border-gray-700 rounded-xl p-6 bg-gray-800">
              <h3 className="text-xl font-bold mb-4 text-center text-gray-300">
                일반적인 문서 정리 도구
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start opacity-70">
                  <FileText className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span>문서 파일 업로드 과정 필요</span>
                </li>
                <li className="flex items-start opacity-70">
                  <FileText className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span>별도 앱으로 이동해야 정보 저장 가능</span>
                </li>
                <li className="flex items-start opacity-70">
                  <FileText className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span>텍스트 위주 문서 분석에 초점</span>
                </li>
                <li className="flex items-start opacity-70">
                  <FileText className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span>주로 연구나 학술 자료를 위한 도구</span>
                </li>
                <li className="flex items-start opacity-70">
                  <FileText className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span>요약만 제공, 시각적 구조화 부족</span>
                </li>
              </ul>
            </div>

            <div className="border border-emerald-600 rounded-xl p-6 bg-emerald-900/30">
              <h3 className="text-xl font-bold mb-4 text-center text-emerald-400">
                Brain Labeling
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Check className="text-emerald-400 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    <strong>크롬 익스텐션으로 원클릭 저장</strong> - 웹서핑 흐름 유지
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-400 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    <strong>유튜브, 블로그, 웹사이트를 하나의 시스템</strong>에서 통합 관리
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-400 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    <strong>마인드맵 시각화</strong>로 콘텐츠 구조를 한눈에 파악
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-400 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    <strong>TTS 기능</strong>으로 이동 중에도 저장된 정보 청취 가능
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="text-emerald-400 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                  <span>
                    <strong>일상 정보 관리</strong>부터 학습, 업무까지 폭넓게 활용
                  </span>
                </li>
              </ul>
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
                <Image
                  src="/landing/1-1.webp"
                  alt="콘텐츠 과부하 개념"
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
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
                <Image
                  src="/landing/1-2.webp"
                  alt="정리의 부담 개념"
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
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
                <Image
                  src="/landing/1-3.webp"
                  alt="언어 장벽 개념"
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
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
      {/* 크롬 익스텐션 특징 강조 섹션 추가 */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="w-full md:w-1/2">
              <Chrome className="h-16 w-16 mb-6 text-white" />
              <h2 className="text-2xl md:text-3xl font-bold mb-6">
                다른 앱으로 전환할 필요 없이
                <br />
                원클릭으로 콘텐츠를 저장하세요
              </h2>
              <p className="text-xl mb-8 text-emerald-100">
                유용한 웹페이지를 보다가, 유튜브 영상을 시청하다가
                <br />
                맘에 드는 내용이 있으면 우클릭 한 번으로 바로 저장할 수 있습니다.
              </p>
              <div className="bg-white/20 p-4 rounded-lg">
                <p className="font-medium">
                  Brain Labeling 크롬 익스텐션으로 웹서핑 흐름을 끊지 않고
                  <br />
                  중요한 콘텐츠를 즉시 저장하세요.
                </p>
              </div>
            </div>

            <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-xl">
              <div className="aspect-[4/3] relative bg-gray-200">
                <Image
                  src="/landing/extension-demo.webp" // 익스텐션 사용 이미지로 변경 필요
                  alt="Brain Labeling 크롬 익스텐션 데모"
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
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
                <Image
                  src="/landing/2-1.webp"
                  alt="기존 메모 앱 콘셉트"
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover opacity-50"
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
                <Image
                  src="/landing/2-2.webp"
                  alt="Brain Labeling 앱 콘셉트"
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
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
      {/* TTS 기능 강조 섹션 추가 */}
      <section className="py-16 md:py-20 bg-emerald-100">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <div className="aspect-[4/3] relative bg-gray-200">
                  <Image
                    src="/landing/tts-demo.webp" // TTS 사용 이미지로 변경 필요
                    alt="Brain Labeling TTS 기능 데모"
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 order-1 md:order-2">
              <Volume2 className="h-16 w-16 mb-6 text-emerald-600" />
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
                이동 중에도 저장된 정보를
                <br />
                음성으로 들으세요
              </h2>
              <p className="text-xl mb-8 text-gray-600">
                운전 중, 운동 중, 이동 중에도 저장한 콘텐츠를
                <br />
                TTS 기능으로 언제 어디서나 쉽게 들을수 있어요.
              </p>
              <div className="bg-emerald-200 p-4 rounded-lg">
                <p className="font-medium text-emerald-800">
                  "'짜투리 시간'을 '지식의 시간'으로 바꿔보세요."
                </p>
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
                      <Chrome className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">
                        <strong>크롬 익스텐션</strong> - 웹페이지, 유튜브에서 우클릭 한 번으로 저장
                      </span>
                    </li>
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
                      <Youtube className="text-red-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">
                        <strong>유튜브 영상 링크</strong> - 영상 내용 자동 분석 및 요약
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl overflow-hidden border-4 border-emerald-100">
                  <div className="aspect-[4/3] relative bg-gray-200">
                    <Image
                      src="/landing/3-1.webp"
                      alt="콘텐츠 입력 방식"
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
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
                    <Image
                      src="/landing/3-2.webp"
                      alt="AI 분석 및 정리 기능"
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
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
                      <Brain className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">
                        <strong>마인드맵 자동 생성</strong> - 콘텐츠 구조를 시각적으로 파악
                      </span>
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
                      <Brain className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">
                        <strong>마인드맵</strong> - 전체 구조를 한눈에 파악
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Volume2 className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">
                        <strong>음성 청취</strong> - 저장된 정보를 TTS로 들으며 이동
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Search className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">
                        <strong>통합 검색</strong> - 모든 종류의 콘텐츠를 한 번에 찾기
                      </span>
                    </li>
                    <li className="flex items-start">
                      <PenTool className="text-emerald-600 h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                      <span className="text-lg">
                        <strong>개인화</strong> - 자신만의 메모를 추가하여 지식 확장
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl overflow-hidden border-4 border-emerald-100">
                  <div className="aspect-[4/3] relative bg-gray-200">
                    <Image
                      src="/landing/3-3.webp"
                      alt="지식 활용 기능"
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
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
      {/* 크레딧 시스템 설명 섹션 추가 */}
      <section className="py-16 md:py-20 bg-emerald-50">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">간단한 크레딧 시스템</h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
            복잡한 구독 모델이 아닌, 실제 사용량에 기반한 투명한 크레딧 시스템
          </p>

          <div className="max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="bg-emerald-600 text-white p-6">
              <h3 className="text-xl md:text-2xl font-bold">하루 15크레딧 무료 제공</h3>
              <p className="text-emerald-100 mt-2">
                매일 자동으로 충전되는 크레딧으로 부담 없이 시작하세요
              </p>
            </div>

            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-emerald-200 rounded-lg p-5 text-center">
                  <h4 className="font-bold text-xl mb-3 text-emerald-700">8분 유튜브 영상</h4>
                  <p className="text-6xl font-bold text-emerald-600 mb-3">1</p>
                  <p className="text-gray-600">크레딧</p>
                </div>

                <div className="border border-emerald-200 rounded-lg p-5 text-center">
                  <h4 className="font-bold text-xl mb-3 text-emerald-700">일반 웹 페이지</h4>
                  <p className="text-6xl font-bold text-emerald-600 mb-3">1</p>
                  <p className="text-gray-600">크레딧</p>
                </div>

                <div className="border border-emerald-200 rounded-lg p-5 text-center">
                  <h4 className="font-bold text-xl mb-3 text-emerald-700">20분 유튜브 영상</h4>
                  <p className="text-6xl font-bold text-emerald-600 mb-3">3</p>
                  <p className="text-gray-600">크레딧</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-emerald-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-2 text-emerald-800">
                  하루 15크레딧으로 가능한 일:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <li className="flex items-center">
                    <Check className="text-emerald-600 h-5 w-5 mr-2" />
                    <span>8분 길이 유튜브 영상 15개 요약</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-emerald-600 h-5 w-5 mr-2" />
                    <span>웹 기사 10개 + 30분 영상 1개</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-emerald-600 h-5 w-5 mr-2" />
                    <span>1시간 강의 영상 5개</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-emerald-600 h-5 w-5 mr-2" />
                    <span>외국어 웹사이트 7개 + 유튜브 영상 4개</span>
                  </li>
                </ul>
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
                확인합니다. 크롬 익스텐션으로 중요한 마케팅 사례를 바로 저장해 팀 전체의 생산성이
                50% 향상되었습니다."
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
                "다른 문서 정리 도구는 논문을 먼저 다운로드하고 업로드해야 했는데, Brain Labeling은
                웹페이지에서 바로 저장하고 요약해줍니다. 시간이 없어 읽지 못했던 수많은 논문들을
                이제는 핵심만 빠르게 파악하고, TTS 기능으로 통학 시간에 들으면서 공부합니다. 연구
                생산성이 두 배 이상 늘었어요."
              </p>
            </div>

            {/* 추천사 3 */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-md transform transition hover:shadow-lg">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center mr-4">
                  <User className="text-emerald-600 h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">성민</h4>
                  <p className="text-gray-500 mt-1">소프트웨어 개발자</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "영어 기술문서와 외국 유튜브 튜토리얼을 자주 봐야 하는데, Brain Labeling으로
                한국어로 요약해서 보니 이해 속도가 3배 빨라졌습니다. 특히 마인드맵으로 개념 연결성을
                한눈에 파악할 수 있어 학습 효율이 크게 올랐어요. 다른 도구들과 달리 정말
                실용적입니다."
              </p>
            </div>

            {/* 추천사 4 */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-md transform transition hover:shadow-lg">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-200 flex items-center justify-center mr-4">
                  <User className="text-emerald-600 h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">지영</h4>
                  <p className="text-gray-500 mt-1">콘텐츠 크리에이터</p>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                "트렌드 리서치를 위해 하루에도 수십 개의 콘텐츠를 소비해야 하는데, Brain Labeling이
                핵심만 추출해주니 소셜 미디어 스크롤링 시간이 70% 줄었어요. 크롬 익스텐션으로
                발견하는 즉시 저장하고, 나중에 통합 검색으로 필요한 정보를 바로 찾을 수 있어 콘텐츠
                제작 속도가 2배로 빨라졌습니다."
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* 노트북LM과 비교 마케팅 섹션 */}
      <section className="py-16 md:py-20 bg-gray-100">
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            왜 Brain Labeling인가요?
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
            일상 속 콘텐츠 관리를 위한 최적의 선택
          </p>

          {/* 데스크톱 비교 테이블 - 모바일에서는 숨김 */}
          <div className="hidden md:block">
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <div className="grid grid-cols-12">
                {/* 헤더 */}
                <div className="col-span-4 bg-gray-50 p-6 border-r border-gray-200">
                  <h3 className="font-bold text-lg text-gray-400">비교 항목</h3>
                </div>
                <div className="col-span-4 p-6 border-r border-gray-200">
                  <h3 className="font-bold text-lg text-gray-800">기존 도구</h3>
                </div>
                <div className="col-span-4 bg-emerald-50 p-6">
                  <h3 className="font-bold text-lg text-emerald-600">Brain Labeling</h3>
                </div>

                {/* 항목 1 */}
                <div className="col-span-4 bg-gray-50 p-6 border-t border-r border-gray-200">
                  <p className="font-medium">정보 캡처 방식</p>
                </div>
                <div className="col-span-4 p-6 border-t border-r border-gray-200">
                  <p>파일 업로드, URL 입력 필요</p>
                </div>
                <div className="col-span-4 bg-emerald-50 p-6 border-t border-gray-200">
                  <p className="font-medium text-emerald-700">크롬 익스텐션으로 원클릭 저장</p>
                </div>

                {/* 항목 2 */}
                <div className="col-span-4 bg-gray-50 p-6 border-t border-r border-gray-200">
                  <p className="font-medium">콘텐츠 형식</p>
                </div>
                <div className="col-span-4 p-6 border-t border-r border-gray-200">
                  <p>주로 문서 파일 위주</p>
                </div>
                <div className="col-span-4 bg-emerald-50 p-6 border-t border-gray-200">
                  <p className="font-medium text-emerald-700">웹, 유튜브, 텍스트 모두 지원</p>
                </div>

                {/* 항목 3 */}
                <div className="col-span-4 bg-gray-50 p-6 border-t border-r border-gray-200">
                  <p className="font-medium">시각화</p>
                </div>
                <div className="col-span-4 p-6 border-t border-r border-gray-200">
                  <p>텍스트 위주 요약</p>
                </div>
                <div className="col-span-4 bg-emerald-50 p-6 border-t border-gray-200">
                  <p className="font-medium text-emerald-700">마인드맵으로 구조 시각화</p>
                </div>

                {/* 항목 4 */}
                <div className="col-span-4 bg-gray-50 p-6 border-t border-r border-gray-200">
                  <p className="font-medium">음성 기능</p>
                </div>
                <div className="col-span-4 p-6 border-t border-r border-gray-200">
                  <p>제공되지 않음</p>
                </div>
                <div className="col-span-4 bg-emerald-50 p-6 border-t border-gray-200">
                  <p className="font-medium text-emerald-700">TTS로 이동 중 청취 가능</p>
                </div>

                {/* 항목 5 */}
                <div className="col-span-4 bg-gray-50 p-6 border-t border-r border-gray-200">
                  <p className="font-medium">주요 사용 목적</p>
                </div>
                <div className="col-span-4 p-6 border-t border-r border-gray-200">
                  <p>연구 및 학술 자료 분석</p>
                </div>
                <div className="col-span-4 bg-emerald-50 p-6 border-t border-gray-200">
                  <p className="font-medium text-emerald-700">일상 콘텐츠부터 업무까지 다목적</p>
                </div>
              </div>
            </div>
          </div>

          {/* 모바일 비교 카드 - 데스크톱에서는 숨김 */}
          <div className="md:hidden space-y-6">
            {/* 항목 1 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <p className="font-medium text-lg">정보 캡처 방식</p>
              </div>
              <div className="grid grid-cols-1 divide-y divide-gray-200">
                <div className="p-4">
                  <h4 className="font-medium text-gray-500 mb-1">기존 도구</h4>
                  <p>파일 업로드, URL 입력 필요</p>
                </div>
                <div className="p-4 bg-emerald-50">
                  <h4 className="font-medium text-emerald-800 mb-1">Brain Labeling</h4>
                  <p className="text-emerald-700">크롬 익스텐션으로 원클릭 저장</p>
                </div>
              </div>
            </div>

            {/* 항목 2 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <p className="font-medium text-lg">콘텐츠 형식</p>
              </div>
              <div className="grid grid-cols-1 divide-y divide-gray-200">
                <div className="p-4">
                  <h4 className="font-medium text-gray-500 mb-1">기존 도구</h4>
                  <p>주로 문서 파일 위주</p>
                </div>
                <div className="p-4 bg-emerald-50">
                  <h4 className="font-medium text-emerald-800 mb-1">Brain Labeling</h4>
                  <p className="text-emerald-700">웹, 유튜브, 텍스트 모두 지원</p>
                </div>
              </div>
            </div>

            {/* 항목 3 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <p className="font-medium text-lg">시각화</p>
              </div>
              <div className="grid grid-cols-1 divide-y divide-gray-200">
                <div className="p-4">
                  <h4 className="font-medium text-gray-500 mb-1">기존 도구</h4>
                  <p>텍스트 위주 요약</p>
                </div>
                <div className="p-4 bg-emerald-50">
                  <h4 className="font-medium text-emerald-800 mb-1">Brain Labeling</h4>
                  <p className="text-emerald-700">마인드맵으로 구조 시각화</p>
                </div>
              </div>
            </div>

            {/* 항목 4 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <p className="font-medium text-lg">음성 기능</p>
              </div>
              <div className="grid grid-cols-1 divide-y divide-gray-200">
                <div className="p-4">
                  <h4 className="font-medium text-gray-500 mb-1">기존 도구</h4>
                  <p>제공되지 않음</p>
                </div>
                <div className="p-4 bg-emerald-50">
                  <h4 className="font-medium text-emerald-800 mb-1">Brain Labeling</h4>
                  <p className="text-emerald-700">TTS로 이동 중 청취 가능</p>
                </div>
              </div>
            </div>

            {/* 항목 5 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <p className="font-medium text-lg">주요 사용 목적</p>
              </div>
              <div className="grid grid-cols-1 divide-y divide-gray-200">
                <div className="p-4">
                  <h4 className="font-medium text-gray-500 mb-1">기존 도구</h4>
                  <p>연구 및 학술 자료 분석</p>
                </div>
                <div className="p-4 bg-emerald-50">
                  <h4 className="font-medium text-emerald-800 mb-1">Brain Labeling</h4>
                  <p className="text-emerald-700">일상 콘텐츠부터 업무까지 다목적</p>
                </div>
              </div>
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
              <button className=" bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 rounded-lg font-medium inline-flex  items-center text-lg">
                1분만에 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
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
            <button className=" bg-white hover:bg-emerald-50 text-emerald-600 px-10 py-5 rounded-lg font-medium inline-flex items-center text-xl">
              나의 지식 여정 시작하기
              <ArrowRight className="ml-3 h-6 w-6" />
            </button>
          </Link>

          <p className="text-emerald-100 mt-6 text-lg">
            매일 15개의 무료 크레딧으로 부담 없이 시작하세요
          </p>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-400 py-12 md:py-16">
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
          <div className="flex flex-wrap justify-center space-x-4 md:space-x-8 mb-6">
            contact : benefoboard@gmail.com
          </div>
          <p>© 2025 Brain Labeling. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
