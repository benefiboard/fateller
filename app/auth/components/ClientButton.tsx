'use client';

import { Button } from '@/components/ui/button';

export default function ClientButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button className={className} onClick={() => window.close()}>
      {children}
    </Button>
  );
}
