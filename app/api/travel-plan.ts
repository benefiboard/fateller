// pages/api/travel-plan.ts
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const promptChainWorkflow = async (
  initialInput: string,
  promptChain: string[]
): Promise<string[]> => {
  const responseChain = [];
  let response = initialInput;

  for (const prompt of promptChain) {
    const finalPrompt = `${prompt}\n\n🔹 문맥(Context):\n${response}\n🔹 사용자 입력: ${initialInput}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: finalPrompt }],
    });

    response = completion.choices[0].message.content || '';
    responseChain.push(response);
  }

  return responseChain;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userInput } = req.body;
    console.log('Received input:', userInput); // 디버깅용 로그

    const promptChain = [
      `사용자의 여행 취향을 바탕으로 적합한 여행지 3곳을 추천하세요. 
      - 먼저 사용자가 입력한 희망사항을 요약해줘
      - 사용자가 입력한 희망사항을 반영해서 왜 적합한 여행지인지 설명해주세요
      - 각 여행지의 기후, 주요 관광지, 활동 등을 설명하세요.`,

      `다음 여행지 3곳 중 하나를 선택하세요. 선택한 여행지 알려주세요. 그리고 선택한 이유를 설명해주세요.
      - 해당 여행지에서 즐길 수 있는 주요 활동 5가지를 나열하세요. 
      - 활동은 자연 탐방, 역사 탐방, 음식 체험 등 다양한 범주에서 포함되도록 하세요.`,

      `사용자가 하루 동안 이 여행지에서 시간을 보낼 계획입니다. 
      - 오전, 오후, 저녁으로 나누어 일정을 짜고, 각 시간대에 어떤 활동을 하면 좋을지 설명하세요.`,
    ];

    // 응답 체인 시작
    const responseChain = [];
    let response = userInput;

    for (const prompt of promptChain) {
      const finalPrompt = `${prompt}\n\n🔹 문맥(Context):\n${response}\n🔹 사용자 입력: ${userInput}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: finalPrompt }],
      });

      response = completion.choices[0].message.content || '';
      responseChain.push(response);
    }

    return res.status(200).json({
      responses: responseChain,
      finalAnswer: responseChain[responseChain.length - 1],
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
