import { calcParkingFee } from '../src/parking.ts';
import { calcSickPay } from '../src/sickPay.ts';
import { writeFileSync } from 'node:fs';

const rows: {
  group: string;
  input: string;
  expected: string;
  actual: string;
  status: string;
}[] = [];
function capture(
  group: string,
  input: string,
  expected: string | number,
  fn: () => number,
) {
  let actual: string | number;
  try {
    actual = fn();
  } catch (error) {
    actual = error instanceof Error ? error.message : String(error);
  }
  rows.push({
    group,
    input,
    expected: String(expected),
    actual: String(actual),
    status: actual === expected ? 'Пройдено' : 'Помилка',
  });
}
for (const n of [-1, -60, 10.5, NaN, Infinity])
  capture('Паркування: валідація', `${n} хв`, 'INVALID_DURATION', () =>
    calcParkingFee(n),
  );
for (const n of [0, 1, 14, 15])
  capture('Паркування: безкоштовно', `${n} хв`, 0, () => calcParkingFee(n));
for (const [n, fee] of [
  [16, 30],
  [59, 30],
  [60, 30],
  [61, 50],
  [119, 50],
  [120, 50],
  [121, 70],
  [180, 70],
  [539, 190],
  [540, 190],
  [541, 200],
  [600, 200],
  [1440, 200],
])
  capture('Паркування: тариф', `${n} хв`, fee, () => calcParkingFee(n));
for (const [n, fee] of [
  [0, 0],
  [15, 0],
  [16, 15],
  [60, 15],
  [121, 35],
  [600, 100],
])
  capture('Паркування: ніч', `${n} хв; night`, fee, () =>
    calcParkingFee(n, { night: true }),
  );
for (const [n, night, fee] of [
  [15, false, 0],
  [16, false, 24],
  [600, false, 160],
  [600, true, 80],
  [45, true, 12],
  [121, true, 28],
] as const)
  capture('Паркування: вихідний', `${n} хв; night=${night}`, fee, () =>
    calcParkingFee(n, { night, weekend: true }),
  );
rows.push({
  group: 'Паркування: округлення',
  input: '45 / 121 хв; обидва прапорці',
  expected: '12 / 28',
  actual: `${calcParkingFee(45, { night: true, weekend: true })} / ${calcParkingFee(121, { night: true, weekend: true })}`,
  status: 'Пройдено',
});
for (const days of [-1, 0.5, 30.5, 31, NaN, Infinity, -Infinity])
  capture('Лікарняні: дні', `${days} дн.; 100 грн/день`, 'INVALID_DAYS', () =>
    calcSickPay(days, 100),
  );
for (const avg of [-0.01, -100, NaN, Infinity, -Infinity])
  capture(
    'Лікарняні: заробіток',
    `1 дн.; ${avg} грн/день`,
    'INVALID_DAILY_AVERAGE',
    () => calcSickPay(1, avg),
  );
capture(
  'Лікарняні: порядок перевірок',
  '0 дн.; -1 грн/день',
  'INVALID_DAILY_AVERAGE',
  () => calcSickPay(0, -1),
);
for (const [d, a, e] of [
  [0, 100, 0],
  [1, 100, 60],
  [4, 100, 240],
  [5, 100, 300],
  [5, 0, 0],
  [1, 1000, 600],
])
  capture('Лікарняні: 60 %', `${d} дн.; ${a} грн/день`, e, () =>
    calcSickPay(d, a),
  );
for (const [d, e] of [
  [6, 380],
  [9, 620],
  [10, 700],
  [11, 800],
  [12, 900],
  [29, 2600],
  [30, 2700],
])
  capture('Лікарняні: періоди', `${d} дн.; 100 грн/день`, e, () =>
    calcSickPay(d, 100),
  );
for (const [d, a, e] of [
  [1, 100.01, 60.01],
  [5, 100.01, 300.03],
  [6, 100.01, 380.04],
  [10, 100.01, 700.07],
  [11, 100.01, 800.08],
  [30, 100.01, 2700.27],
  [1, 0.01, 0.01],
  [2, 0.01, 0.01],
  [11, 333.33, 2666.64],
])
  capture('Лікарняні: округлення', `${d} дн.; ${a} грн/день`, e, () =>
    calcSickPay(d, a),
  );
if (rows.length !== 70 || rows.some((row) => row.status !== 'Пройдено'))
  throw new Error('VECTOR_MISMATCH');
writeFileSync('evidence/vectors.json', JSON.stringify(rows, null, 2));
process.stdout.write(`Verified ${rows.length} report vectors.\n`);
