import { it, expect } from 'vitest';
import { calcParkingFee } from '../src/parking';
it.each([-1, -60, 10.5, NaN, Infinity])('invalid duration %s', (minutes) => {
  expect(() => calcParkingFee(minutes)).toThrow('INVALID_DURATION');
});
it.each([0, 1, 14, 15])('free %s', (minutes) => {
  expect(calcParkingFee(minutes)).toBe(0);
});
