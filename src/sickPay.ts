const FIRST_PERIOD_DAYS = 5;
const FIRST_RATE = 0.6;
const SECOND_RATE = 0.8;
function assertValidDays(days: number): void {
  if (!Number.isInteger(days) || days < 0 || days > 30)
    throw new Error('INVALID_DAYS');
}
function assertValidDailyAverage(dailyAverage: number): void {
  if (!Number.isFinite(dailyAverage) || dailyAverage < 0)
    throw new Error('INVALID_DAILY_AVERAGE');
}
export function calcSickPay(days: number, dailyAverage: number): number {
  assertValidDays(days);
  assertValidDailyAverage(dailyAverage);
  const firstDays = Math.min(days, FIRST_PERIOD_DAYS);
  const secondDays = Math.max(0, days - FIRST_PERIOD_DAYS);
  return dailyAverage * (firstDays * FIRST_RATE + secondDays * SECOND_RATE);
}
