import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { login, createOrder, payload } from './helpers';
import { expectSchema, errorSchema } from './schemas';
describe('Lab5 access', () => {
  let app: ReturnType<typeof createApp>;
  beforeEach(() => {
    app = createApp();
  });
  it('B01: successful login returns token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'bob@example.com', password: 'Secret123' });
    expect(res.status).toBe(200);
    expectSchema(res.body, {
      type: 'object',
      additionalProperties: false,
      required: ['accessToken'],
      properties: { accessToken: { type: 'string', format: 'uuid' } },
    });
  });
  it.each([
    {},
    { email: 'bob@example.com', password: 'wrong' },
    { email: 'unknown@example.com', password: 'Secret123' },
  ])('B02: invalid login %j', async (body) => {
    const res = await request(app).post('/auth/login').send(body);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ code: 'INVALID_CREDENTIALS' });
  });
  it.each(['missing', 'fake', 'raw', 'basic'])(
    'B03: all protected methods reject %s authorization',
    async (mode) => {
      const token = await login(app);
      const header =
        mode === 'missing'
          ? null
          : mode === 'fake'
            ? 'Bearer invalid'
            : mode === 'raw'
              ? token
              : `Basic ${token}`;
      const calls = [
        request(app).get('/orders?limit=1&offset=0'),
        request(app).post('/orders').send(payload()),
        request(app).get('/orders/unknown'),
        request(app).delete('/orders/unknown'),
      ];
      for (const call of calls) {
        if (header) call.set('Authorization', header);
        const res = await call;
        expect(res.status).toBe(401);
        expectSchema(res.body, errorSchema);
        expect(res.body.code).toBe('UNAUTHORIZED');
      }
    },
  );
  it('B04: чужі GET і DELETE return 404 and preserve owner resource', async () => {
    const alice = await login(app, 'alice@example.com');
    const bob = await login(app);
    const created = await createOrder(app, alice);
    for (const call of [
      request(app).get(`/orders/${created.id}`),
      request(app).delete(`/orders/${created.id}`),
    ]) {
      const res = await call.auth(bob, { type: 'bearer' });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ code: 'NOT_FOUND' });
    }
    const own = await request(app)
      .get(`/orders/${created.id}`)
      .auth(alice, { type: 'bearer' });
    expect(own.status).toBe(200);
    expect(own.body).toEqual(created);
  });
  it('B05: unknown resource returns 404', async () => {
    const token = await login(app);
    for (const call of [
      request(app).get('/orders/unknown'),
      request(app).delete('/orders/unknown'),
    ]) {
      const res = await call.auth(token, { type: 'bearer' });
      expect(res.status).toBe(404);
      expectSchema(res.body, errorSchema);
    }
  });
  it('B06: new app has isolated tokens and orders', async () => {
    const token = await login(app);
    await createOrder(app, token);
    const other = createApp();
    expect(
      (await request(other).get('/orders').auth(token, { type: 'bearer' }))
        .status,
    ).toBe(401);
    const otherToken = await login(other);
    const res = await request(other)
      .get('/orders')
      .auth(otherToken, { type: 'bearer' });
    expect(res.body).toEqual([]);
    expect(res.headers['x-total-count']).toBe('0');
  });
});
