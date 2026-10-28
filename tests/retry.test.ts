import { beforeEach, expect, it, vi } from 'vitest';
import { withRetry } from '../src/retry';
beforeEach(() => vi.useFakeTimers());
it('T01: immediate success schedules no delay', async () => {
  const action = vi.fn().mockResolvedValue('ok');
  await expect(withRetry(action)).resolves.toBe('ok');
  expect(action).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
});
it('T02: retry starts only after 1000 ms', async () => {
  const action = vi
    .fn()
    .mockRejectedValueOnce(new Error('TIMEOUT'))
    .mockResolvedValueOnce('ok');
  const result = withRetry(action);
  await vi.advanceTimersByTimeAsync(999);
  expect(action).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(1);
  await expect(result).resolves.toBe('ok');
  expect(action).toHaveBeenCalledTimes(2);
});
it('T03: three failures return the last error at 2000 ms', async () => {
  const last = new Error('LAST_ERROR');
  const action = vi
    .fn()
    .mockRejectedValueOnce(new Error('FIRST'))
    .mockRejectedValueOnce(new Error('SECOND'))
    .mockRejectedValue(last);
  const result = withRetry(action);
  const assertion = expect(result).rejects.toBe(last);
  await vi.advanceTimersByTimeAsync(2000);
  await assertion;
  expect(action).toHaveBeenCalledTimes(3);
  expect(vi.getTimerCount()).toBe(0);
});
it.each([0, -1, 1.5, NaN])('T04: invalid attempts %s', async (attempts) => {
  const action = vi.fn();
  await expect(withRetry(action, attempts)).rejects.toThrow('INVALID_ATTEMPTS');
  expect(action).not.toHaveBeenCalled();
});
it.each([-1, Infinity])('T05: invalid delay %s', async (delay) => {
  await expect(withRetry(vi.fn(), 3, delay)).rejects.toThrow('INVALID_DELAY');
});
it('T06: one attempt has no retry timer', async () => {
  const action = vi.fn().mockRejectedValue(new Error('ONCE'));
  await expect(withRetry(action, 1, 0)).rejects.toThrow('ONCE');
  expect(vi.getTimerCount()).toBe(0);
});
