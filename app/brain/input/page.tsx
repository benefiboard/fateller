'use client';

import React, { useState } from 'react';
import { Brain, Send, Copy, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
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

type AnalysisStep = 'initial' | 'analyzing' | 'complete';

interface ChildCard {
  title: string;
  content: string;
  keywords: string[];
}

interface CenterIdea {
  content: string;
  linked: boolean;
  child_card: ChildCard;
}

interface AnalysisResult {
  category?: {
    main?: string;
    sub?: string;
  };
  title?: string;
  keywords?: string[];
  key_sentence?: string;
  type?: string;
  center_ideas?: CenterIdea[];
}

const BrainLabelingDemo = () => {
  // 상태 관리
  const [step, setStep] = useState<AnalysisStep>('initial');
  const [inputText, setInputText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedIdeas, setExpandedIdeas] = useState<Record<number, boolean>>({});

  // 아이디어 확장/축소 토글
  const toggleIdea = (index: number) => {
    setExpandedIdeas((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
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
            content: `당신은 메모 분석 전문가입니다.
주어진 메모에서 핵심을 파악하여 나중에 쉽게 찾아보고 활용할 수 있도록 정리해주세요.

분석 단계:
1. 메모의 목적과 성격 파악
   - 작성 의도 이해
   - 핵심 내용 파악
   - 활용 목적 고려
   - 메모 유형 결정 (단순 메모, 복합 생각, 기사/자료)

2. 중요 요소 추출
   - 구체적이고 특징적인 키워드 3개 선정 (일반적 단어 지양)
   - 핵심 내용을 나타내는 직관적인 제목 생성
   - 메모의 핵심 문장 1개 선정 (단순 요약이 아닌 핵심 통찰 포함, 50자 이내)
   - 활용 목적에 맞는 카테고리 분류 (하위 카테고리까지 반드시 지정)

3. 복합 생각인 경우 중심 아이디어 추출 및 자식 카드 생성
   - 메모에서 2-5개의 중심 아이디어(핵심 개념) 추출
   - 각 중심 아이디어가 다른 생각들과 연결 가능성이 있는지 판단
   - 중심 아이디어는 표면적 서술이 아닌 근본적인 개념이나 통찰 포함
   - 최소 하나는 메모에서 언급된 중요한 비교나 대조를 포함
   - 각 중심 아이디어마다 별도의 자식 카드 생성 (제목, 내용, 키워드 포함)

카테고리 옵션:
1. 학습/공부
   - 강의/수업 내용
   - 책/아티클 요약
   - 개념/용어 정리
2. 업무/프로젝트
   - 회의/미팅 내용
   - 기획/아이디어
   - 할일/체크리스트
3. 영감/아이디어
   - 창작 아이디어
   - 참고할 내용
   - 흥미로운 발견
4. 문제해결/의사결정
   - 고민 정리
   - 대안 분석
   - 결정 사항
5. 리서치/조사
   - 시장/트렌드 조사
   - 제품/서비스 분석
   - 경쟁사 정보
6. 개인/일상
   - 생각/감정 기록
   - 일상 메모
   - 습관/루틴
7. 정보/자료
   - 연락처/주소
   - 제품/가격 정보
   - 참고 링크

반드시 다음 JSON 응답 형식을 정확히 따라주세요:
{
   "category": {
      "main": "주 카테고리",
      "sub": "하위 카테고리"
   },
   "title": "나중에 찾기 쉽도록 직관적이고 구체적인 제목",
   "keywords": ["구체적_키워드1", "구체적_키워드2", "구체적_키워드3"],
   "key_sentence": "메모의 핵심을 담은 한 문장 요약",
   "type": "simple|complex|article",
   "center_ideas": [
      {
         "content": "중심 아이디어 1의 내용",
         "linked": true,
         "child_card": {
            "title": "중심 아이디어 1에 대한 별도 제목",
            "content": "이 중심 아이디어에 대한 상세 설명 (2-3문장)",
            "keywords": ["키워드1", "키워드2", "키워드3"]
         }
      },
      {
         "content": "중심 아이디어 2의 내용",
         "linked": false,
         "child_card": {
            "title": "중심 아이디어 2에 대한 별도 제목",
            "content": "이 중심 아이디어에 대한 상세 설명 (2-3문장)",
            "keywords": ["키워드1", "키워드2", "키워드3"]
         }
      }
   ]
}

단순 메모(simple)인 경우 center_ideas는 빈 배열([])로 반환하세요.
복합 생각(complex)인 경우 각 중심 아이디어마다 반드시 child_card 객체를 포함해야 합니다.
각 자식 카드는 해당 중심 아이디어에 집중하여 독립적으로도 이해할 수 있어야 합니다.`,
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
          result.center_ideas.forEach((_: CenterIdea, index: number) => {
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
  const ChildCardComponent = ({ childCard }: { childCard: ChildCard }) => (
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
                          {analysisResult.category && (
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  (analysisResult.category.main &&
                                    categoryColors[analysisResult.category.main]) ||
                                  'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {analysisResult.category.main || '미분류'} &gt;{' '}
                                {analysisResult.category.sub || '미분류'}
                              </span>

                              {analysisResult.type && (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    analysisResult.type === 'simple'
                                      ? 'bg-blue-100 text-blue-800'
                                      : analysisResult.type === 'complex'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}
                                >
                                  {analysisResult.type === 'simple'
                                    ? '단순 메모'
                                    : analysisResult.type === 'complex'
                                    ? '복합 생각'
                                    : '기사/자료'}
                                </span>
                              )}
                            </div>
                          )}

                          {/* 제목 */}
                          {analysisResult.title && (
                            <h4 className="text-lg font-semibold">{analysisResult.title}</h4>
                          )}

                          {/* 핵심 문장 */}
                          {analysisResult.key_sentence && (
                            <p className="text-sm text-gray-700 italic">
                              "{analysisResult.key_sentence}"
                            </p>
                          )}

                          {/* 키워드 */}
                          {analysisResult.keywords && analysisResult.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.keywords.map((keyword, index) => (
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
                                  {analysisResult.center_ideas.map((idea, idx) => (
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

                                        {expandedIdeas[idx] && idea.child_card && (
                                          <div className="mt-2 pl-2 border-l-2 border-indigo-100">
                                            <ChildCardComponent childCard={idea.child_card} />
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      </div>
                    </TabsContent>

                    {/* 자식 카드 탭 */}
                    <TabsContent value="child-cards">
                      {analysisResult.center_ideas && analysisResult.center_ideas.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysisResult.center_ideas.map((idea, idx) =>
                            idea.child_card ? (
                              <Card key={idx} className="overflow-hidden">
                                <CardHeader
                                  className={`py-3 px-4 ${
                                    idea.linked ? 'bg-green-50' : 'bg-gray-50'
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <CardTitle className="text-sm font-medium">
                                      {idea.child_card.title}
                                    </CardTitle>
                                    {idea.linked && (
                                      <span className="inline-flex items-center">
                                        <ExternalLink size={14} className="text-green-500" />
                                      </span>
                                    )}
                                  </div>
                                </CardHeader>
                                <CardContent className="py-3 px-4">
                                  <p className="text-sm text-gray-600 mb-3">
                                    {idea.child_card.content}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {idea.child_card.keywords.map((keyword, kidx) => (
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
                            ) : null
                          )}
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
          <CardFooter>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
              onClick={analyzeMemo}
              disabled={isLoading || !inputText.trim()}
            >
              <Send className="w-5 h-5" />
              {isLoading ? '분석 중...' : '메모 분석하기'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default BrainLabelingDemo;
