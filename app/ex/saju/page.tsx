'use client';

import { useState } from 'react';
// @ts-ignore
import LunarCalendar from 'lunar-calendar';

const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

interface SajuResult {
  year: string;
  month: string;
  day: string;
  time: string;
  lunar: {
    year: number;
    month: number;
    day: number;
  };
}

export default function SajuCalculator() {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [result, setResult] = useState<SajuResult | null>(null);
  const [error, setError] = useState('');

  const getTimeEarthlyBranch = (hour: number): string => {
    console.log('Calculating time branch for hour:', hour);
    const timeMap = [
      { start: 23, end: 1, branch: '子' },
      { start: 1, end: 3, branch: '丑' },
      { start: 3, end: 5, branch: '寅' },
      { start: 5, end: 7, branch: '卯' },
      { start: 7, end: 9, branch: '辰' },
      { start: 9, end: 11, branch: '巳' },
      { start: 11, end: 13, branch: '午' },
      { start: 13, end: 15, branch: '未' },
      { start: 15, end: 17, branch: '申' },
      { start: 17, end: 19, branch: '酉' },
      { start: 19, end: 21, branch: '戌' },
      { start: 21, end: 23, branch: '亥' },
    ];

    const result =
      timeMap.find(
        (t) =>
          (hour >= t.start && hour < t.end) ||
          (t.start > t.end && (hour >= t.start || hour < t.end))
      )?.branch || '子';

    return result;
  };

  // 년주 계산 (60갑자)
  const calculateYearPillar = (year: number): string => {
    // 1864년을 기준으로 계산 (갑자년)
    const baseYear = 1864;
    const cycle = (year - baseYear) % 60;
    const stem = HEAVENLY_STEMS[cycle % 10];
    const branch = EARTHLY_BRANCHES[cycle % 12];
    return stem + branch;
  };

  // 월주 계산
  const calculateMonthPillar = (year: number, month: number): string => {
    // 월주 계산을 위한 기준
    const yearStem = Math.floor((year - 1864) % 10);
    const monthStems = [];
    for (let i = 0; i < 12; i++) {
      const stemIndex = (yearStem * 2 + i + 2) % 10;
      monthStems[i] = HEAVENLY_STEMS[stemIndex];
    }
    return monthStems[month - 1] + EARTHLY_BRANCHES[(month + 1) % 12];
  };

  // 일주 계산
  const calculateDayPillar = (year: number, month: number, day: number): string => {
    // 1983년 3월 20일이 정미일이므로 이를 기준으로 계산
    const baseDate = new Date(1983, 2, 20); // 0-based month
    const targetDate = new Date(year, month - 1, day);
    const diffDays = Math.floor(
      (targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 정(丁)은 HEAVENLY_STEMS에서 3번째, 미(未)는 EARTHLY_BRANCHES에서 7번째
    const baseStemIndex = 3; // 정(丁)
    const baseBranchIndex = 7; // 미(未)

    const stemIndex = (baseStemIndex + diffDays) % 10;
    const branchIndex = (baseBranchIndex + diffDays) % 12;

    return HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex];
  };

  // 시주 계산
  const calculateTimePillar = (hour: number, dayStem: string): string => {
    const branch = getTimeEarthlyBranch(hour);
    const branchIndex = EARTHLY_BRANCHES.indexOf(branch);
    const dayIndex = HEAVENLY_STEMS.indexOf(dayStem);
    const stemIndex = (dayIndex * 2 + Math.floor((hour + 1) / 2)) % 10;
    return HEAVENLY_STEMS[stemIndex] + branch;
  };

  const calculateSaju = (birthDate: string, birthTime: string): SajuResult => {
    try {
      console.log('Input values:', { birthDate, birthTime });

      const [year, month, day] = birthDate.split('-').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      console.log('Parsed dates:', { year, month, day, hour, minute });

      // 양력을 음력으로 변환
      const lunar = LunarCalendar.solarToLunar(year, month, day);
      console.log('Lunar conversion result:', lunar);

      if (!lunar) {
        throw new Error('음력 변환에 실패했습니다.');
      }

      const yearPillar = calculateYearPillar(lunar.lunarYear);
      const monthPillar = calculateMonthPillar(lunar.lunarYear, lunar.lunarMonth);
      const dayPillar = calculateDayPillar(year, month, day);
      const timePillar = calculateTimePillar(hour, dayPillar[0]);

      console.log('Calculated pillars:', {
        yearPillar,
        monthPillar,
        dayPillar,
        timePillar,
      });

      return {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        time: timePillar,
        lunar: {
          year: lunar.lunarYear,
          month: lunar.lunarMonth,
          day: lunar.lunarDay,
        },
      };
    } catch (error: unknown) {
      console.error('Calculation error:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      throw new Error(`사주 계산 중 오류가 발생했습니다: ${errorMessage}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sajuResult = calculateSaju(birthDate, birthTime);
      setResult(sajuResult);
      setError('');
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      setResult(null);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">사주팔자 계산기</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">생년월일 (양력)</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-2">태어난 시간</label>
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          계산하기
        </button>
      </form>

      {error && <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded space-y-4">
          <div>
            <h2 className="text-xl font-bold mb-2">음력 생년월일</h2>
            <p>
              {result.lunar.year}년 {result.lunar.month}월 {result.lunar.day}일
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">사주팔자 결과</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>년주: {result.year}</div>
              <div>월주: {result.month}</div>
              <div>일주: {result.day}</div>
              <div>시주: {result.time}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
