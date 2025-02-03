// app/dailytalk/components/UserInfoForm.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { UserInfoType } from '../types/user';

// Validation schema for the personality data JSON
const personalityDataSchema = z.object({
  mbti: z.object({
    type: z.string(),
    // 두 가지 형식 모두 허용
    dimensions: z
      .object({
        EI: z.object({
          value: z.number(),
          preference: z.string(),
          percentage: z.number(),
        }),
        SN: z.object({
          value: z.number(),
          preference: z.string(),
          percentage: z.number(),
        }),
        TF: z.object({
          value: z.number(),
          preference: z.string(),
          percentage: z.number(),
        }),
        JP: z.object({
          value: z.number(),
          preference: z.string(),
          percentage: z.number(),
        }),
      })
      .optional(),
    scores: z
      .object({
        EI: z.number(),
        SN: z.number(),
        TF: z.number(),
        JP: z.number(),
      })
      .optional(),
    confidence: z.number(),
  }),
  bigFive: z.object({
    openness: z.object({ score: z.number(), percentile: z.number() }),
    conscientiousness: z.object({ score: z.number(), percentile: z.number() }),
    extraversion: z.object({ score: z.number(), percentile: z.number() }),
    agreeableness: z.object({ score: z.number(), percentile: z.number() }),
    neuroticism: z.object({ score: z.number(), percentile: z.number() }),
  }),
  combinedInsights: z.array(z.string()).optional(),
});

const formSchema = z.object({
  personalityData: z.string().refine((data) => {
    try {
      const parsed = JSON.parse(data);
      return personalityDataSchema.parse(parsed);
    } catch {
      return false;
    }
  }, '유효한 MBTI/Big Five JSON 데이터를 입력해주세요'),
  gender: z.string().min(1, '성별을 선택해주세요'),
  age: z.string().min(1, '나이를 입력해주세요'),
  location: z.string().min(1, '지역을 입력해주세요'),
});

type FormData = z.infer<typeof formSchema>;

interface UserInfoFormProps {
  onSubmit: (data: UserInfoType) => void;
}

export function UserInfoForm({ onSubmit }: UserInfoFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalityData: '',
      gender: '',
      age: '',
      location: '',
    },
  });

  const handleSubmit = (data: FormData) => {
    try {
      const parsedPersonalityData = JSON.parse(data.personalityData);
      const formattedData: UserInfoType = {
        ...parsedPersonalityData,
        gender: data.gender,
        age: parseInt(data.age),
        location: data.location,
      };

      console.log('Formatted data:', formattedData);
      onSubmit(formattedData);
    } catch (error) {
      console.error('Error parsing personality data:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="personalityData"
          render={({ field }) => (
            <FormItem>
              <FormLabel>MBTI/Big Five 데이터</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="MBTI와 Big Five 데이터를 JSON 형식으로 입력하세요"
                  className="h-[200px] font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>성별</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="성별 선택" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>나이</FormLabel>
              <FormControl>
                <Input type="number" placeholder="나이를 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>지역</FormLabel>
              <FormControl>
                <Input placeholder="지역을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          운세 보기
        </Button>
      </form>
    </Form>
  );
}
