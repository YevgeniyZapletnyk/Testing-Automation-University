import { it, expect } from 'vitest';
import { calcParkingFee } from '../src/parking';
it.each([-1, -60, 10.5, NaN, Infinity])('invalid duration %s', (minutes) => {
  expect(() => calcParkingFee(minutes)).toThrow('INVALID_DURATION');
});
it.each([0, 1, 14, 15])('free %s', (minutes) => {
  expect(calcParkingFee(minutes)).toBe(0);
});
it.each([
  [16, 30],
  [59, 30],
  [60, 30],
])('first hour %s -> %s', (minutes, expected) => {
  expect(calcParkingFee(minutes)).toBe(expected);
});
it.each([
  [61, 50],
  [119, 50],
  [120, 50],
  [121, 70],
  [180, 70],
])('extra hours %s -> %s', (minutes, expected) => {
  expect(calcParkingFee(minutes)).toBe(expected);
});
it.each([
  [539, 190],
  [540, 190],
  [541, 200],
  [600, 200],
  [1440, 200],
])('daily cap %s -> %s', (minutes, expected) => {
  expect(calcParkingFee(minutes)).toBe(expected);
});
it.each([
  [0, 0],
  [15, 0],
  [16, 15],
  [60, 15],
  [121, 35],
  [600, 100],
])('night %s -> %s', (minutes, expected) => {
  expect(calcParkingFee(minutes, { night: true })).toBe(expected);
});
it.each([
  [15, false, 0],
  [16, false, 24],
  [600, false, 160],
  [600, true, 80],
  [45, true, 12],
  [121, true, 28],
] as const)('weekend %s night %s -> %s', (minutes, night, expected) => {
  expect(calcParkingFee(minutes, { night, weekend: true })).toBe(expected);
});
