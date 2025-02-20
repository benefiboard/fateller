import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userInput } = await request.json();

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const promptChain = [
      `사용자의 여행 취향을 바탕으로 적합한 여행지 3곳을 추천하세요. 
      - 먼저 사용자가 입력한 희망사항을 요약해줘
      - 사용자가 입력한 희망사항을 반영해서 왜 적합한 여행지인지 설명해주세요
      - 각 여행지의 기후, 주요 관광지, 활동 등을 설명하세요.`,

      `다음 여행지 3곳 중 하나를 선택하세요. 선택한 여행지 알려주세요. 그리고 선택한 이유를 설명해주세요.
      - 해당 여행지에서 즐길 수 있는 주요 활동 5가지를 나열하세요. 
      - 활동은 자연 탐방, 역사 탐방, 음식 체험 등 다양한 범주에서 포함되도록 하세요.`,

      `사용자가 하루 동안 이 여행지에서 시간을 보낼 계획입니다. 
      - 오전, 오후, 저녻으로 나누어 일정을 짜고, 각 시간대에 어떤 활동을 하면 좋을지 설명하세요.`,
    ];

    // 스트림 응답 시작
    const responseStream = new Response(stream.readable, {
      headers: { 'Content-Type': 'text/event-stream' },
    });

    // 비동기로 데이터 처리 시작
    (async () => {
      let response = userInput;
      for (let i = 0; i < promptChain.length; i++) {
        const finalPrompt = `${promptChain[i]}\n\n🔹 문맥(Context):\n${response}\n🔹 사용자 입력: ${userInput}`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: finalPrompt }],
        });

        response = completion.choices[0].message.content || '';

        // 각 단계의 응답을 스트림으로 전송
        await writer.write(encoder.encode(`data: ${JSON.stringify({ step: i, response })}\n\n`));
      }

      await writer.close();
    })();

    return responseStream;
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
