// app/user-info/UserInfoForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { saveSajuInformation } from './actions';
import { useUserStore } from '../store/userStore';
import createSupabaseBrowserClient from '@/lib/supabse/client';
import { UserInformation } from '../utils/types';

interface UserInfoFormProps {
  userId: string;
}

export function UserInfoForm({ userId }: UserInfoFormProps) {
  const router = useRouter();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const [formData, setFormData] = useState<UserInformation>({
    name: '',
    gender: '남자',
    birthYear: '2000',
    birthMonth: '',
    birthDay: '',
    birthHour: '',
    birthMinute: '',
    isTimeUnknown: false,
  });
  const [isTimeUnknown, setIsTimeUnknown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 기존 데이터 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: userData } = await supabase
          .from('userdata')
          .select('saju_information')
          .eq('id', userId)
          .single();

        if (userData?.saju_information) {
          const sajuInfo = userData.saju_information;
          setFormData({
            name: sajuInfo.name || '',
            gender: sajuInfo.gender || '남자',
            birthYear: sajuInfo.birthYear || '2000',
            birthMonth: sajuInfo.birthMonth || '',
            birthDay: sajuInfo.birthDay || '',
            birthHour: sajuInfo.birthHour || '',
            birthMinute: sajuInfo.birthMinute || '',
            isTimeUnknown: sajuInfo.isTimeUnknown || false,
          });

          setIsTimeUnknown(sajuInfo.isTimeUnknown || false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId]);

  // Select에 사용될 년도 범위 생성 (1925-현재)
  const years = Array.from({ length: new Date().getFullYear() - 1924 }, (_, i) =>
    (1925 + i).toString()
  );

  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 이름과 기본 정보 체크
      if (!formData.name || !formData.birthYear || !formData.birthMonth || !formData.birthDay) {
        alert('이름과 생년월일을 모두 입력해주세요.');
        return;
      }

      // 시간 모름이 체크되어 있으면 10:60으로 설정
      const submitData = {
        ...formData,
        birthHour: isTimeUnknown ? '25' : formData.birthHour,
        birthMinute: isTimeUnknown ? '60' : formData.birthMinute,
        isTimeUnknown,
      };

      // 시간 모름이 체크되어 있지 않을 때는 시간/분 필수
      if (!isTimeUnknown && (!formData.birthHour || !formData.birthMinute)) {
        alert('태어난 시간을 입력하거나 시간 모름을 체크해주세요.');
        return;
      }

      const response = await saveSajuInformation(userId, submitData);
      console.log('Response:', response);

      if (response.success === true) {
        const supabase = createSupabaseBrowserClient();
        const { data: userData } = await supabase
          .from('userdata')
          .select('*')
          .eq('id', userId)
          .single();

        if (userData) {
          setCurrentUser(userData);
        }

        router.back();
      } else {
        alert(response.error || '저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-brand-100">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 입력 */}
          <div className="flex flex-col gap-2">
            <p>이름</p>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="이름을 입력해주세요"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border-brand-200"
              />
            </div>
          </div>
          <hr />
          {/* 성별 선택 */}
          <div className="flex flex-col gap-2">
            <p>성별</p>
            <div className="space-y-2">
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value as '남자' | '여자' })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="남자" id="male" />
                  <Label htmlFor="male">남자</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="여자" id="female" />
                  <Label htmlFor="female">여자</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <hr />
          {/* 생년월일 선택 */}
          <div className="flex flex-col gap-2">
            <p>
              생년월일 |
              <span className="ml-1 text-xs font-semibold text-black">
                양력 생일<span className="text-xs font-normal"> 을 입력해주세요</span>
              </span>
            </p>
            <div className="grid grid-cols-10 gap-4">
              <div className="space-y-2 col-span-4">
                <Select
                  defaultValue="2000"
                  value={formData.birthYear}
                  onValueChange={(value) => setFormData({ ...formData, birthYear: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="년도" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}년
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-3">
                <Select
                  value={formData.birthMonth}
                  onValueChange={(value) => setFormData({ ...formData, birthMonth: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="월" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}월
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-3">
                <Select
                  value={formData.birthDay}
                  onValueChange={(value) => setFormData({ ...formData, birthDay: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="일" />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}일
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <hr />
          {/* 시간과 분 선택 */}
          <div className="flex flex-col gap-2">
            <p>출생시간</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {/* <Label className="text-base">시</Label> */}
                <Select
                  value={formData.birthHour}
                  onValueChange={(value) => setFormData({ ...formData, birthHour: value })}
                  disabled={isTimeUnknown}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="시" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((hour) => (
                      <SelectItem key={hour} value={hour}>
                        {hour}시
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {/* <Label className="text-base">분</Label> */}
                <Select
                  value={formData.birthMinute}
                  onValueChange={(value) => setFormData({ ...formData, birthMinute: value })}
                  disabled={isTimeUnknown}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="분" />
                  </SelectTrigger>
                  <SelectContent>
                    {minutes.map((minute) => (
                      <SelectItem key={minute} value={minute}>
                        {minute}분
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          {/* 시간 모름 체크박스 */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="timeUnknown"
              checked={isTimeUnknown}
              onCheckedChange={(checked) => {
                setIsTimeUnknown(checked as boolean);
                if (checked) {
                  setFormData({
                    ...formData,
                    birthHour: '',
                    birthMinute: '',
                  });
                }
              }}
            />
            <Label htmlFor="timeUnknown" className="text-gray-600 mt-1">
              태어난 시간을 모르겠어요
            </Label>
          </div>
          <hr />
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:opacity-90 transition-opacity"
          >
            {isLoading ? '저장 중...' : '정보 저장하기'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
