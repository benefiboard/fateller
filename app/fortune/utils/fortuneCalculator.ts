// utils/fortuneCalculator.ts
import { businessFortune } from '../data/today/business_fortune';
import { healthFortune } from '../data/today/health_fortune';
import { loveFortune } from '../data/today/love_fortune';
import { moneyFortune } from '../data/today/money_fortune';
import { peopleFortune } from '../data/today/people_fortune';
import { totalFortune } from '../data/today/total_fortune';
import { FortuneGrade, FortuneResult, TotalFortune } from './types';
import {
  CRYSTAL_BACKGROUNDS,
  LUCKY_PROPS,
  LUCKY_TIMES,
  LUCKY_PLACES,
} from '../constants/fortuneData';
import { FORTUNE_IMAGES } from '../constants/fortuneImages';

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

// 등급별 확률과 점수 범위 정의
const FORTUNE_GRADES = {
  best: { probability: 15, scoreRange: { min: 95, max: 100 } },
  good: { probability: 30, scoreRange: { min: 85, max: 94 } },
  normal: { probability: 35, scoreRange: { min: 75, max: 84 } },
  bad: { probability: 15, scoreRange: { min: 65, max: 74 } },
  worst: { probability: 5, scoreRange: { min: 0, max: 64 } },
} as const;

// 에너지 레벨별 배율 정의
const ENERGY_MULTIPLIERS = {
  높음: 1.02,
  보통: 1.01,
  낮음: 0.95,
  없음: 1,
} as const;

// 확률에 따른 등급 결정
const determineGradeByProbability = (): FortuneGrade => {
  const random = Math.random() * 100;
  let accumulatedProbability = 0;

  for (const [grade, { probability }] of Object.entries(FORTUNE_GRADES)) {
    accumulatedProbability += probability;
    if (random <= accumulatedProbability) {
      return grade as FortuneGrade;
    }
  }

  return 'normal'; // 기본값
};

// 등급에 따른 점수 생성
const generateScoreByGrade = (grade: FortuneGrade): number => {
  const { min, max } = FORTUNE_GRADES[grade].scoreRange;
  // 99를 넘지 않도록 제한
  const adjustedMax = Math.min(max, 99);
  return Math.floor(Math.random() * (adjustedMax - min + 1)) + min;
};

// 최종 점수로 등급 판정
const getFinalGrade = (score: number): FortuneGrade => {
  if (score >= 95) return 'best';
  if (score >= 85) return 'good';
  if (score >= 75) return 'normal';
  if (score >= 65) return 'bad';
  return 'worst';
};

// 등급에 따른 랜덤 메시지 선택
const getRandomMessage = (grade: FortuneGrade, fortuneType: any) => {
  const messages = fortuneType[grade];
  return messages[Math.floor(Math.random() * messages.length)];
};

// 표준편차를 적용한 점수 생성
const generateScoreWithDeviation = (baseScore: number, deviation: number = 5): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

  let score = Math.round(baseScore + z * deviation);

  // 점수 범위를 0-99로 제한
  score = Math.max(0, Math.min(99, score));

  return score;
};

// 점수 생성 함수
const generateFortuneScore = (energyLevel?: keyof typeof ENERGY_MULTIPLIERS): number => {
  const initialGrade = determineGradeByProbability();
  let score = generateScoreByGrade(initialGrade);

  if (energyLevel) {
    score = Math.min(99, Math.round(score * ENERGY_MULTIPLIERS[energyLevel]));
  }

  return score;
};

// FortuneLevel 타입과 판단 함수 추가
type FortuneLevel = 'positive' | 'neutral' | 'negative';

const determineFortuneState = (score: number): FortuneLevel => {
  if (score >= 81) return 'positive';
  if (score >= 61) return 'neutral';
  return 'negative';
};

// 카드 정보 생성 함수 추가
const generateFortuneCardInfo = (fortuneState: FortuneLevel) => {
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

// 운세 결과 생성
export const calculateFortune = (
  energyLevel: keyof typeof ENERGY_MULTIPLIERS = '없음'
): TotalFortune => {
  // 총운 계산
  const totalScore = generateFortuneScore(energyLevel);
  const totalGrade = getFinalGrade(totalScore);

  // 세부 운세 계산 함수
  const generateFortuneResult = (fortuneType: any): FortuneResult => {
    // 총운을 기준으로 표준편차를 적용하여 세부 운세 점수 생성
    const score = generateScoreWithDeviation(totalScore);
    const grade = getFinalGrade(score);
    return {
      score,
      grade,
      message: getRandomMessage(grade, fortuneType),
    };
  };

  // 기본 결과 생성
  const basicResult = {
    total: {
      score: totalScore,
      grade: totalGrade,
      message: getRandomMessage(totalGrade, totalFortune),
    },
    money: generateFortuneResult(moneyFortune),
    love: generateFortuneResult(loveFortune),
    business: generateFortuneResult(businessFortune),
    health: generateFortuneResult(healthFortune),
    people: generateFortuneResult(peopleFortune),
  };

  // 추가 데이터 생성
  const fortuneState = determineFortuneState(totalScore);
  const randomImage =
    FORTUNE_IMAGES[fortuneState][Math.floor(Math.random() * FORTUNE_IMAGES[fortuneState].length)];
  const randomColor = LUCKY_COLORS[Math.floor(Math.random() * LUCKY_COLORS.length)];

  // 최종 결과 반환
  return {
    ...basicResult,
    background_image_url: randomImage.url,
    background_image_description: randomImage.description,
    lucky_color: randomColor,
    lucky_number: String(Math.floor(Math.random() * 99) + 1),
    fortune_cards: generateFortuneCardInfo(fortuneState),
  };
};
