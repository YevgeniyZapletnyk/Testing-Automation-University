export function calcParkingFee(minutes: number): number {
  if (!Number.isInteger(minutes) || minutes < 0)
    throw new Error('INVALID_DURATION');
  return 0;
}
