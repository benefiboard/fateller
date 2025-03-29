// app/(main)/memo/layout.tsx

interface MemoLayoutProps {
  children: React.ReactNode;
  modal: React.ReactNode;
}

export default function MemoLayout({ children, modal }: MemoLayoutProps) {
  return (
    <>
      {/* 메인 메모 목록 컨텐츠 */}
      {children}

      {/* 모달 오버레이 (병렬 라우트로 렌더링) */}
      {modal}
    </>
  );
}
