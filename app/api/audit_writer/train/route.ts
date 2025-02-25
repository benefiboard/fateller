// app/api/audit_writer/train/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createReadStream } from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export async function POST() {
  try {
    // 1. 파일 업로드
    const filePath = path.join(process.cwd(), 'training-data.jsonl');
    const file = await openai.files.create({
      file: createReadStream(filePath),
      purpose: 'fine-tune',
    });

    console.log('File uploaded successfully:', file.id);

    // 2. Fine-tuning 작업 시작
    const fineTune = await openai.fineTuning.jobs.create({
      training_file: file.id,
      model: 'gpt-4o-mini-2024-07-18',
    });

    return NextResponse.json({
      success: true,
      fileId: file.id,
      fineTuneId: fineTune.id,
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
