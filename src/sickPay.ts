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
  return days * dailyAverage * 0.6;
}
