import React from 'react';
import MemoCardSwiper from './MemoCardSwiper';

export default function CardListPage() {
  return (
    <div className="max-w-md m-4">
      <h2>CardListPage</h2>
      <div className="flex flex-col items-center gap-8">
        <MemoCardSwiper />
        <MemoCardSwiper />
        <MemoCardSwiper />
        <MemoCardSwiper />
      </div>
    </div>
  );
}
