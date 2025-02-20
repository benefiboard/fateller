// 712158
// 32Tcz97aUzWGfGLd7ZDHhkaZFDwWIWPoFyzbhmv1NzA
// lWirpo38oJvq-X2KuDlWAavARqr4K9zC3PntmVJSF8k

'use client';

import { useEffect, useState } from 'react';

interface ThumbnailCardProps {
  title: string;
  subject: string;
  bgColor?: string;
  bgImage?: string;
  imageQuery?: string;
}

const UNSPLASH_ACCESS_KEY = '32Tcz97aUzWGfGLd7ZDHhkaZFDwWIWPoFyzbhmv1NzA';

export const ThumbnailCard: React.FC<ThumbnailCardProps> = ({
  title,
  subject,
  bgImage,
  imageQuery,
  bgColor,
}) => {
  const [unsplashImage, setUnsplashImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // bgImage가 있으면 Unsplash API를 호출하지 않음
    if (bgImage || !imageQuery) return;

    const fetchImage = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
            imageQuery
          )}&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch image');

        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setUnsplashImage(data.results[0].urls.regular);
        }
      } catch (err) {
        console.error('Image fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [imageQuery, bgImage]);

  // 배경 이미지 우선순위: bgImage > unsplashImage > bgColor
  const backgroundContent = () => {
    if (bgImage) {
      return (
        <img
          src={bgImage}
          alt="thumbnail background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      );
    }

    if (unsplashImage) {
      return (
        <img
          src={unsplashImage}
          alt="thumbnail background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      );
    }

    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColor}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`relative w-full aspect-[16/9] overflow-hidden`}>
        {backgroundContent()}

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

          {/* Text content */}
          <div className="relative z-10 p-4 sm:p-6 tracking-tighter">
            <p className="text-lg sm:text-xl text-yellow-300 font-medium">{subject}</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white  leading-tight">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};
