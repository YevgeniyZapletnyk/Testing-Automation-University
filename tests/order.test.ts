import { describe, it, expect } from 'vitest';
import {
  calcSubtotal,
  calcDiscountRate,
  calcShipping,
  calcOrderTotal,
  type OrderItem,
  type Tier,
} from '../src/order';
const item = (price: number, qty = 1): OrderItem => ({
  sku: 'SKU-1',
  price,
  qty,
});
describe('calcSubtotal', () => {
  it('підсумовує позиції з урахуванням кількості', () => {
    const items = [item(100, 2), { sku: 'SKU-2', price: 50, qty: 3 }];
    const result = calcSubtotal(items);
    expect(result).toBeCloseTo(350, 2);
  });
  it('відхиляє порожнє замовлення', () =>
    expect(() => calcSubtotal([])).toThrow('EMPTY_ORDER'));
  it.each([-1, -0.01])('відхиляє ціну %s', (price) =>
    expect(() => calcSubtotal([item(price)])).toThrow('NEGATIVE_PRICE'),
  );
  it.each([0, -1, 1.5])('відхиляє кількість %s', (qty) =>
    expect(() => calcSubtotal([item(100, qty)])).toThrow('INVALID_QTY'),
  );
  it.each([
    [0, 1, 0],
    [100, 1, 100],
  ])('ціна %s і кількість %s дають %s', (price, qty, expected) =>
    expect(calcSubtotal([item(price, qty)])).toBeCloseTo(expected, 2),
  );
});
describe('calcDiscountRate', () => {
  it.each<[Tier, number, number]>([
    ['basic', 500, 0],
    ['silver', 500, 0.05],
    ['gold', 500, 0.1],
    ['basic', 2000, 0.05],
    ['gold', 2000, 0.15],
  ])('%s при сумі %s має ставку %s', (tier, sum, expected) =>
    expect(calcDiscountRate(tier, sum)).toBeCloseTo(expected, 4),
  );
  it.each([
    [1999, 0],
    [2000, 0.05],
    [2001, 0.05],
  ])('межа великого замовлення %s', (sum, expected) =>
    expect(calcDiscountRate('basic', sum)).toBeCloseTo(expected, 4),
  );
  it('обмежує знижку до 25 %', () =>
    expect(calcDiscountRate('gold', 2000, 0.5)).toBeCloseTo(0.25, 4));
  it.each([
    [0.09, 0.24],
    [0.1, 0.25],
    [0.15, 0.25],
  ])('промокод %s дає обмежену ставку %s', (promo, expected) =>
    expect(calcDiscountRate('gold', 2000, promo)).toBeCloseTo(expected, 4),
  );
  it('відхиляє від’ємний промокод', () =>
    expect(() => calcDiscountRate('basic', 500, -0.1)).toThrow(
      'INVALID_PROMO',
    ));
});
describe('calcShipping', () => {
  it.each([
    [999, 60],
    [1000, 0],
    [1001, 0],
  ])('сума %s дає доставку %s', (sum, expected) =>
    expect(calcShipping(sum)).toBeCloseTo(expected, 2),
  );
});
describe('calcOrderTotal', () => {
  it('додає доставку нижче порога', () =>
    expect(calcOrderTotal([item(500)], 'basic')).toBeCloseTo(560, 2));
  it('доставка безкоштовна після знижки', () =>
    expect(calcOrderTotal([item(1200)], 'gold')).toBeCloseTo(1080, 2));
  it('знижка опускає суму нижче порога доставки', () =>
    expect(calcOrderTotal([item(1050)], 'gold')).toBeCloseTo(1005, 2));
  it('передає виняток нижнього рівня', () =>
    expect(() => calcOrderTotal([], 'gold')).toThrow('EMPTY_ORDER'));
  it.each([
    [1249, 1059.2],
    [1250, 1000],
    [1251, 1000.8],
  ])('ціна %s із промокодом 20 % дає %s', (price, expected) =>
    expect(calcOrderTotal([item(price)], 'basic', 0.2)).toBeCloseTo(
      expected,
      2,
    ),
  );
});
