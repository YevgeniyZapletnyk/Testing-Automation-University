import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { login, payload, createOrder } from './helpers';
import { expectSchema, orderSchema, errorSchema } from './schemas';
describe('Lab5 orders API', () => {
  let app: ReturnType<typeof createApp>;
  let token: string;
  beforeEach(async () => {
    app = createApp();
    token = await login(app);
  });
  it('A01: create checks status, values and headers', async () => {
    const res = await request(app)
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send(payload());
    expect(res.status).toBe(201);
    expect(res.body.subtotal).toBe(500);
    expect(res.body.total).toBe(560);
    expect(res.headers.location).toBe(`/orders/${res.body.id}`);
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('A02: create has a persisted effect', async () => {
    const created = await createOrder(app, token);
    const res = await request(app)
      .get(`/orders/${created.id}`)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(created);
  });
  it('A03: POST matches strict JSON Schema', async () => {
    expectSchema(await createOrder(app, token), orderSchema);
  });
  it.each([
    ['empty', [], 'EMPTY_ORDER'],
    ['missing', undefined, 'EMPTY_ORDER'],
    ['not array', {}, 'EMPTY_ORDER'],
    ['negative price', [{ sku: 'A', price: -1, qty: 1 }], 'INVALID_PRICE'],
    ['string price', [{ sku: 'A', price: '10', qty: 1 }], 'INVALID_PRICE'],
    ['null price', [{ sku: 'A', price: null, qty: 1 }], 'INVALID_PRICE'],
    ['zero qty', [{ sku: 'A', price: 10, qty: 0 }], 'INVALID_QTY'],
    ['fraction qty', [{ sku: 'A', price: 10, qty: 1.5 }], 'INVALID_QTY'],
    ['negative qty', [{ sku: 'A', price: 10, qty: -1 }], 'INVALID_QTY'],
    ['missing sku', [{ price: 10, qty: 1 }], 'INVALID_SKU'],
    ['blank sku', [{ sku: ' ', price: 10, qty: 1 }], 'INVALID_SKU'],
    ['null item', [null], 'INVALID_SKU'],
    ['overflow', [{ sku: 'A', price: 1e308, qty: 2 }], 'INVALID_PRICE'],
  ])('A04: rejects %s without saving', async (_name, items, code) => {
    const res = await request(app)
      .post('/orders')
      .auth(token, { type: 'bearer' })
      .send({ items });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(code);
    expectSchema(res.body, errorSchema);
    const list = await request(app)
      .get('/orders')
      .auth(token, { type: 'bearer' });
    expect(list.body).toEqual([]);
  });
  it.each([
    ['bob@example.com', 0, 60],
    ['bob@example.com', 999.99, 1059.99],
    ['bob@example.com', 1000, 1000],
    ['bob@example.com', 1999.99, 1999.99],
    ['bob@example.com', 2000, 1900],
    ['alice@example.com', 500, 510],
    ['alice@example.com', 2000, 1700],
  ])('A05: %s price %s gives total %s', async (email, price, total) => {
    const user = await login(app, email);
    const order = await createOrder(app, user, price);
    expect(order.total).toBe(total);
    expect(order.subtotal).toBe(price);
  });
  it('A06: delete is idempotent by final state, 204 has no body', async () => {
    const created = await createOrder(app, token);
    const url = `/orders/${created.id}`;
    const first = await request(app)
      .delete(url)
      .auth(token, { type: 'bearer' });
    expect(first.status).toBe(204);
    expect(first.text).toBe('');
    const second = await request(app)
      .delete(url)
      .auth(token, { type: 'bearer' });
    expect(second.status).toBe(404);
    const get = await request(app).get(url).auth(token, { type: 'bearer' });
    expect(get.status).toBe(404);
    const list = await request(app)
      .get('/orders')
      .auth(token, { type: 'bearer' });
    expect(list.body).toEqual([]);
    expect(list.headers['x-total-count']).toBe('0');
  });
  it('A07: GET matches schema', async () => {
    const created = await createOrder(app, token);
    const res = await request(app)
      .get(`/orders/${created.id}`)
      .auth(token, { type: 'bearer' });
    expect(res.status).toBe(200);
    expectSchema(res.body, orderSchema);
  });
});
