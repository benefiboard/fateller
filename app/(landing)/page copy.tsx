//app/(landing)/landing/page.tsx

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../store/userStore';
import { useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { currentUser, isInitialized } = useUserStore();

  useEffect(() => {
    if (isInitialized && currentUser) {
      router.push('/memo');
    }
  }, [currentUser, isInitialized, router]);

  return (
    // 메인 컨테이너
    <div className="min-h-screen bg-white flex flex-col">
      {/* 네비게이션 */}
      <nav className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
            B
          </div>
          <span className="text-xl font-bold text-gray-900">BrainLabel</span>
        </div>
        <div className="flex items-center space-x-4">
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
      </nav>

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white py-16 sm:py-24 flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                생각과 정보, AI가 자동으로 정리해주는 메모 서비스
              </h1>
              <p className="text-xl text-emerald-50">
                복잡한 내용도 AI가 핵심을 추출하고 구조화하여 쉽게 활용할 수 있게 변환합니다
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/auth?signup=true"
                  className="bg-white text-emerald-700 hover:bg-gray-100 px-6 py-3 rounded-lg text-center font-medium flex items-center justify-center"
                >
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="#features"
                  className="border border-white text-white hover:bg-white hover:text-emerald-700 px-6 py-3 rounded-lg text-center font-medium transition-colors"
                >
                  서비스 둘러보기
                </a>
              </div>
            </div>
            <div className="hidden md:block relative h-96">
              {/* 앱 스크린샷 이미지 또는 애니메이션 */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 shadow-xl overflow-hidden">
                <div className="p-4 h-full flex flex-col">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 mt-4 bg-white/10 rounded-lg p-2 text-sm overflow-hidden">
                    <div className="animate-pulse">
                      <div className="h-6 bg-white/20 rounded mb-3 w-3/4"></div>
                      <div className="h-4 bg-white/20 rounded mb-2"></div>
                      <div className="h-4 bg-white/20 rounded mb-2 w-5/6"></div>
                      <div className="h-4 bg-white/20 rounded mb-4 w-2/3"></div>
                      <div className="h-20 bg-white/20 rounded mb-3"></div>
                      <div className="h-4 bg-white/20 rounded mb-2 w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 문제 제시 섹션 */}
      <section id="problem" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">정보 과잉 시대의 도전</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              현대인은 매일 엄청난 양의 정보에 노출됩니다. 이를 효과적으로 정리하고 활용하는 것은
              점점 더 어려워지고 있습니다.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 문제 카드 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">정리 작업의 심리적 부담</h3>
              <p className="text-gray-600">
                기록은 쉽지만 이를 체계적으로 정리하는 과정이 사용자에게 큰 부담으로 작용합니다.
              </p>
            </div>

            {/* 문제 카드 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">시간 제약</h3>
              <p className="text-gray-600">
                바쁜 일상에서 메모 정리와 콘텐츠 선별에 시간을 투자하기 어렵습니다.
              </p>
            </div>

            {/* 문제 카드 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">지속성 문제</h3>
              <p className="text-gray-600">
                많은 사용자들이 처음에는 열심히 사용하다가 정리 작업이 쌓이면서 점차 사용을
                중단합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 솔루션 섹션 */}
      <section id="solution" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">밀키트 접근법: 정리의 자동화</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Brain Labeling은 정보 정리의 부담을 AI에게 맡기고, 사용자는 활용에만 집중할 수 있게
              합니다.
            </p>
          </div>

          <div className="bg-emerald-50 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">기존 메모 앱</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-gray-600 text-sm">1</span>
                    </div>
                    <p className="text-gray-700">식재료만 제공</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-gray-600 text-sm">2</span>
                    </div>
                    <p className="text-gray-700">씻기, 손질, 다듬기, 요리까지 모두 사용자가</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-gray-600 text-sm">3</span>
                    </div>
                    <p className="text-gray-700">지속 사용의 어려움</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-emerald-700 mb-4">BrainLabel</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">씻고, 다듬고, 손질된 밀키트 제공</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">사용자는 최종 요리(활용)에만 집중</p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center mr-3 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-700">지속 가능한 정보 관리 시스템</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">주요 기능</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              BrainLabel은 강력한 AI 기술을 활용하여 메모와 정보 관리를 혁신적으로 개선합니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 기능 카드 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">다양한 입력 방식</h3>
              <ul className="text-gray-600 space-y-2">
                <li>텍스트 직접 입력</li>
                <li>URL 입력 시 자동 추출</li>
                <li>유튜브 자막 자동 추출</li>
              </ul>
            </div>

            {/* 기능 카드 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">목적별 AI 분석</h3>
              <ul className="text-gray-600 space-y-2">
                <li>일반: 정보 중심 표준 요약</li>
                <li>업무: 비즈니스 문서 형식</li>
                <li>개인: 개인 메모 및 아이디어</li>
                <li>학습: 학습 자료 중심 요약</li>
              </ul>
            </div>

            {/* 기능 카드 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">구조화된 메모 형식</h3>
              <ul className="text-gray-600 space-y-2">
                <li>아이디어: 핵심 문장과 키워드</li>
                <li>아이디어 맵: 구조화된 정리</li>
                <li>주요 내용: 단계별 정리</li>
                <li>원문: 원본 텍스트/URL</li>
              </ul>
            </div>

            {/* 기능 카드 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">검색 및 필터링</h3>
              <ul className="text-gray-600 space-y-2">
                <li>검색어 기반 검색</li>
                <li>카테고리별 필터링</li>
                <li>목적별 필터링</li>
                <li>다양한 정렬 옵션</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            지금 바로 BrainLabel을 시작해보세요
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            가입 후 무료로 10개의 메모를 분석해볼 수 있습니다
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth?signup=true"
              className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-medium"
            >
              무료로 시작하기
            </Link>
            <a
              href="#features"
              className="border border-white text-white hover:bg-white hover:text-emerald-700 px-8 py-4 rounded-lg text-lg font-medium transition-colors"
            >
              더 알아보기
            </a>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                  B
                </div>
                <span className="text-xl font-bold text-white">BrainLabel</span>
              </div>
              <p className="text-gray-400">
                AI가 자동으로 정리해주는 메모 서비스. 복잡한 정보도 쉽게 관리하세요.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">서비스</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-emerald-400">
                    소개
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-emerald-400">
                    기능
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400">
                    가격
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">고객지원</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-emerald-400">
                    문의
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400">
                    도움말
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400">
                    피드백
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">법적 정보</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-emerald-400">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400">
                    개인정보처리방침
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            &copy; 2025 BrainLabel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
