import { beforeEach, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ReminderService } from '../src/reminder-service';
import { HttpEmailGateway } from '../src/email-gateway';
import { SystemClock } from '../src/clock';
import { InMemoryReminderStore } from './fakes/in-memory-repository';
import { MAIL_URL, server } from './msw/server';
const now = '2026-03-15T10:00:00.000Z';
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(now));
});
async function fixture(createdAt = '2026-03-07T10:00:00.000Z') {
  const store = new InMemoryReminderStore();
  const order = { id: 'INT-2', email: 'student@example.test', createdAt };
  await store.save(order);
  return {
    store,
    order,
    service: new ReminderService(
      store,
      new HttpEmailGateway('https://mail.example.test'),
      new SystemClock(),
    ),
  };
}
it('I01: actual HTTP client plus MSW persists successful reminder', async () => {
  const { service, store, order } = await fixture();
  await expect(service.remind(order.id)).resolves.toEqual({
    sent: true,
    messageId: 'MSG-1',
  });
  expect(await store.findById(order.id)).toEqual({
    ...order,
    remindedAt: now,
    messageId: 'MSG-1',
  });
});
it('I02: seven days causes no HTTP request', async () => {
  let requests = 0;
  server.use(
    http.post(MAIL_URL, () => {
      requests++;
      return HttpResponse.json({ status: 'sent', messageId: 'M' });
    }),
  );
  const { service, order, store } = await fixture('2026-03-08T10:00:00.000Z');
  await expect(service.remind(order.id)).resolves.toEqual({
    sent: false,
    reason: 'NOT_DUE',
  });
  expect(requests).toBe(0);
  expect(await store.findById(order.id)).toEqual(order);
});
it('I03: HTTP 503 leaves state unchanged', async () => {
  server.use(
    http.post(MAIL_URL, () => new HttpResponse(null, { status: 503 })),
  );
  const { service, order, store } = await fixture();
  await expect(service.remind(order.id)).rejects.toThrow('MAIL_UNAVAILABLE');
  expect(await store.findById(order.id)).toEqual(order);
});
it('I04: malformed HTTP payload leaves state unchanged', async () => {
  server.use(
    http.post(MAIL_URL, () => HttpResponse.json({ status: 'queued' })),
  );
  const { service, order, store } = await fixture();
  await expect(service.remind(order.id)).rejects.toThrow(
    'INVALID_MAIL_RESPONSE',
  );
  expect(await store.findById(order.id)).toEqual(order);
});
