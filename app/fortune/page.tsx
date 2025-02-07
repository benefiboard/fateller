import React from 'react';
import TopNav from '../TopNav';
import { useRouter } from 'next/navigation';

export default function FortunePage() {
  return (
    <div>
      <TopNav title="운세" />
      <h2>FortunePage</h2>
    </div>
  );
}
