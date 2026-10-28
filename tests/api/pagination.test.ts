import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { login, createOrder } from './helpers';
import { expectSchema, listSchema, errorSchema } from './schemas';
describe('Lab5 variant2 pagination', () => {
  let app: ReturnType<typeof createApp>;
  let token: string;
  beforeEach(async () => {
    app = createApp();
    token = await login(app);
  });
  const get = (query = '') =>
    request(app).get(`/orders${query}`).auth(token, { type: 'bearer' });
  it('P01: empty page has schema and total 0', async () => {
    const res = await get('?limit=1&offset=0');
    expect(res.status).toBe(200);
    expectSchema(res.body, listSchema);
    expect(res.body).toEqual([]);
    expect(res.headers['x-total-count']).toBe('0');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
  it('P02: page returns correct slice, total and persisted resources', async () => {
    const a = await createOrder(app, token, 100);
    const b = await createOrder(app, token, 200);
    const c = await createOrder(app, token, 300);
    const res = await get('?limit=1&offset=1');
    expect(res.status).toBe(200);
    expectSchema(res.body, listSchema);
    expect(res.body).toEqual([b]);
    expect(res.headers['x-total-count']).toBe('3');
    expect(res.headers['content-type']).toMatch(/application\/json/);
    const next = await get('?limit=1&offset=2');
    expect(next.body).toEqual([c]);
    const all = await get();
    expect(all.body.map((o: { id: string }) => o.id)).toEqual([
      a.id,
      b.id,
      c.id,
    ]);
  });
  it('P03: defaults limit 10 offset 0', async () => {
    const ids = [];
    for (let i = 0; i < 11; i++)
      ids.push((await createOrder(app, token, i)).id);
    const res = await get();
    expect(res.body.map((o: { id: string }) => o.id)).toEqual(ids.slice(0, 10));
    expect(res.headers['x-total-count']).toBe('11');
  });
  it.each([
    '?limit=100&offset=0',
    '?limit=1',
    '?offset=1',
    '?limit=001&offset=000',
  ])('P04: valid boundary %s', async (query) => {
    await createOrder(app, token);
    const res = await get(query);
    expect(res.status).toBe(200);
    expectSchema(res.body, listSchema);
    expect(res.headers['x-total-count']).toBe('1');
    expect(res.body).toHaveLength(query === '?offset=1' ? 0 : 1);
  });
  it.each([
    '?limit=1&offset=2',
    '?limit=1&offset=3',
    '?offset=9007199254740991',
  ])('P05: end or beyond %s', async (query) => {
    await createOrder(app, token);
    await createOrder(app, token);
    const res = await get(query);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
    expect(res.headers['x-total-count']).toBe('2');
  });
  it.each([
    '?limit=0',
    '?limit=-1',
    '?limit=101',
    '?limit=1.5',
    '?limit=abc',
    '?limit=',
    '?limit=1e1',
    '?limit=%201',
    '?limit=%2B1',
    '?limit=1&limit=2',
    '?limit[]=1',
    '?offset=-1',
    '?offset=0.5',
    '?offset=abc',
    '?offset=',
    '?offset=1e2',
    '?offset=9007199254740992',
    '?offset=0&offset=1',
    '?offset[]=0',
  ])('P06: invalid %s returns 400 without modifying state', async (query) => {
    const created = await createOrder(app, token);
    const res = await get(query);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_PAGINATION');
    expectSchema(res.body, errorSchema);
    expect(res.headers['x-total-count']).toBeUndefined();
    const after = await get();
    expect(after.body).toEqual([created]);
    expect(after.headers['x-total-count']).toBe('1');
  });
  it('P07: filters owner before slicing and counting', async () => {
    const alice = await login(app, 'alice@example.com');
    await createOrder(app, alice, 100);
    const b1 = await createOrder(app, token, 200);
    await createOrder(app, alice, 300);
    const b2 = await createOrder(app, token, 400);
    const res = await get('?limit=1&offset=1');
    expect(res.body).toEqual([b2]);
    expect(res.headers['x-total-count']).toBe('2');
    expectSchema(res.body, listSchema);
    const all = await get();
    expect(all.body).toEqual([b1, b2]);
  });
  it('P08: delete decreases count and shifts page', async () => {
    const a = await createOrder(app, token);
    const b = await createOrder(app, token, 200);
    const deleted = await request(app)
      .delete(`/orders/${a.id}`)
      .auth(token, { type: 'bearer' });
    expect(deleted.status).toBe(204);
    expect(deleted.text).toBe('');
    const res = await get('?limit=1&offset=0');
    expect(res.body).toEqual([b]);
    expect(res.headers['x-total-count']).toBe('1');
  });
  it('P09: GET repeated page leaves state unchanged', async () => {
    await createOrder(app, token);
    const first = await get('?limit=1&offset=0');
    const second = await get('?limit=1&offset=0');
    expect(second.body).toEqual(first.body);
    expect(second.headers['x-total-count']).toBe(
      first.headers['x-total-count'],
    );
  });
});
