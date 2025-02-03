'use client';

import { motion, Variants } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import { FortuneCharacterCard } from './FortuneCharacterCard';
import { saveDailyFortune } from '../actions';
import { FortuneResultType } from '../data/types';

type FortuneContent = {
  comprehensive_solution_summary: {
    content: string;
    background_image?: string;
    fortune_score: number;
    finance_score: number;
    health_score: number;
    love_score: number;
    lucky_color: {
      name: string;
      hex: string;
    };
    lucky_number: string;
  };
  daily_fortune?: string;
  mind_solution?: string;
  finance_solution?: string;
  health_solution?: string;
  psychological_solution?: string;
  love_solution?: string;
  fashion_recommendation?: string;
  meal_recommendation?: string;
};

type FortuneTodayDisplayProps = {
  fortuneData: FortuneResultType;
  userBasicData: {
    id: string;
    saju_information?: {
      gender?: string;
      location?: string;
      birthYear?: string;
    };
    mbti_information?: string;
  };
};

// 카드 애니메이션 설정
const cardVariants: Variants = {
  offscreen: {
    y: 100,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

// 각 카테고리별 그라데이션 색상 설정
const categoryColors = {
  summary: { from: 'from-purple-500', to: 'to-blue-500' },
  mind: { from: 'from-blue-500', to: 'to-teal-500' },
  finance: { from: 'from-emerald-500', to: 'to-yellow-500' },
  health: { from: 'from-red-500', to: 'to-orange-500' },
  love: { from: 'from-pink-500', to: 'to-rose-500' },
  fashion: { from: 'from-fuchsia-500', to: 'to-purple-500' },
  meal: { from: 'from-orange-500', to: 'to-amber-500' },
};

const FortuneCard = ({
  title,
  content,
  gradient,
  children,
}: {
  title: string;
  content?: string;
  gradient: { from: string; to: string };
  children?: React.ReactNode;
}) => {
  return (
    <motion.div
      className="card-container relative my-8 first:mt-0 px-4"
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* 배경 그라데이션 */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient.from} ${gradient.to} opacity-10 
        rounded-[30px] transform rotate-3 scale-105`}
      />

      {/* 카드 */}
      <motion.div
        variants={cardVariants}
        className="relative bg-card rounded-xl shadow-xl overflow-hidden transform-gpu"
      >
        <Card className="border-0 bg-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {children || <p className="whitespace-pre-line leading-relaxed">{content}</p>}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// 스코어 표시 컴포넌트
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

const SummaryCard = ({ content }: { content?: string }) => (
  <FortuneCard title="데일리 케어 요약" gradient={categoryColors.summary}>
    <p className="whitespace-pre-line leading-relaxed ">{content}</p>
  </FortuneCard>
);

const StatsCard = ({
  scores,
  luckyColor,
  luckyNumber,
}: {
  scores: {
    fortune_score?: number;
    finance_score?: number;
    health_score?: number;
    love_score?: number;
  };
  luckyColor?: { name: string; hex: string };
  luckyNumber?: string;
}) => (
  <FortuneCard title="데일리 지수" gradient={categoryColors.summary}>
    {/* 점수 표시 영역 */}
    <div className="space-y-2 mb-6">
      <ScoreDisplay label="종합지수" value={scores.fortune_score || 0} />
      <ScoreDisplay label="머니지수" value={scores.finance_score || 0} />
      <ScoreDisplay label="헬스지수" value={scores.health_score || 0} />
      <ScoreDisplay label="러브지수" value={scores.love_score || 0} />
    </div>

    {/* 행운 아이템 영역 */}
    <div className="space-y-3 pt-4 border-t border-border">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">행운의 색상</span>
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full" style={{ backgroundColor: luckyColor?.hex }} />
          <span>{luckyColor?.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">행운의 숫자</span>
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <span className="text-sm text-primary-foreground">{luckyNumber}</span>
        </div>
      </div>
    </div>
  </FortuneCard>
);

export default function FortuneTodayDisplay({
  fortuneData,
  userBasicData,
}: FortuneTodayDisplayProps) {
  if (!fortuneData) return null;

  const {
    comprehensive_solution_summary,
    mind_solution,
    finance_solution,
    health_solution,
    love_solution,
    fashion_recommendation,
    meal_recommendation,
  } = fortuneData.fortune_content;

  const handleSaveFortuneCard = async (imageUrl: string, description: string) => {
    try {
      const updatedFortune = {
        ...fortuneData,
        fortune_content: {
          ...fortuneData.fortune_content,
          comprehensive_solution_summary: {
            ...fortuneData.fortune_content.comprehensive_solution_summary,
            background_image_url: imageUrl,
            background_image_description: description,
          },
        },
      };

      // 개발자 모드일 때는 저장하지 않음
      if (userBasicData.id === 'dev') {
        return updatedFortune;
      }

      if (userBasicData.id === 'local') {
        // 로컬 스토리지에 저장
        const today = new Date().toLocaleDateString('ko-KR').split('.').slice(0, -1).join('-');
        localStorage.setItem(`fortune-${today}`, JSON.stringify(updatedFortune));
        return updatedFortune;
      } else {
        // 서버에 저장
        await saveDailyFortune(userBasicData.id, updatedFortune);
        return updatedFortune;
      }
    } catch (error) {
      console.error('Failed to save fortune card:', error);
      return fortuneData;
    }
  };

  return (
    <div className="max-w-2xl mx-auto ">
      {/* 튀어오르는 효과만!!! 캐릭터카드 */}
      <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.2 }}>
        <motion.div variants={cardVariants} className="transform-gpu">
          <FortuneCharacterCard fortuneData={fortuneData} onSave={handleSaveFortuneCard} />
        </motion.div>
      </motion.div>

      <StatsCard
        scores={comprehensive_solution_summary || {}}
        luckyColor={comprehensive_solution_summary?.lucky_color}
        luckyNumber={comprehensive_solution_summary?.lucky_number}
      />

      <SummaryCard content={comprehensive_solution_summary?.content} />

      {/* 각 카테고리별 카드 */}
      {mind_solution && (
        <FortuneCard title="마인드 케어" content={mind_solution} gradient={categoryColors.mind} />
      )}

      {finance_solution && (
        <FortuneCard
          title="머니 케어"
          content={finance_solution}
          gradient={categoryColors.finance}
        />
      )}

      {health_solution && (
        <FortuneCard title="헬스 케어" content={health_solution} gradient={categoryColors.health} />
      )}

      {love_solution && (
        <FortuneCard title="러브 케어" content={love_solution} gradient={categoryColors.love} />
      )}

      {fashion_recommendation && (
        <FortuneCard
          title="패션 케어"
          content={fashion_recommendation}
          gradient={categoryColors.fashion}
        />
      )}

      {meal_recommendation && (
        <FortuneCard
          title="푸드 케어"
          content={meal_recommendation}
          gradient={categoryColors.meal}
        />
      )}
    </div>
  );
}
