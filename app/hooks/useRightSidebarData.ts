// app/hooks/useRightSidebarData.ts
import { useState, useEffect } from 'react';
import { useUserStore } from '@/app/store/userStore';
import createSupabaseBrowserClient from '@/lib/supabse/client';
import { formatTimeAgo } from '../utils/formatters';

// 반환 데이터 타입 정의
interface SidebarData {
  totalMemos: number;
  recentWeekMemos: number;
  categoryStats: { category: string; count: number }[];
  recentMemos: {
    id: string;
    title: string;
    category: string;
    time: string;
  }[];
  usedCategories: string[];
}

export function useRightSidebarData() {
  const [sidebarData, setSidebarData] = useState<SidebarData>({
    totalMemos: 0,
    recentWeekMemos: 0,
    categoryStats: [],
    recentMemos: [],
    usedCategories: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useUserStore((state) => state.currentUser);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    async function fetchSidebarData() {
      if (!currentUser?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        // 1. 총 메모 수 조회
        const { count: totalCount, error: countError } = await supabase
          .from('memos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id);

        if (countError) throw countError;

        // 2. 최근 7일 메모 수 조회
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const { count: recentCount, error: recentError } = await supabase
          .from('memos')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', currentUser.id)
          .gte('created_at', lastWeek.toISOString());

        if (recentError) throw recentError;

        // 3. 카테고리별 통계
        const { data: categoryData, error: categoryError } = await supabase
          .from('memos')
          .select('category')
          .eq('user_id', currentUser.id);

        if (categoryError) throw categoryError;

        // 카테고리별 개수 계산
        const categoryCounts: Record<string, number> = {};
        categoryData.forEach((memo) => {
          const category = memo.category || '미분류';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        // 카테고리 통계 배열로 변환 및 정렬
        const categoryStats = Object.entries(categoryCounts)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count);

        // 사용 중인 카테고리 목록 (중복 제거) - Set 대신 Array 메서드 사용
        const categorySet: string[] = [];
        categoryData.forEach((memo) => {
          if (memo.category && !categorySet.includes(memo.category)) {
            categorySet.push(memo.category);
          }
        });

        // 4. 최근 메모 3개
        const { data: recentMemos, error: recentMemosError } = await supabase
          .from('memos')
          .select('id, title, category, created_at')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (recentMemosError) throw recentMemosError;

        // 시간 포맷팅
        const formattedRecentMemos = recentMemos.map((memo) => ({
          id: memo.id,
          title: memo.title,
          category: memo.category || '미분류',
          time: formatTimeAgo(new Date(memo.created_at)),
        }));

        // 모든 데이터 설정
        setSidebarData({
          totalMemos: totalCount || 0,
          recentWeekMemos: recentCount || 0,
          categoryStats,
          recentMemos: formattedRecentMemos,
          usedCategories: categorySet,
        });
      } catch (err) {
        console.error('사이드바 데이터 로딩 오류:', err);
        // 에러 객체 타입 처리
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('알 수 없는 오류가 발생했습니다');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchSidebarData();

    // 5분마다 데이터 갱신 (선택적)
    const refreshInterval = setInterval(fetchSidebarData, 5 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [currentUser?.id]);

  return { ...sidebarData, isLoading, error };
}

export default useRightSidebarData;
