import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FortuneResult, TotalFortune } from '../utils/types';
import { ChevronDown, ChevronUp, ScanFace, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { FortuneCharacterCardBasic } from './FortuneCharacterCardBasic';

const ScoreDisplay = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2 sm:gab-4 ">
    <span className="w-14 sm:w-16  text-sm text-muted-foreground tracking-tighter">{label}</span>
    <div className="">
      <span className="font-bold text-2xl w-12">{value}</span>
      <span className="text-sm text-muted-foreground">/ 100</span>
    </div>
    <div className="relative flex-1">
      <Progress value={value} className="h-2" />
      <motion.div
        className="absolute inset-0 bg-white/20"
        animate={{
          x: ['0%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ width: '30%' }}
      />
    </div>
  </div>
);

// 세부 운세 카드 컴포넌트
const DetailFortuneCard = ({ title, fortune }: { title: string; fortune: FortuneResult }) => {
  return (
    <div className="py-4">
      <div className="w-full aspect-[3/1] text-left p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-xl">{title}</h3>
          <div className="flex items-center gap-2">
            <p className="text-base font-semibold text-gray-600">
              {fortune.score}
              <span className="text-xs text-gray-400">점</span>
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2 ">{fortune.message}</p>
      </div>
    </div>
  );
};

// 메인 FortuneDisplay 컴포넌트
const FortuneDisplay = ({ fortune }: { fortune: TotalFortune }) => {
  console.log('fortune', fortune);
  return (
    <div className="flex flex-col min-h-screen bg-white gap-4">
      {/* 상단 총점 총운 영역 */}
      <Card className="mt-6 flex flex-col mx-4 p-6 gap-6">
        <div className="w-full aspect-video flex flex-col items-center justify-center">
          {/* 총운 점수 */}
          <div className="  relative z-10">
            <div className="relative  p-4 ">
              <Star className="w-8 h-8 text-gray-400 absolute top-2 left-1/2 translate-x-10" />
              <p className="text-8xl font-bold tracking-tighter text-center ">
                {fortune.total.score}
              </p>
            </div>
            <p className="text-gray-600 px-6 mt-4">{fortune.total.message}</p>
          </div>
        </div>
      </Card>

      <div className="p-4">
        <FortuneCharacterCardBasic fortune={fortune} />
      </div>

      <Card className="flex flex-col mx-4 p-6 gap-6">
        <div className="space-y-2 ">
          <ScoreDisplay label="총운" value={fortune.total.score || 0} />
          <ScoreDisplay label="금전운" value={fortune.money.score || 0} />
          <ScoreDisplay label="연애운" value={fortune.love.score || 0} />
          <ScoreDisplay label="사업운" value={fortune.business.score || 0} />
          <ScoreDisplay label="건강운" value={fortune.health.score || 0} />
          <ScoreDisplay label="대인운" value={fortune.people.score || 0} />
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">행운의 색상</span>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-full "
                style={{ backgroundColor: fortune.lucky_color?.hex || '#6366f1' }}
              />
              <span>{fortune.lucky_color?.name || '행운의 색'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">행운의 숫자</span>
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-sm text-primary-foreground">{fortune.lucky_number || '7'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 세부 운세 리스트 */}
      <div className="px-4 space-y-1 mb-20">
        <DetailFortuneCard title="금전운" fortune={fortune.money} />
        <DetailFortuneCard title="연애운" fortune={fortune.love} />
        <DetailFortuneCard title="사업운" fortune={fortune.business} />
        <DetailFortuneCard title="건강운" fortune={fortune.health} />
        <DetailFortuneCard title="대인운" fortune={fortune.people} />
      </div>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="grid grid-cols-5 p-4">
          {[
            { icon: '🏠', label: '홈' },
            { icon: '🌟', label: '2024 운세' },
            { icon: '🎴', label: '타로' },
            { icon: '💬', label: '상담' },
            { icon: '👤', label: '정보확인' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default FortuneDisplay;
