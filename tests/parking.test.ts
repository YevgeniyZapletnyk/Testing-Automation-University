import { it, expect } from 'vitest';
import { calcParkingFee } from '../src/parking';
it.each([-1, -60, 10.5, NaN, Infinity])('invalid duration %s', (minutes) => {
  expect(() => calcParkingFee(minutes)).toThrow('INVALID_DURATION');
});
