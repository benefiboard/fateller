import React from 'react';

export const metadata = {
  title: '개인정보 처리방침 | BrainLabeling',
  description: 'BrainLabeling 서비스의 개인정보 처리방침입니다.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">BrainLabeling 개인정보 처리방침</h1>
      <p className="text-sm text-gray-600 mb-8 text-right">마지막 업데이트: 2025-03-28</p>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">한국어</h2>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">1. 수집하는 정보</h3>
          <p className="mb-2">BrainLabeling 확장 프로그램은 다음 정보를 수집합니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>사용자가 저장하기로 선택한 웹페이지의 URL, 제목 및 내용</li>
            <li>직접 입력한 메모 내용</li>
            <li>사용자 인증 정보(로그인 상태 유지 목적)</li>
            <li>로컬 저장소에 저장된 설정 및 사용 기록</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">2. 정보 사용 목적</h3>
          <p className="mb-2">수집된 정보는 다음과 같은 목적으로 사용됩니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>사용자가 선택한 웹페이지 또는 메모를 BrainLabeling 서비스에 저장</li>
            <li>저장된 내용의 AI 분석 및 요약</li>
            <li>확장 프로그램의 기능 제공 및 성능 개선</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">3. 정보 공유</h3>
          <p className="mb-2">수집된 정보는 다음과 같이 공유됩니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>사용자 계정과 연결된 BrainLabeling 서비스</li>
            <li>정보는 사용자의 개인 계정에만 저장되며 제3자와 공유되지 않습니다</li>
            <li>법적 요구가 있는 경우를 제외하고 외부에 공개되지 않습니다</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">4. 사용자 권리</h3>
          <p className="mb-2">사용자는 다음과 같은 권리를 가집니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>저장된 데이터 접근 및 삭제 권리</li>
            <li>확장 프로그램 제거를 통한 로컬 데이터 삭제</li>
            <li>BrainLabeling 계정 설정을 통한 저장된 모든 데이터 관리</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">5. 보안 조치</h3>
          <p className="mb-2">사용자 데이터 보호를 위해 다음과 같은 보안 조치를 취하고 있습니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>모든 데이터 전송은 HTTPS를 통해 암호화됩니다</li>
            <li>인증 토큰은 안전하게 관리됩니다</li>
            <li>로컬 저장소의 데이터는 브라우저의 보안 메커니즘에 의해 보호됩니다</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">6. 연락처</h3>
          <p className="mb-2">개인정보 처리에 관한 문의사항은 아래 연락처로 문의해 주세요:</p>
          <p>이메일: support@brainlabeling.com</p>
          <p>웹사이트: https://brainlabeling.vercel.app </p>
        </section>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">English</h2>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">1. Information We Collect</h3>
          <p className="mb-2">The BrainLabeling extension collects the following information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>URL, title, and content of web pages you choose to save</li>
            <li>Content of directly entered memos</li>
            <li>Authentication information (for maintaining login status)</li>
            <li>Settings and usage history stored in local storage</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">2. How We Use Information</h3>
          <p className="mb-2">Collected information is used for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Saving web pages or memos to the BrainLabeling service</li>
            <li>AI analysis and summarization of saved content</li>
            <li>Providing and improving extension functionality</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">3. Information Sharing</h3>
          <p className="mb-2">Collected information is shared as follows:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With the BrainLabeling service connected to your account</li>
            <li>
              Information is stored only in your personal account and not shared with third parties
            </li>
            <li>Not disclosed externally except where legally required</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">4. Your Rights</h3>
          <p className="mb-2">Users have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Right to access and delete stored data</li>
            <li>Delete local data by removing the extension</li>
            <li>Manage all stored data through BrainLabeling account settings</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">5. Security Measures</h3>
          <p className="mb-2">We take the following security measures to protect user data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All data transfers are encrypted via HTTPS</li>
            <li>Authentication tokens are securely managed</li>
            <li>Data in local storage is protected by browser security mechanisms</li>
          </ul>
        </section>

        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4">6. Contact Information</h3>
          <p className="mb-2">For inquiries regarding privacy practices, please contact:</p>
          <p>Email: support@brainlabeling.com</p>
          <p>Website: https://brainlabeling.vercel.app</p>
        </section>
      </div>
    </div>
  );
}
