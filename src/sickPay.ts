function assertValidDays(days: number): void {
  if (!Number.isInteger(days) || days < 0 || days > 30)
    throw new Error('INVALID_DAYS');
}
export function calcSickPay(days: number, dailyAverage: number): number {
  assertValidDays(days);
  if (!Number.isFinite(dailyAverage) || dailyAverage < 0)
    throw new Error('INVALID_DAILY_AVERAGE');
  return 0;
}
