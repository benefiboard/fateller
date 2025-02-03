//app/dailytalk/utils/fortuneDownload.ts

import { toPng } from 'html-to-image';

export const downloadFortuneCard = async (): Promise<void> => {
  const card = document.getElementById('fortune-card');
  if (!card) return;

  try {
    const dataUrl = await toPng(card, {
      quality: 1.0,
      pixelRatio: 2,
      skipAutoScale: true,
      style: {
        transform: 'scale(1)',
      },
    });

    const link = document.createElement('a');
    const date = new Date().toLocaleDateString('ko-KR').replace(/\./g, '').replace(/ /g, '');
    link.download = `daily_talk_${date}.png`;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('운세 카드 이미지 생성 중 오류 발생:', error);
  }
};
