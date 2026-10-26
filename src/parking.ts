export function calcParkingFee(minutes: number): number {
  if (!Number.isInteger(minutes) || minutes < 0)
    throw new Error('INVALID_DURATION');
  if (minutes <= 15) return 0;
  return 30 + Math.ceil(Math.max(0, minutes - 60) / 60) * 20;
}
