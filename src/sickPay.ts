export function calcSickPay(days: number, dailyAverage: number): number {
  if (!Number.isInteger(days) || days < 0 || days > 30)
    throw new Error('INVALID_DAYS');
  void dailyAverage;
  return 0;
}
