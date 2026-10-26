const FREE_MINUTES = 15,
  FIRST_HOUR_FEE = 30,
  EXTRA_HOUR_FEE = 20;
export function calcParkingFee(minutes: number): number {
  if (!Number.isInteger(minutes) || minutes < 0)
    throw new Error('INVALID_DURATION');
  if (minutes <= FREE_MINUTES) return 0;
  return (
    FIRST_HOUR_FEE + Math.ceil(Math.max(0, minutes - 60) / 60) * EXTRA_HOUR_FEE
  );
}
