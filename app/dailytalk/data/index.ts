// app/dailytalk/data/blocks/index.ts

import { Mood } from './types';
import { summaryBlocks } from '@/app/constants/dailytalk/blocks/original/summaryBlocks';
import { loveBlocks } from '@/app/constants/dailytalk/blocks/original/loveBlocks';
import { fashionBlocks } from '@/app/constants/dailytalk/blocks/original/fashionBlocks';
import { financeBlocks } from '@/app/constants/dailytalk/blocks/original/financeBlocks';
import { healthBlocks } from '@/app/constants/dailytalk/blocks/original/healthBlocks';
import { mealBlocks } from '@/app/constants/dailytalk/blocks/original/mealBlocks';
import { mindBlocks } from '@/app/constants/dailytalk/blocks/original/mindBlocks';

// original 블록들만 import

const FALLBACK_MESSAGE = 'Good Luck 알라뷰';

export const getRandomItem = <T>(array: T[] | undefined, fallback: T): T => {
  if (!array || array.length === 0) {
    return fallback;
  }
  return array[Math.floor(Math.random() * array.length)];
};

type BlockType = 'summary' | 'finance' | 'health' | 'love' | 'fashion' | 'meal' | 'mind';

const getPersonaBlock = async (persona: string, type: string) => {
  if (persona === 'original') return null;

  try {
    const module = await import(`@/app/constants/dailytalk/blocks/${persona}/${type}Blocks`).catch(
      () => null
    );
    //console.log('Loaded module:', module); // 모듈 내용 확인
    //console.log('Type:', type); // 타입 확인
    //console.log('Module type blocks:', module?.[`${type}Blocks`]); // 특정 블록 확인
    return module?.[`${type}Blocks`] || module;
  } catch (error) {
    console.log(`${persona} ${type} blocks not found, using original`);
    return null;
  }
};

export const combineBlocks = async (
  type: BlockType,
  mood: Mood,
  mbtiGroup?: string,
  bigFive?: any,
  riskAversion: string | undefined = undefined,
  gender: string = 'female',
  persona: string = 'original'
): Promise<string> => {
  let selectedBlocks;
  const effectiveRiskAversion = riskAversion || 'moderate';

  try {
    // 페르소나 블록 시도
    if (persona !== 'original') {
      const personaBlock = await getPersonaBlock(persona, type);
      if (personaBlock) {
        switch (type) {
          // MBTI 의존성 있는 블록들
          case 'summary':
          case 'love':
          case 'mind':
            selectedBlocks = personaBlock[mbtiGroup as 'IN' | 'EN' | 'IS' | 'ES']?.[mood];
            break;

          // 성별 구분 필요한 블록
          case 'fashion':
            selectedBlocks = personaBlock[gender === 'male' ? 'male' : 'female'][mood];
            break;

          // 투자성향 필요한 블록
          case 'finance':
            selectedBlocks =
              personaBlock[mood][
                effectiveRiskAversion as 'conservative' | 'moderate' | 'aggressive'
              ];
            break;

          // 단순 블록들
          case 'health':
          case 'meal':
            selectedBlocks = personaBlock[mood];
            break;

          default:
            selectedBlocks = personaBlock[mood];
            break;
        }
      }
    }

    // 페르소나 블록이 없으면 original 사용
    if (!selectedBlocks) {
      switch (type) {
        case 'summary':
          selectedBlocks = summaryBlocks[mbtiGroup as 'IN' | 'EN' | 'IS' | 'ES']?.[mood];
          break;
        case 'love':
          selectedBlocks = loveBlocks[mbtiGroup as 'IN' | 'EN' | 'IS' | 'ES']?.[mood];
          break;
        case 'mind':
          selectedBlocks = mindBlocks[mbtiGroup as 'IN' | 'EN' | 'IS' | 'ES']?.[mood];
          break;
        case 'fashion':
          selectedBlocks = fashionBlocks[gender === 'male' ? 'male' : 'female'][mood];
          break;
        case 'finance':
          selectedBlocks =
            financeBlocks[mood][
              effectiveRiskAversion as 'conservative' | 'moderate' | 'aggressive'
            ];
          break;
        case 'health':
          selectedBlocks = healthBlocks[mood];
          break;
        case 'meal':
          selectedBlocks = mealBlocks[mood];
          break;
      }
    }

    if (
      !selectedBlocks ||
      !selectedBlocks.intro?.length ||
      !selectedBlocks.main?.length ||
      !selectedBlocks.outro?.length
    ) {
      return FALLBACK_MESSAGE;
    }

    const intro = getRandomItem(selectedBlocks.intro, FALLBACK_MESSAGE);
    const main = getRandomItem(selectedBlocks.main, FALLBACK_MESSAGE);
    const outro = getRandomItem(selectedBlocks.outro, FALLBACK_MESSAGE);

    return `${intro}\n\n${main}\n\n${outro}`;
  } catch (error) {
    console.error('Error in combineBlocks:', error);
    return FALLBACK_MESSAGE;
  }
};
