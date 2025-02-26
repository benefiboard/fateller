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
}

export interface NotificationType {
  message: string;
  type: 'success' | 'error';
}
