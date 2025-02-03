import { PersonaType } from '../data/types';

export const getPersonaBlock = (
  type: string,
  persona: PersonaType,
  defaultPersona: PersonaType = 'original'
) => {
  try {
    // 선택된 페르소나의 블록 가져오기 시도
    const personaPath = `../../constants/dailytalk/blocks/${persona}/${type}Blocks`;
    return require(personaPath).default;
  } catch {
    // 실패시 기본 페르소나로 폴백
    const defaultPath = `../../constants/dailytalk/blocks/${defaultPersona}/${type}Blocks`;
    return require(defaultPath).default;
  }
};
