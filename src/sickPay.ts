const FIRST_PERIOD_DAYS = 5;
const FIRST_RATE = 0.6;
const SECOND_RATE = 0.8;
const SECOND_PERIOD_END = 10;
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
  return (
    dailyAverage *
    (Math.min(days, FIRST_PERIOD_DAYS) * FIRST_RATE +
      Math.min(
        Math.max(0, days - FIRST_PERIOD_DAYS),
        SECOND_PERIOD_END - FIRST_PERIOD_DAYS,
      ) *
        SECOND_RATE +
      Math.max(0, days - SECOND_PERIOD_END))
  );
}
