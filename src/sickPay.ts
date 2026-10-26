const FIRST_PERIOD_DAYS = 5;
const FIRST_RATE = 0.6;
const SECOND_RATE = 0.8;
const SECOND_PERIOD_END = 10;
const MAX_DAYS = 30;
function assertValidDays(days: number): void {
  if (!Number.isInteger(days) || days < 0 || days > MAX_DAYS)
    throw new Error('INVALID_DAYS');
}
function assertValidDailyAverage(dailyAverage: number): void {
  if (!Number.isFinite(dailyAverage) || dailyAverage < 0)
    throw new Error('INVALID_DAILY_AVERAGE');
}
function calcWeightedDays(days: number): number {
  const firstDays = Math.min(days, FIRST_PERIOD_DAYS);
  const secondDays = Math.min(
    Math.max(0, days - FIRST_PERIOD_DAYS),
    SECOND_PERIOD_END - FIRST_PERIOD_DAYS,
  );
  const remainingDays = Math.max(0, days - SECOND_PERIOD_END);
  return firstDays * FIRST_RATE + secondDays * SECOND_RATE + remainingDays;
}
export function calcSickPay(days: number, dailyAverage: number): number {
  assertValidDays(days);
  assertValidDailyAverage(dailyAverage);
  return Math.round(dailyAverage * calcWeightedDays(days) * 100) / 100;
}
