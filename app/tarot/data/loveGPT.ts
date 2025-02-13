// app/tarot/data/love.ts

import { BaseCardInfo } from '../types/tarot';

export const LOVE_TAROT_CARDS: BaseCardInfo[] = [
  {
    id: 'fool',
    name: {
      ko: '광대',
      en: 'THE FOOL',
    },
    imageUrl: '/tarot/fool.webp',
    keywords: ['#새로운사랑', '#설렘', '#자유로운사랑'],
  },
  {
    id: 'magician',
    name: {
      ko: '마법사',
      en: 'THE MAGICIAN',
    },
    imageUrl: '/tarot/magician.webp',
    keywords: ['#적극적인사랑', '#자신감', '#성취'],
  },
  {
    id: 'highpriestess',
    name: {
      ko: '여사제',
      en: 'THE HIGH PRIESTESS',
    },
    imageUrl: '/tarot/highpriestess.webp',
    keywords: ['#직관', '#내면의지혜', '#신비로움'],
  },
  {
    id: 'empress',
    name: {
      ko: '여황제',
      en: 'THE EMPRESS',
    },
    imageUrl: '/tarot/empress.webp',
    keywords: ['#성숙한사랑', '#포용력', '#풍요'],
  },
  {
    id: 'emperor',
    name: {
      ko: '황제',
      en: 'THE EMPEROR',
    },
    imageUrl: '/tarot/emperor.webp',
    keywords: ['#책임감', '#안정', '#리더십'],
  },
  {
    id: 'hierophant',
    name: {
      ko: '교황',
      en: 'THE HIEROPHANT',
    },
    imageUrl: '/tarot/hierophant.webp',
    keywords: ['#전통', '#가치관', '#조화'],
  },
  {
    id: 'lovers',
    name: {
      ko: '연인들',
      en: 'THE LOVERS',
    },
    imageUrl: '/tarot/lovers.webp',
    keywords: ['#운명적사랑', '#선택', '#결합'],
  },
  {
    id: 'chariot',
    name: {
      ko: '전차',
      en: 'THE CHARIOT',
    },
    imageUrl: '/tarot/chariot.webp',
    keywords: ['#의지', '#승리', '#진전'],
  },
  {
    id: 'strength',
    name: {
      ko: '힘',
      en: 'STRENGTH',
    },
    imageUrl: '/tarot/strength.webp',
    keywords: ['#내면의힘', '#인내', '#성숙'],
  },
  {
    id: 'hermit',
    name: {
      ko: '은둔자',
      en: 'THE HERMIT',
    },
    imageUrl: '/tarot/hermit.webp',
    keywords: ['#자아성찰', '#고독', '#내면탐구'],
  },
  {
    id: 'wheelOfFortune',
    name: {
      ko: '운명의 수레바퀴',
      en: 'WHEEL OF FORTUNE',
    },
    imageUrl: '/tarot/wheel-of-fortune.webp',
    keywords: ['#변화', '#기회', '#운명'],
  },
  {
    id: 'justice',
    name: {
      ko: '정의',
      en: 'JUSTICE',
    },
    imageUrl: '/tarot/justice.webp',
    keywords: ['#균형', '#공정', '#진실'],
  },
  {
    id: 'hangedMan',
    name: {
      ko: '매달린 사람',
      en: 'THE HANGED MAN',
    },
    imageUrl: '/tarot/hanged-man.webp',
    keywords: ['#인내', '#희생', '#기다림'],
  },
  {
    id: 'death',
    name: {
      ko: '죽음',
      en: 'DEATH',
    },
    imageUrl: '/tarot/death.webp',
    keywords: ['#끝', '#변화', '#이별'],
  },
  {
    id: 'temperance',
    name: {
      ko: '절제',
      en: 'TEMPERANCE',
    },
    imageUrl: '/tarot/temperance.webp',
    keywords: ['#균형', '#조화', '#절제'],
  },
  {
    id: 'devil',
    name: {
      ko: '악마',
      en: 'THE DEVIL',
    },
    imageUrl: '/tarot/devil.webp',
    keywords: ['#집착', '#유혹', '#중독'],
  },
  {
    id: 'tower',
    name: {
      ko: '탑',
      en: 'THE TOWER',
    },
    imageUrl: '/tarot/tower.webp',
    keywords: ['#파괴', '#충격', '#급변'],
  },
  {
    id: 'star',
    name: {
      ko: '별',
      en: 'THE STAR',
    },
    imageUrl: '/tarot/star.webp',
    keywords: ['#희망', '#치유', '#영감'],
  },
  {
    id: 'moon',
    name: {
      ko: '달',
      en: 'THE MOON',
    },
    imageUrl: '/tarot/moon.webp',
    keywords: ['#불안', '#기만', '#환상'],
  },
  {
    id: 'sun',
    name: {
      ko: '태양',
      en: 'THE SUN',
    },
    imageUrl: '/tarot/sun.webp',
    keywords: ['#행복', '#성공', '#순수'],
  },
  {
    id: 'judgement',
    name: {
      ko: '심판',
      en: 'JUDGEMENT',
    },
    imageUrl: '/tarot/judgement.webp',
    keywords: ['#각성', '#재회', '#부활'],
  },
  {
    id: 'world',
    name: {
      ko: '세계',
      en: 'THE WORLD',
    },
    imageUrl: '/tarot/world.webp',
    keywords: ['#완성', '#성취', '#조화'],
  },
];

// 카드 ID로 카드 정보 찾기
export const getLoveCardById = (id: string): BaseCardInfo | undefined => {
  return LOVE_TAROT_CARDS.find((card) => card.id === id);
};

// 랜덤 해석 선택
