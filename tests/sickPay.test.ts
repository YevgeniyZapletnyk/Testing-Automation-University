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
it.each([
  [11, 800],
  [12, 900],
  [29, 2600],
  [30, 2700],
])('third tier: %s -> %s', (days, expected) => {
  expect(calcSickPay(days, 100)).toBe(expected);
});
it.each([
  [1, 100.01, 60.01],
  [5, 100.01, 300.03],
  [6, 100.01, 380.04],
  [10, 100.01, 700.07],
  [11, 100.01, 800.08],
  [30, 100.01, 2700.27],
  [1, 0.01, 0.01],
  [2, 0.01, 0.01],
  [11, 333.33, 2666.64],
])('round total once: %s days x %s -> %s', (days, average, expected) => {
  expect(calcSickPay(days, average)).toBe(expected);
});
