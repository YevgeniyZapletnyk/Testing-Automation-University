import request from 'supertest';
import type { Express } from 'express';
export async function login(app: Express, email = 'bob@example.com') {
  const res = await request(app)
    .post('/auth/login')
    .send({ email, password: 'Secret123' });
  if (res.status !== 200) throw new Error(`Login failed: ${res.status}`);
  return res.body.accessToken as string;
}
export const payload = (price = 500, qty = 1) => ({
  items: [{ sku: 'SKU-A', price, qty }],
});
export async function createOrder(app: Express, token: string, price = 500) {
  const res = await request(app)
    .post('/orders')
    .auth(token, { type: 'bearer' })
    .send(payload(price));
  if (res.status !== 201) throw new Error(`Create failed: ${res.status}`);
  return res.body;
}
