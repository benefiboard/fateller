import { FORTUNE_IMAGES } from '../constants/fortuneImages';
import {
  CRYSTAL_BACKGROUNDS,
  LUCKY_PLACES,
  LUCKY_PROPS,
  LUCKY_TIMES,
} from '../constants/fortuneData';
import { combineBlocks } from '../data';
import type { UserInfoType, BigFiveDataType } from '../types/user';
import { FortuneCardItemType, FortuneCardType, FortuneLevel } from '../data/types';

export const LUCKY_COLORS = [
  { name: '루비 레드', hex: '#E0115F' },
  { name: '사파이어 블루', hex: '#0F52BA' },
  { name: '에메랄드 그린', hex: '#50C878' },
  { name: '로열 퍼플', hex: '#7851A9' },
  { name: '선셋 오렌지', hex: '#FD5E53' },
  { name: '골든 옐로우', hex: '#FFD700' },
  { name: '로즈 핑크', hex: '#FF69B4' },
  { name: '터쿼이즈', hex: '#40E0D0' },
  { name: '라벤더', hex: '#E6E6FA' },
  { name: '민트 그린', hex: '#98FF98' },
  { name: '코랄', hex: '#FF7F50' },
  { name: '인디고', hex: '#4B0082' },
];

// 내부 헬퍼 함수들
const generateRandomBigFive = (): BigFiveDataType => ({
  openness: { score: Math.floor(Math.random() * 100), percentile: Math.floor(Math.random() * 100) },
  conscientiousness: {
    score: Math.floor(Math.random() * 100),
    percentile: Math.floor(Math.random() * 100),
  },
  extraversion: {
    score: Math.floor(Math.random() * 100),
    percentile: Math.floor(Math.random() * 100),
  },
  agreeableness: {
    score: Math.floor(Math.random() * 100),
    percentile: Math.floor(Math.random() * 100),
  },
  neuroticism: {
    score: Math.floor(Math.random() * 100),
    percentile: Math.floor(Math.random() * 100),
  },
});

const generateBaseScore = (): number => {
  const rand = Math.random();
  if (rand < 1 / 3) return Math.floor(Math.random() * 20) + 41; // 41-60
  if (rand < 2 / 3) return Math.floor(Math.random() * 20) + 61; // 61-80
  return Math.floor(Math.random() * 20) + 81; // 81-100
};

const determineFortuneState = (score: number): FortuneLevel => {
  if (score >= 81) return 'positive';
  if (score >= 61) return 'neutral';
  return 'negative';
};

const generateFortuneCardInfo = (
  fortuneState: FortuneLevel
): Record<FortuneCardType, FortuneCardItemType> => {
  return {
    crystal:
      CRYSTAL_BACKGROUNDS[fortuneState][
        Math.floor(Math.random() * CRYSTAL_BACKGROUNDS[fortuneState].length)
      ],
    props: LUCKY_PROPS[fortuneState][Math.floor(Math.random() * LUCKY_PROPS[fortuneState].length)],
    time: LUCKY_TIMES[fortuneState][Math.floor(Math.random() * LUCKY_TIMES[fortuneState].length)],
    place:
      LUCKY_PLACES[fortuneState][Math.floor(Math.random() * LUCKY_PLACES[fortuneState].length)],
  };
};

export const generatePersonaFortune = async (
  userInfo: UserInfoType,
  persona: string = 'original'
) => {
  // 랜덤 MBTI 타입 생성 (원래 타입이 없는 경우)
  const mbtiTypes = ['IN', 'EN', 'IS', 'ES'];
  const mbtiGroup =
    userInfo.mbti?.type.slice(0, 2) || mbtiTypes[Math.floor(Math.random() * mbtiTypes.length)];

  // 랜덤 빅파이브 생성 (없는 경우)
  const bigFive: BigFiveDataType = userInfo.bigFive || generateRandomBigFive();

  // 기본 점수 생성
  const scores = {
    fortune: generateBaseScore(),
    finance: generateBaseScore(),
    health: generateBaseScore(),
    love: generateBaseScore(),
  };

  const fortuneStates = {
    overall: determineFortuneState(scores.fortune),
    finance: determineFortuneState(scores.finance),
    health: determineFortuneState(scores.health),
    love: determineFortuneState(scores.love),
  };

  // 랜덤 이미지 선택
  const images = FORTUNE_IMAGES[fortuneStates.overall];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  // 랜덤 색상 선택 (openness 점수에 따라 풀 사이즈 조정)
  const colorPoolSize =
    bigFive.openness.score > 70 ? LUCKY_COLORS.length : Math.floor(LUCKY_COLORS.length / 2);
  const randomColor = LUCKY_COLORS[Math.floor(Math.random() * colorPoolSize)];

  const gender = userInfo.gender || 'female';

  return {
    fortune_content: {
      comprehensive_solution_summary: {
        content: await combineBlocks(
          'summary',
          fortuneStates.overall,
          mbtiGroup,
          undefined,
          undefined,
          gender,
          persona
        ),
        fortune_score: scores.fortune,
        finance_score: scores.finance,
        health_score: scores.health,
        love_score: scores.love,
        background_image_url: randomImage,
        lucky_color: {
          name: randomColor.name,
          hex: randomColor.hex,
        },
        lucky_number: String(Math.floor(Math.random() * 10) + 1),
        fortune_cards: generateFortuneCardInfo(fortuneStates.overall),
        personality_insights: {
          emotional_stability: Math.round(100 - bigFive.neuroticism.score),
          conscientiousness: Math.round(bigFive.conscientiousness.score),
          extraversion: Math.round(bigFive.extraversion.score),
          openness: Math.round(bigFive.openness.score),
          agreeableness: Math.round(bigFive.agreeableness.score),
        },
      },
      daily_fortune: await combineBlocks(
        'summary',
        fortuneStates.overall,
        mbtiGroup,
        undefined,
        undefined,
        gender,
        persona
      ),
      finance_solution: await combineBlocks(
        'finance',
        fortuneStates.finance,
        mbtiGroup,
        bigFive,
        undefined,
        gender,
        persona
      ),
      health_solution: await combineBlocks(
        'health',
        fortuneStates.health,
        undefined,
        undefined,
        undefined,
        gender,
        persona
      ),
      mind_solution: await combineBlocks(
        'mind',
        fortuneStates.overall,
        mbtiGroup,
        bigFive,
        undefined,
        gender,
        persona
      ),
      love_solution: await combineBlocks(
        'love',
        fortuneStates.love,
        mbtiGroup,
        undefined,
        undefined,
        gender,
        persona
      ),
      fashion_recommendation: await combineBlocks(
        'fashion',
        fortuneStates.overall,
        mbtiGroup,
        undefined,
        undefined,
        gender,
        persona
      ),
      meal_recommendation: await combineBlocks(
        'meal',
        fortuneStates.health,
        undefined,
        undefined,
        undefined,
        gender,
        persona
      ),
    },
  };
};
