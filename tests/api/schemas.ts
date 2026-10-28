import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { expect } from 'vitest';
export const orderSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'tier', 'subtotal', 'total', 'createdAt', 'items'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    tier: { type: 'string', enum: ['basic', 'silver', 'gold'] },
    subtotal: { type: 'number', minimum: 0 },
    total: { type: 'number', minimum: 0 },
    createdAt: { type: 'string', format: 'date-time' },
    items: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['sku', 'price', 'qty'],
        properties: {
          sku: { type: 'string', minLength: 1 },
          price: { type: 'number', minimum: 0 },
          qty: { type: 'integer', minimum: 1 },
        },
      },
    },
  },
} as const;
export const listSchema = { type: 'array', items: orderSchema } as const;
export const errorSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['code'],
  properties: { code: { type: 'string', minLength: 1 } },
} as const;
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
export function expectSchema(data: unknown, schema: object) {
  const validate = ajv.compile(schema);
  validate(data);
  expect(validate.errors ?? []).toEqual([]);
}
