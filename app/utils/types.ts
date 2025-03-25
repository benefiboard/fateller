//app/utils/types.ts
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
  verified?: boolean;
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

export interface MemoStats {
  likes: number;
  retweets: number;
  replies: number;
}

export interface Memo {
  id?: string;
  title: string;
  tweet_main: any;
  hashtags: string[];
  thread: string[];
  labeling: MemoLabeling;
  time: string;
  likes: number;
  liked?: boolean; // 좋아요 상태 추가
  stats?: MemoStats; // 통계 정보 추가
  retweets: number;
  replies: number;
  original_text?: string;
  original_url?: string;
  original_title?: string;
  original_image?: string;
  has_embedding?: boolean;
  purpose?: string;
  source_id?: string; // 추가: 소스 ID 연결
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

export interface MemoContentProps {
  memo: Memo;
  expanded: boolean;
  showLabeling: boolean;
  showOriginal: boolean;
  onToggleThread: () => void;
  onToggleLabeling: () => void;
  onToggleOriginal: () => void;
  isVisible?: boolean; // 메모가 화면에 보이는지 여부
  hideImageInBlog?: boolean;
}

export interface MemoItemProps {
  memo: Memo;
  profile: Profile;
  memoState: {
    expanded: boolean;
    showLabeling: boolean;
    showOriginal: boolean;
  };
  onToggleThread: (id: string) => void;
  onToggleLabeling: (id: string) => void;
  onToggleOriginal: (id: string) => void;
  onEdit: (memo: Memo) => void;
  onAnalyze: (memo: Memo) => void;
  onDelete: (id: string) => void;
  onShare?: (memo: Memo) => void; // 공유 기능 추가
  onFindRelated?: (id: string) => void; // 관련 메모 찾기 기능 추가
  onGenerateInsight?: (id: string) => void; // 인사이트 생성 기능 추가
}

// 블로그 게시물 관련 타입
export interface BlogPost {
  category: string;
  id: string;
  source_id: string;
  summary_id: string;
  slug: string;
  published: boolean;
  featured: boolean;
  view_count: number;
  created_at: string;
  published_at: string;
  source?: ContentSource;
  summary?: ContentSummary;
}

// 원본 콘텐츠 타입
export interface ContentSource {
  id: string;
  title: string | null;
  canonical_url: string | null;
  source_type: string | null;
  image_url: string | null;
  content: string;
  created_at: string;
  access_count?: number;
}

// 요약 콘텐츠 타입
export interface ContentSummary {
  id: string;
  source_id: string;
  title: string;
  category: string;
  key_sentence: string;
  keywords: string[];
  purpose: string;
  tweet_main: any;
  thread: string[];
  created_at: string;
  embedding_id?: string | null;
}

// 블로그 카테고리 타입
export interface BlogCategory {
  category: string;
  count: number;
}
