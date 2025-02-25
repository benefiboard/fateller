'use client';

import React, { useState } from 'react';
import { Brain, Send, Copy, ChevronDown, ChevronUp, ExternalLink, Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/app/store/userStore';

import createSupabaseBrowserClient from '@/lib/supabse/client';
import { toast } from 'sonner';

type AnalysisStep = 'initial' | 'analyzing' | 'complete';

// 기본 카드 인터페이스 (부모와 자식 카드 모두에 적용)
interface CardData {
  title: string;
  content: string;
  keywords: string[];
  type: 'parent' | 'child';
}

// 부모 카드 추가 속성
interface ParentCardData extends CardData {
  type: 'parent';
  category?: {
    main?: string;
    sub?: string;
  };
  key_sentence?: string;
  document_type?: 'simple' | 'complex' | 'article';
}

// 자식 카드 추가 속성
interface ChildCardData extends CardData {
  type: 'child';
}

// 중심 아이디어 (부모-자식 카드 연결)
interface CenterIdea {
  content: string;
  linked: boolean;
  parent_card_index: number; // 인덱스 기반으로 변경
  child_card_index: number; // 인덱스 기반으로 변경
}

// API 응답 인터페이스
interface AnalysisResult {
  parent_card: ParentCardData;
  child_cards: ChildCardData[];
  center_ideas: CenterIdea[];
}

const BrainLabelingDemo = () => {
  // 상태 관리
  const [step, setStep] = useState<AnalysisStep>('initial');
  const [inputText, setInputText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedIdeas, setExpandedIdeas] = useState<Record<number, boolean>>({});

  const currentUser = useUserStore((state) => state.currentUser);
  const supabase = createSupabaseBrowserClient();

  const user_id = currentUser?.id || '';
  console.log(user_id);

  // 아이디어 확장/축소 토글 (인덱스 기반)
  const toggleIdea = (index: number) => {
    setExpandedIdeas((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // 인덱스로 자식 카드 찾기
  const findChildCardByIndex = (index: number): ChildCardData | undefined => {
    return analysisResult?.child_cards[index];
  };

  // Supabase에 저장하는 함수
  const saveToSupabase = async () => {
    if (!analysisResult || !user_id) {
      toast.error('저장할 데이터가 없거나 로그인 상태가 아닙니다.');
      return;
    }

    try {
      setIsSaving(true);

      // 1. 원문 저장
      const { data: originalTextData, error: originalTextError } = await supabase
        .from('original_texts')
        .insert({
          user_id,
          content: inputText,
        })
        .select()
        .single();

      if (originalTextError) throw originalTextError;

      const original_text_id = originalTextData.id;

      // 2. 부모 카드 저장
      const { data: parentCardData, error: parentCardError } = await supabase
        .from('cards')
        .insert({
          user_id,
          original_text_id,
          title: analysisResult.parent_card.title,
          content: analysisResult.parent_card.content,
          keywords: analysisResult.parent_card.keywords,
          type: 'parent',
          category_main: analysisResult.parent_card.category?.main,
          category_sub: analysisResult.parent_card.category?.sub,
          key_sentence: analysisResult.parent_card.key_sentence,
          document_type: analysisResult.parent_card.document_type,
        })
        .select()
        .single();

      if (parentCardError) throw parentCardError;

      const parent_id = parentCardData.id;

      // 3. 자식 카드와 중심 아이디어 저장
      if (analysisResult.child_cards.length > 0) {
        // 모든 자식 카드를 저장하기 위한 배열
        const childCardsToInsert = analysisResult.child_cards.map((childCard, index) => {
          // 연결된 중심 아이디어 찾기
          const relatedIdea = analysisResult.center_ideas.find(
            (idea) => idea.child_card_index === index
          );

          return {
            user_id,
            original_text_id,
            title: childCard.title,
            content: childCard.content,
            keywords: childCard.keywords,
            type: 'child',
            parent_id,
            category_main: analysisResult.parent_card.category?.main, // 부모 카테고리 상속
            category_sub: analysisResult.parent_card.category?.sub, // 부모 카테고리 상속
            center_idea: relatedIdea?.content || '',
            is_linked: relatedIdea?.linked || false,
            display_order: index, // 순서 유지
          };
        });

        // 한 번의 요청으로 모든 자식 카드 저장
        const { error: childCardsError } = await supabase.from('cards').insert(childCardsToInsert);

        if (childCardsError) throw childCardsError;
      }

      toast.success('메모가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('Supabase 저장 오류:', error);
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 메모 분석 함수
  const analyzeMemo = async () => {
    if (!inputText.trim()) {
      setError('메모 내용을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setStep('analyzing');
      setError(null);

      // API 요청 바디 생성
      const requestBody = {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `넌 메모 분석 전문가야.
          주어진 메모에서 핵심을 파악해 나중에 쉽게 찾아보고 활용할 수 있게 정리해줘.

          방법 : 전체내용을 부분별로 나눈다. 부분별로 나눈 내용이 자식카드나 중심아이디어들이 된다. 부분별로 나눈 내용들의 합이 부모카드가 된다.
        
          
          카테고리 옵션:
          도서관 분류-듀이 십진분류법((Dewey Decimal Classification, DDC)를 이용하여 분류
          
          반드시 다음 JSON 응답 형식을 정확히 따라줘:
          {
             "parent_card": {
                "title": "나중에 찾기 쉽도록 직관적이고 구체적인 제목",
                "content": "부모 카드의 내용 요약",
                "keywords": ["구체적_키워드1", "구체적_키워드2", "구체적_키워드3"],
                "type": "parent",
                "category": {
                   "main": "주 카테고리",
                   "sub": "하위 카테고리"
                },
                "key_sentence": "메모의 핵심을 담은 한 문장 요약",
                "document_type": "simple|complex|article"
             },
             "child_cards": [
                {
                   "title": "자식 카드 1 제목",
                   "content": "자식 카드 1 내용 (2-3문장)",
                   "key_sentence": "자식 카드 1의 핵심을 담은 한 문장 요약",
                   "keywords": ["키워드1", "키워드2", "키워드3"],
                   "type": "child"
                },
                // 추가 자식 카드들...
             ],
             "center_ideas": [
                {
                   "content": "중심 아이디어 1의 내용",
                   "linked": true,
                   "parent_card_index": 0,
                   "child_card_index": 0
                },
                // 추가 중심 아이디어들...
             ]
          }
          
          단순 메모(simple)인 경우 center_ideas는 빈 배열([])로 반환하고 child_cards도 빈 배열([])로 반환해.
          복합 생각(complex)인 경우 각 중심 아이디어마다 child_card_index는 0부터 시작하는 배열 인덱스를 사용하여 자식 카드를 연결해야 해.
          각 자식 카드는 대응하는 중심 아이디어에 집중해 독립적으로도 이해할 수 있어야 해.`,
          },
          {
            role: 'user',
            content: `다음 메모를 분석하고 JSON 형식으로 응답해주세요:
            
${inputText}`,
          },
        ],
        max_tokens: 5000,
        temperature: 0.7,
        response_format: { type: 'json_object' },
      };

      // 요청 바디를 콘솔에 출력
      console.log('API 요청:', JSON.stringify(requestBody, null, 2));

      // 실제 API 호출
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      // 전체 응답을 콘솔에 출력
      console.log('API 응답:', JSON.stringify(data, null, 2));

      // 원시 응답 저장
      setRawResponse(JSON.stringify(data, null, 2));

      if (!data.choices || !data.choices[0]) {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }

      // 파싱 시도
      try {
        const result = JSON.parse(data.choices[0].message.content);
        console.log('파싱된 결과:', result);
        setAnalysisResult(result);
        setStep('complete');

        // 모든 중심 아이디어를 기본적으로 접힌 상태로 설정
        if (result.center_ideas && result.center_ideas.length > 0) {
          const initialExpandState: Record<number, boolean> = {};
          result.center_ideas.forEach((idea: CenterIdea, index: number) => {
            initialExpandState[index] = false;
          });
          setExpandedIdeas(initialExpandState);
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.log('파싱 실패한 원본 텍스트:', data.choices[0].message.content);
        setError('API 응답을 파싱하는 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
        setStep('initial');
      }
    } catch (error) {
      console.error('API 요청 오류:', error);
      setError('메모 분석 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
      setStep('initial');
    } finally {
      setIsLoading(false);
    }
  };

  // 복사 기능
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 로딩 애니메이션 컴포넌트
  const LoadingAnimation = () => (
    <div className="flex items-center justify-center my-8">
      <div className="relative w-16 h-16">
        <div className="absolute w-16 h-16 border-4 border-indigo-300 rounded-full animate-ping opacity-75"></div>
        <div className="absolute w-16 h-16 border-4 border-indigo-500 rounded-full animate-pulse"></div>
        <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-8 h-8" />
      </div>
    </div>
  );

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
  const ChildCardComponent = ({
    childCard,
    centerIdea,
  }: {
    childCard: ChildCardData;
    centerIdea: CenterIdea;
  }) => {
    return (
      <Card className="border border-indigo-100 mt-2 shadow-sm">
        <CardHeader className="py-3 px-4 bg-indigo-50/50">
          <CardTitle className="text-sm font-medium">{childCard.title}</CardTitle>
        </CardHeader>
        <CardContent className="py-3 px-4">
          <p className="text-sm text-gray-600 mb-3">{childCard.content}</p>

          <div className="flex flex-wrap gap-1">
            {childCard.keywords.map((keyword, idx) => (
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 text-indigo-600">
            <Brain className="w-8 h-8" /> BrainLabeling
          </h1>
          <p className="text-gray-600 mt-2">
            생각은 자동으로 정리됩니다. 당신은 그저 저장만 하세요.
          </p>
        </div>

        {/* 메인 콘텐츠 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl font-bold">메모 분석</CardTitle>
            <CardDescription>분석하고자 하는 메모, 생각, 정보를 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <textarea
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="여기에 메모 내용을 입력하세요..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isLoading}
                ></textarea>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>오류</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading && <LoadingAnimation />}

              {!isLoading && step === 'complete' && analysisResult && (
                <div className="mt-6">
                  <Tabs defaultValue="main-card" className="w-full">
                    <TabsList className="w-full grid grid-cols-3">
                      <TabsTrigger value="main-card">메인 카드</TabsTrigger>
                      <TabsTrigger value="child-cards">자식 카드</TabsTrigger>
                      <TabsTrigger value="json-data">JSON 데이터</TabsTrigger>
                    </TabsList>

                    {/* 메인 카드 탭 */}
                    <TabsContent value="main-card">
                      <div className="p-4 bg-white border border-gray-200 rounded-md">
                        <div className="space-y-3">
                          {/* 카테고리 - undefined 체크 추가 */}
                          {analysisResult.parent_card.category && (
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  (analysisResult.parent_card.category.main &&
                                    categoryColors[analysisResult.parent_card.category.main]) ||
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {analysisResult.parent_card.category.main || '미분류'} &gt;{' '}
                                {analysisResult.parent_card.category.sub || '미분류'}
                              </span>

                              {analysisResult.parent_card.document_type && (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    analysisResult.parent_card.document_type === 'simple'
                                      ? 'bg-blue-100 text-blue-800'
                                      : analysisResult.parent_card.document_type === 'complex'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {analysisResult.parent_card.document_type === 'simple'
                                    ? '단순 메모'
                                    : analysisResult.parent_card.document_type === 'complex'
                                    ? '복합 생각'
                                    : '기사/자료'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 제목 */}
                          {analysisResult.parent_card.title && (
                            <h4 className="text-lg font-semibold">
                              {analysisResult.parent_card.title}
                            </h4>
                          )}

                          {/* 핵심 문장 */}
                          {analysisResult.parent_card.key_sentence && (
                            <p className="text-sm text-gray-700 italic">
                              "{analysisResult.parent_card.content}"
                            </p>
                          )}

                          {/* 키워드 */}
                          {analysisResult.parent_card.keywords &&
                            analysisResult.parent_card.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {analysisResult.parent_card.keywords.map((keyword, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    # {keyword}
                                  </span>
                                ))}
                              </div>
                            )}

                          {/* 중심 아이디어 */}
                          {analysisResult.center_ideas &&
                            analysisResult.center_ideas.length > 0 && (
                              <div className="mt-4 border-t border-gray-100 pt-4">
                                <h5 className="text-sm font-semibold mb-2">중심 아이디어:</h5>
                                <ul className="space-y-2">
                                  {analysisResult.center_ideas.map((idea, idx) => {
                                    const childCard = findChildCardByIndex(idea.child_card_index);
                                    if (!childCard) return null;

                                    return (
                                      <li key={idx} className="flex items-start">
                                        <div
                                          className={`flex-shrink-0 h-4 w-4 mt-0.5 rounded-full ${
                                            idea.linked ? 'bg-green-400' : 'bg-gray-300'
                                          }`}
                                        ></div>
                                        <div className="ml-2 text-sm text-gray-600 flex flex-col">
                                          <div className="flex items-center">
                                            <p>{idea.content}</p>
                                            <button
                                              onClick={() => toggleIdea(idx)}
                                              className="ml-2 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                                            >
                                              {expandedIdeas[idx] ? (
                                                <ChevronUp size={16} />
                                              ) : (
                                                <ChevronDown size={16} />
                                              )}
                                            </button>
                                          </div>

                                          {expandedIdeas[idx] && childCard && (
                                            <div className="mt-2 pl-2 border-l-2 border-indigo-100">
                                              <ChildCardComponent
                                                childCard={childCard}
                                                centerIdea={idea}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* 자식 카드 탭 */}
                    <TabsContent value="child-cards">
                      {analysisResult.child_cards && analysisResult.child_cards.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisResult.child_cards.map((childCard, childIdx) => {
                            // 이 자식 카드와 연결된 중심 아이디어 찾기
                            const relatedIdea = analysisResult.center_ideas.find(
                              (idea) => idea.child_card_index === childIdx
                            );

                            if (!relatedIdea) return null;

                            return (
                              <Card key={childIdx} className="overflow-hidden">
                                <CardHeader
                                  className={`py-3 px-4 ${
                                    relatedIdea.linked ? 'bg-green-50' : 'bg-gray-50'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <CardTitle className="text-sm font-medium">
                                      {childCard.title}
                                    </CardTitle>
                                    {relatedIdea.linked && (
                                      <span className="inline-flex items-center">
                                        <ExternalLink size={14} className="text-green-500" />
                                      </span>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="py-3 px-4">
                                  <p className="text-sm text-gray-600 mb-3">{childCard.content}</p>

                                  <div className="flex flex-wrap gap-1">
                                    {childCard.keywords.map((keyword, kidx) => (
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
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          자식 카드가 없습니다. 복합 생각 메모를 분석하면 자식 카드가 생성됩니다.
                        </div>
                      )}
                    </TabsContent>

                    {/* JSON 데이터 탭 */}
                    <TabsContent value="json-data">
                      <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto">
                        <div className="flex justify-end mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(JSON.stringify(analysisResult, null, 2))}
                            className="flex items-center gap-1 text-xs text-gray-300 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? '복사됨!' : '복사'}
                          </Button>
                        </div>
                        <pre className="text-xs">{JSON.stringify(analysisResult, null, 2)}</pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* API 오류 디버깅용 응답 표시 */}
              {rawResponse && error && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-semibold">API 원본 응답 (디버깅용)</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(rawResponse)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Copy className="w-3 h-3" />
                      복사
                    </Button>
                  </div>
                  <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto max-h-60">
                    <pre className="text-xs">{rawResponse}</pre>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
              onClick={analyzeMemo}
              disabled={isLoading || !inputText.trim()}
            >
              <Send className="w-5 h-5" />
              {isLoading ? '분석 중...' : '메모 분석하기'}
            </Button>

            {analysisResult && step === 'complete' && (
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                onClick={saveToSupabase}
                disabled={isSaving || !user_id}
              >
                <Save className="w-5 h-5" />
                {isSaving ? '저장 중...' : '메모 저장하기'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default BrainLabelingDemo;
