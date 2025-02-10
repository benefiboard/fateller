export type SajuInformation = {
  name: string;
  gender: '남자' | '여자';
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  birthHour: string;
  birthMinute: string;
  isTimeUnknown?: boolean;
  specialNumber?: number;
};

export interface DetailFortuneData {
  male: {
    special1: string;
    special2: string;
    special3: string;
  };
  female: {
    special1: string;
    special2: string;
    special3: string;
  };
}

export interface FortuneData {
  lifelong_fortune: string;
  major_fortune: string;
  prime_time: string;
  caution_period: string;
  health_fortune: string;
  early_years: string;
  middle_age: string;
  senior_years: string;
  spouse_fortune: string;
  wealth_fortune: string;
  career_fortune: string;
  children_fortune: string;
}

export type FortuneType = 'business' | 'health' | 'love' | 'money';
