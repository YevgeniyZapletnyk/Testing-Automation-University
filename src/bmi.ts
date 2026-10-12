/** Вага — у кілограмах, зріст — у метрах, результат — у кг/м². */
export function calculateBmi(weightKg: number, heightM: number): number {
  if (!Number.isFinite(heightM) || heightM <= 0) {
    throw new Error('INVALID_HEIGHT');
  }
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new Error('INVALID_WEIGHT');
  }
  return weightKg / heightM ** 2;
}
