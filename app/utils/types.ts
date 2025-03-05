//app/memo/utils/types.ts
// 타입 정의

export interface MemoLabeling {
  category: string;
  keywords: string[];
  key_sentence: string;
}

export interface Profile {
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
}

export type UserInformation = {
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

export type SaveUserResponse = {
  success: boolean;
  error?: string;
};

export interface MemoState {
  expanded: boolean;
  showLabeling: boolean;
  showOriginal: boolean;
}

export interface Memo {
  id?: string;
  title: string;
  tweet_main: string;
  hashtags: string[];
  thread: string[];
  labeling: MemoLabeling;
  time: string;
  likes: number;
  retweets: number;
  replies: number;
  original_text?: string;
  original_url?: string;
  has_embedding?: boolean;
}

export interface NotificationType {
  message: string;
  type: 'success' | 'error';
}

export interface MemoEmbedding {
  id: string;
  embedding: number[];
  created_at: string;
  updated_at: string;
}
