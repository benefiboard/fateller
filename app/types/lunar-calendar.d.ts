// types/lunar-calendar.d.ts
declare module 'lunar-calendar' {
  interface LunarDate {
    zodiac: string;
    GanZhiYear: string;
    GanZhiMonth: string;
    GanZhiDay: string;
    worktime: number;
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    lunarMonthName: string;
    lunarDayName: string;
    lunarLeapMonth: number;
    solarFestival?: string;
    lunarFestival?: string;
    term?: string;
  }

  interface SolarDate {
    year: number;
    month: number;
    day: number;
  }

  const LunarCalendar: {
    solarToLunar(year: number, month: number, day: number): LunarDate;
    lunarToSolar(year: number, month: number, day: number): SolarDate;
    calendar(year: number, month: number, fill?: boolean): any;
    solarCalendar(year: number, month: number, fill?: boolean): any;
  };

  export default LunarCalendar;
}
