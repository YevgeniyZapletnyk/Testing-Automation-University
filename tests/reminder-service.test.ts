import { beforeEach, expect, it, vi } from 'vitest';
import { ReminderService } from '../src/reminder-service';
import { SystemClock } from '../src/clock';
import { InMemoryReminderStore } from './fakes/in-memory-repository';
const DAY = 86400000;
const NOW = new Date('2026-03-15T10:00:00.000Z');
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
});
async function fixture(ageMs = 8 * DAY) {
  const order = {
    id: 'REM-2',
    email: 'student@example.test',
    createdAt: new Date(NOW.getTime() - ageMs).toISOString(),
  };
  const store = new InMemoryReminderStore();
  await store.save(order);
  const mail = { send: vi.fn().mockResolvedValue('MSG-2') };
  return {
    order,
    store,
    mail,
    service: new ReminderService(store, mail, new SystemClock()),
  };
}
it.each([
  [6, false],
  [7, false],
  [8, true],
] as const)('R01: age %s days -> sent %s', async (days, sent) => {
  const { service, mail, store, order } = await fixture(days * DAY);
  const result = await service.remind(order.id);
  expect(result.sent).toBe(sent);
  if (sent) {
    expect(mail.send).toHaveBeenCalledExactlyOnceWith(
      order.email,
      'Нагадування про замовлення REM-2',
    );
    expect((await store.findById(order.id))?.remindedAt).toBe(
      NOW.toISOString(),
    );
  } else {
    expect(mail.send).not.toHaveBeenCalled();
    expect(await store.findById(order.id)).toEqual(order);
  }
});
it.each([
  [7 * DAY - 1, false],
  [7 * DAY + 1, true],
  [-DAY, false],
] as const)('R02: age %s ms -> sent %s', async (age, sent) => {
  const { service, order, mail } = await fixture(age);
  expect((await service.remind(order.id)).sent).toBe(sent);
  expect(mail.send).toHaveBeenCalledTimes(sent ? 1 : 0);
});
it('R03: exact seventh day becomes due after advancing Date by 1 ms', async () => {
  const { service, order } = await fixture(7 * DAY);
  expect((await service.remind(order.id)).sent).toBe(false);
  vi.setSystemTime(new Date(NOW.getTime() + 1));
  expect((await service.remind(order.id)).sent).toBe(true);
});
it('R04: successful send persists complete reminder state', async () => {
  const { service, store, order } = await fixture();
  await service.remind(order.id);
  expect(await store.findById(order.id)).toEqual({
    ...order,
    remindedAt: NOW.toISOString(),
    messageId: 'MSG-2',
  });
});
it('R05: second sequential call does not send again', async () => {
  const { service, order, mail } = await fixture();
  await service.remind(order.id);
  await expect(service.remind(order.id)).resolves.toEqual({
    sent: false,
    reason: 'ALREADY_SENT',
  });
  expect(mail.send).toHaveBeenCalledTimes(1);
});
it('R06: missing order is rejected without mail', async () => {
  const { service, mail } = await fixture();
  await expect(service.remind('missing')).rejects.toThrow('ORDER_NOT_FOUND');
  expect(mail.send).not.toHaveBeenCalled();
});
it('R07: invalid date is rejected without mail', async () => {
  const { service, mail, store, order } = await fixture();
  await store.save({ ...order, createdAt: 'not-a-date' });
  await expect(service.remind(order.id)).rejects.toThrow('INVALID_ORDER_DATE');
  expect(mail.send).not.toHaveBeenCalled();
});
it('R08: storage read failure prevents mail', async () => {
  const store = {
    findById: vi.fn().mockRejectedValue(new Error('STORE_DOWN')),
    save: vi.fn(),
  };
  const mail = { send: vi.fn() };
  await expect(
    new ReminderService(store, mail, new SystemClock()).remind('REM-2'),
  ).rejects.toThrow('STORE_DOWN');
  expect(mail.send).not.toHaveBeenCalled();
  expect(store.save).not.toHaveBeenCalled();
});
it('R09: mail failure leaves order unchanged', async () => {
  const { service, mail, store, order } = await fixture();
  mail.send.mockRejectedValue(new Error('MAIL_UNAVAILABLE'));
  await expect(service.remind(order.id)).rejects.toThrow('MAIL_UNAVAILABLE');
  expect(await store.findById(order.id)).toEqual(order);
});
it('R10: save failure is propagated after mail acceptance', async () => {
  const { mail, order } = await fixture();
  const store = {
    findById: vi.fn().mockResolvedValue(order),
    save: vi.fn().mockRejectedValue(new Error('SAVE_FAILED')),
  };
  await expect(
    new ReminderService(store, mail, new SystemClock()).remind(order.id),
  ).rejects.toThrow('SAVE_FAILED');
  expect(mail.send).toHaveBeenCalledTimes(1);
});
it('R11: fake store returns copies rather than mutable references', async () => {
  const { store, order } = await fixture();
  const copy = await store.findById(order.id);
  copy!.email = 'changed@example.test';
  expect(await store.findById(order.id)).toEqual(order);
});
