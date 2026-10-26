export interface ParkingOptions {
  night?: boolean;
  weekend?: boolean;
}
export function calcParkingFee(
  minutes: number,
  options: ParkingOptions = {},
): number {
  if (!Number.isInteger(minutes) || minutes < 0)
    throw new Error('INVALID_DURATION');
  if (minutes <= 15) return 0;
  let fee = Math.min(30 + Math.ceil(Math.max(0, minutes - 60) / 60) * 20, 200);
  if (options.night) fee *= 0.5;
  return fee;
}
