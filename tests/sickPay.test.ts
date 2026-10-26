import { it, expect } from 'vitest';
import { calcSickPay } from '../src/sickPay';
it.each([-1, 0.5, 30.5, 31, NaN, Infinity, -Infinity])(
  'invalid days %s',
  (days) => {
    expect(() => calcSickPay(days, 100)).toThrow('INVALID_DAYS');
  },
);
it.each([-0.01, -100, NaN, Infinity, -Infinity])(
  'invalid daily average %s',
  (average) => {
    expect(() => calcSickPay(1, average)).toThrow('INVALID_DAILY_AVERAGE');
  },
);
it('validates salary even for zero days', () => {
  expect(() => calcSickPay(0, -1)).toThrow('INVALID_DAILY_AVERAGE');
});
it.each([
  [0, 100, 0],
  [1, 100, 60],
  [4, 100, 240],
  [5, 100, 300],
  [5, 0, 0],
  [1, 1000, 600],
])('first five: %s days x %s -> %s', (days, average, expected) => {
  expect(calcSickPay(days, average)).toBe(expected);
});
it.each([
  [6, 380],
  [9, 620],
  [10, 700],
])('second tier: %s -> %s', (days, expected) => {
  expect(calcSickPay(days, 100)).toBe(expected);
});
