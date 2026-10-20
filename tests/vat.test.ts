import { describe, it, expect } from 'vitest';
import { calcVat } from '../src/order';
describe('calcVat: варіант 2', () => {
  it.each([
    [1200, 0.2, 200],
    [107, 0.07, 7],
    [100, 0.2, 16.67],
    [0, 0.2, 0],
    [100, 0, 0],
    [100, 1, 50],
    [100, 0.01, 0.99],
    [100, 0.99, 49.75],
    [0.02, 0.2, 0],
    [0.03, 0.2, 0.01],
    [0.04, 0.2, 0.01],
    [1199.99, 0.2, 200],
    [1200.01, 0.2, 200],
  ])('із суми %s за ставкою %s виділяє ПДВ %s', (total, rate, expected) => {
    const actual = calcVat(total, rate);
    expect(actual).toBeCloseTo(expected, 2);
  });
  it.each([-1, -0.01, 1.01, 2, NaN, Infinity, -Infinity])(
    'відхиляє ставку %s з кодом INVALID_VAT_RATE',
    (rate) => {
      expect(() => calcVat(100, rate)).toThrow('INVALID_VAT_RATE');
    },
  );
  it.each([-1, -0.01, NaN, Infinity, -Infinity])(
    'відхиляє суму %s з кодом INVALID_TOTAL',
    (total) => {
      expect(() => calcVat(total, 0.2)).toThrow('INVALID_TOTAL');
    },
  );
});
