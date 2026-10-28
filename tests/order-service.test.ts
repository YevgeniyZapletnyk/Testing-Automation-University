import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderService } from '../src/order-service';
import { InMemoryOrderRepository } from './fakes/in-memory-repository';

const input = { id: 'A-1', amountUsd: 100, email: 'student@example.test' };
describe('OrderService: test doubles', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-15T10:00:00.000Z'));
  });
  function fixture() {
    const rates = { getRate: vi.fn().mockResolvedValue(41) };
    const repo = new InMemoryOrderRepository();
    const notifier = { send: vi.fn().mockResolvedValue(undefined) };
    return {
      rates,
      repo,
      notifier,
      service: new OrderService(rates, repo, notifier),
    };
  }
  it('O01: 100 USD at 41 gives 4100 UAH', async () => {
    const { service } = fixture();
    expect((await service.placeOrder(input)).amountUah).toBe(4100);
  });
  it('O02: one notification contains recipient and amount', async () => {
    const { service, notifier } = fixture();
    await service.placeOrder(input);
    expect(notifier.send).toHaveBeenCalledExactlyOnceWith(
      input.email,
      'Замовлення A-1 на суму 4100 грн прийнято',
    );
  });
  it.each([0, -1, NaN, Infinity])(
    'O03: invalid amount %s has no side effects',
    async (amountUsd) => {
      const { service, rates, repo, notifier } = fixture();
      await expect(service.placeOrder({ ...input, amountUsd })).rejects.toThrow(
        'INVALID_AMOUNT',
      );
      expect(rates.getRate).not.toHaveBeenCalled();
      expect(repo.size).toBe(0);
      expect(notifier.send).not.toHaveBeenCalled();
    },
  );
  it('O04: saved state equals returned record', async () => {
    const { service, repo } = fixture();
    const result = await service.placeOrder(input);
    expect(await repo.findById(input.id)).toEqual(result);
    expect(repo.size).toBe(1);
  });
  it('O05: rate failure leaves store empty and sends no mail', async () => {
    const { service, rates, repo, notifier } = fixture();
    rates.getRate.mockRejectedValue(new Error('RATE_UNAVAILABLE'));
    await expect(service.placeOrder(input)).rejects.toThrow('RATE_UNAVAILABLE');
    expect(repo.size).toBe(0);
    expect(notifier.send).not.toHaveBeenCalled();
  });
  it('O06: createdAt uses the frozen clock', async () => {
    const { service } = fixture();
    expect((await service.placeOrder(input)).createdAt).toBe(
      '2026-03-15T10:00:00.000Z',
    );
  });
  it('O07: save called once (interaction experiment)', async () => {
    const { rates, notifier } = fixture();
    const repo = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
    };
    await new OrderService(rates, repo, notifier).placeOrder(input);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });
  it('O08: repository failure prevents notification', async () => {
    const { rates, notifier } = fixture();
    const repo = {
      save: vi.fn().mockRejectedValue(new Error('STORE_DOWN')),
      findById: vi.fn(),
    };
    await expect(
      new OrderService(rates, repo, notifier).placeOrder(input),
    ).rejects.toThrow('STORE_DOWN');
    expect(notifier.send).not.toHaveBeenCalled();
  });
  it('O09: notifier failure propagates after saving', async () => {
    const { service, notifier, repo } = fixture();
    notifier.send.mockRejectedValue(new Error('MAIL_DOWN'));
    await expect(service.placeOrder(input)).rejects.toThrow('MAIL_DOWN');
    expect(repo.size).toBe(1);
  });
});
