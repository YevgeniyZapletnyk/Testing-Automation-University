import { describe, it, expect } from 'vitest';
import { calculateBmi } from '../src/bmi';

describe('calculateBmi', () => {
  it('повертає ІМТ 24.22 для ваги 70 кг і зросту 1.70 м', () => {
    // Arrange
    const weightKg = 70;
    const heightM = 1.7;
    // Act
    const result = calculateBmi(weightKg, heightM);
    // Assert
    expect(result).toBeCloseTo(24.22, 2);
  });

  it('повертає ІМТ 25 для ваги 100 кг і зросту 2 м', () => {
    expect(calculateBmi(100, 2)).toBe(25);
  });

  it('враховує дробову вагу без округлення результату до цілого', () => {
    expect(calculateBmi(62.5, 1.75)).toBeCloseTo(20.4081632653, 8);
  });

  it('відхиляє зріст 0 — межу допустимого діапазону', () => {
    expect(() => calculateBmi(70, 0)).toThrow('INVALID_HEIGHT');
  });

  it('відхиляє від’ємний зріст', () => {
    expect(() => calculateBmi(70, -1.7)).toThrow('INVALID_HEIGHT');
  });

  it.each([NaN, Infinity, -Infinity])(
    'відхиляє нескінченний або NaN зріст: %s',
    (height) => {
      expect(() => calculateBmi(70, height)).toThrow('INVALID_HEIGHT');
    },
  );

  it.each([0, -70, NaN, Infinity, -Infinity])(
    'відхиляє некоректну вагу: %s',
    (weight) => {
      expect(() => calculateBmi(weight, 1.7)).toThrow('INVALID_WEIGHT');
    },
  );
});
