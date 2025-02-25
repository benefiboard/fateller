//app>brain>read>page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Brain, ChevronDown, ChevronUp, ExternalLink, Search, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/app/store/userStore';
import createSupabaseBrowserClient from '@/lib/supabse/client';
import { toast } from 'sonner';
import Link from 'next/link';

// 기본 카드 인터페이스 (부모와 자식 카드 모두에 적용)
interface CardData {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  type: 'parent' | 'child';
  category_main?: string;
  category_sub?: string;
  created_at: string;
}

// 부모 카드 추가 속성
interface ParentCardData extends CardData {
  type: 'parent';
  key_sentence?: string;
  document_type?: 'simple' | 'complex' | 'article';
}

// 자식 카드 추가 속성
interface ChildCardData extends CardData {
  type: 'child';
  parent_id: string;
  center_idea?: string;
  is_linked?: boolean;
  display_order: number;
}

interface CardDataWithChildren extends ParentCardData {
  children: ChildCardData[];
}

const RecentCardsPage = () => {
  const [cards, setCards] = useState<CardDataWithChildren[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardDataWithChildren | null>(null);
  const [expandedIdeas, setExpandedIdeas] = useState<Record<string, boolean>>({});

  const currentUser = useUserStore((state) => state.currentUser);
  const supabase = createSupabaseBrowserClient();

  const user_id = currentUser?.id || '';

  // 카드 데이터 로드
  const fetchRecentCards = async () => {
    if (!user_id) {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 부모 카드 불러오기 (최근 5개)
      const { data: parentCards, error: parentError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user_id)
        .eq('type', 'parent')
        .order('created_at', { ascending: false })
        .limit(5);

      if (parentError) throw parentError;

      if (!parentCards || parentCards.length === 0) {
        setCards([]);
        setIsLoading(false);
        return;
      }

      // 부모 카드의 ID들을 추출
      const parentIds = parentCards.map((card) => card.id);

      // 자식 카드 불러오기
      const { data: childCards, error: childError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user_id)
        .eq('type', 'child')
        .in('parent_id', parentIds)
        .order('display_order', { ascending: true });

      if (childError) throw childError;

      // 부모 카드와 자식 카드를 결합
      const cardsWithChildren = parentCards.map((parent) => {
        const children = childCards.filter((child) => child.parent_id === parent.id);
        return {
          ...parent,
          children,
        } as CardDataWithChildren;
      });

      setCards(cardsWithChildren);

      // 첫 번째 카드를 선택 상태로 설정
      if (cardsWithChildren.length > 0) {
        setSelectedCard(cardsWithChildren[0]);

        // 모든 중심 아이디어를 기본적으로 접힌 상태로 설정
        if (cardsWithChildren[0].children.length > 0) {
          const initialExpandState: Record<string, boolean> = {};
          cardsWithChildren[0].children.forEach((child) => {
            initialExpandState[child.id] = false;
          });
          setExpandedIdeas(initialExpandState);
        }
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      setError('카드를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 카드 선택
  const selectCard = (card: CardDataWithChildren) => {
    setSelectedCard(card);

    // 모든 중심 아이디어를 기본적으로 접힌 상태로 설정
    if (card.children.length > 0) {
      const initialExpandState: Record<string, boolean> = {};
      card.children.forEach((child) => {
        initialExpandState[child.id] = false;
      });
      setExpandedIdeas(initialExpandState);
    }
  };

  // 아이디어 확장/축소 토글
  const toggleIdea = (id: string) => {
    setExpandedIdeas((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 페이지 로드 시 데이터 불러오기
  useEffect(() => {
    fetchRecentCards();
  }, [user_id]);

  // 카테고리 색상 매핑
  const categoryColors: Record<string, string> = {
    '학습/공부': 'bg-blue-100 text-blue-800',
    '업무/프로젝트': 'bg-purple-100 text-purple-800',
    '영감/아이디어': 'bg-yellow-100 text-yellow-800',
    '문제해결/의사결정': 'bg-red-100 text-red-800',
    '리서치/조사': 'bg-green-100 text-green-800',
    '개인/일상': 'bg-orange-100 text-orange-800',
    '정보/자료': 'bg-gray-100 text-gray-800',
  };

  // 자식 카드 컴포넌트
  const ChildCardComponent = ({ childCard }: { childCard: ChildCardData }) => {
    return (
      <Card className="border border-indigo-100 mt-2 shadow-sm">
        <CardHeader className="py-3 px-4 bg-indigo-50/50">
          <CardTitle className="text-sm font-medium">{childCard.title}</CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <p className="text-sm text-gray-600 mb-3">{childCard.content}</p>

          <div className="flex flex-wrap gap-1">
            {childCard.keywords?.map((keyword, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                # {keyword}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-indigo-600">
              <Brain className="w-8 h-8" /> 내 메모 목록
            </h1>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>최근 메모</CardTitle>
                </CardHeader>
                <CardContent>
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="mb-4">
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-indigo-600">
              <Brain className="w-8 h-8" /> 내 메모 목록
            </h1>
          </div>
          <Card className="shadow-md bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">오류 발생</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{error}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={fetchRecentCards} className="bg-red-600 hover:bg-red-700 text-white">
                <RefreshCw className="w-4 h-4 mr-2" /> 다시 시도
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // 카드가 없는 경우
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-indigo-600">
              <Brain className="w-8 h-8" /> 내 메모 목록
            </h1>
          </div>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>메모가 없습니다</CardTitle>
              <CardDescription>
                아직 저장된 메모가 없습니다. 새 메모를 분석해보세요.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/analysis" passHref>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  새 메모 분석하기
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-indigo-600">
            <Brain className="w-8 h-8" /> 내 메모 목록
          </h1>
          <p className="text-gray-600 mt-2">최근 분석한 메모 목록입니다.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 메모 목록 */}
          <div className="lg:col-span-1">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl">최근 메모</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchRecentCards}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedCard?.id === card.id
                          ? 'bg-indigo-100 border-l-4 border-indigo-500'
                          : 'hover:bg-gray-100 border-l-4 border-transparent'
                      }`}
                      onClick={() => selectCard(card)}
                    >
                      <h3 className="font-medium text-gray-900 line-clamp-1">{card.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1">{card.content}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${
                            card.category_main && categoryColors[card.category_main]
                              ? categoryColors[card.category_main]
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {card.category_main || '미분류'}
                        </span>
                        <span>
                          {new Date(card.created_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/analysis" className="w-full" passHref>
                  <Button variant="outline" className="w-full">
                    새 메모 분석하기
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* 오른쪽 메모 상세 내용 */}
          <div className="lg:col-span-2">
            {selectedCard && (
              <Card className="shadow-md">
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedCard.category_main && categoryColors[selectedCard.category_main]
                          ? categoryColors[selectedCard.category_main]
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {selectedCard.category_main || '미분류'} &gt;{' '}
                      {selectedCard.category_sub || '미분류'}
                    </span>

                    {selectedCard.document_type && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          selectedCard.document_type === 'simple'
                            ? 'bg-blue-100 text-blue-800'
                            : selectedCard.document_type === 'complex'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {selectedCard.document_type === 'simple'
                          ? '단순 메모'
                          : selectedCard.document_type === 'complex'
                          ? '복합 생각'
                          : '기사/자료'}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-2xl">{selectedCard.title}</CardTitle>
                  {selectedCard.key_sentence && (
                    <p className="text-gray-700 italic mt-2">"{selectedCard.key_sentence}"</p>
                  )}
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full grid grid-cols-2">
                      <TabsTrigger value="overview">개요</TabsTrigger>
                      <TabsTrigger value="details">자식 카드</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-4">
                      <div className="space-y-4">
                        {/* 키워드 */}
                        {selectedCard.keywords && selectedCard.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {selectedCard.keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                              >
                                # {keyword}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 내용 */}
                        {/* <p className="text-gray-700 whitespace-pre-line">{selectedCard.content}</p> */}

                        {/* 중심 아이디어 */}
                        {selectedCard.children.length > 0 && (
                          <div className="mt-6 border-t border-gray-200 pt-4">
                            <h3 className="font-medium text-lg mb-3">중심 아이디어</h3>
                            <ul className="space-y-4">
                              {selectedCard.children.map((child) => (
                                <li key={child.id} className="flex items-start">
                                  <div
                                    className={`flex-shrink-0 h-2 w-2 mt-[6px] rounded-full ${
                                      child.is_linked ? 'bg-gray-600' : 'bg-gray-300'
                                    }`}
                                  ></div>
                                  <div className="ml-3 text-gray-700 flex flex-col">
                                    <div className="flex items-center">
                                      <p>{child.center_idea}</p>
                                      <button
                                        onClick={() => toggleIdea(child.id)}
                                        className="ml-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                                      >
                                        {expandedIdeas[child.id] ? (
                                          <ChevronUp size={16} />
                                        ) : (
                                          <ChevronDown size={16} />
                                        )}
                                      </button>
                                    </div>

                                    {expandedIdeas[child.id] && (
                                      <div className="mt-2 pl-2 border-l-2 border-indigo-100">
                                        <ChildCardComponent childCard={child} />
                                      </div>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="details">
                      {selectedCard.children.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {selectedCard.children.map((child) => (
                            <Card key={child.id} className="overflow-hidden">
                              <CardHeader
                                className={`py-3 px-4 ${
                                  child.is_linked ? 'bg-green-50' : 'bg-gray-50'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-sm font-medium">
                                    {child.title}
                                  </CardTitle>
                                  {child.is_linked && (
                                    <span className="inline-flex items-center">
                                      <ExternalLink size={14} className="text-green-500" />
                                    </span>
                                  )}
                                </div>
                              </CardHeader>
                              <CardContent className="py-3 px-4">
                                <p className="text-sm text-gray-600 mb-3">{child.content}</p>

                                <div className="flex flex-wrap gap-1">
                                  {child.keywords?.map((keyword, kidx) => (
                                    <span
                                      key={kidx}
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                    >
                                      # {keyword}
                                    </span>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-gray-500">자식 카드가 없습니다.</div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-gray-500">
                    생성일:{' '}
                    {new Date(selectedCard.created_at).toLocaleString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentCardsPage;
