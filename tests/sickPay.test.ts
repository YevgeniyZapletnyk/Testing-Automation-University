import { it, expect } from 'vitest';
import { calcSickPay } from '../src/sickPay';
it.each([-1, 0.5, 30.5, 31, NaN, Infinity, -Infinity])(
  'invalid days %s',
  (days) => {
    expect(() => calcSickPay(days, 100)).toThrow('INVALID_DAYS');
  },
);
