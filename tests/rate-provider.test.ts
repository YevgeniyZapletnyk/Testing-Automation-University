import { expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { HttpRateProvider } from '../src/rate-provider';
import { RATE_URL, server } from './msw/server';
const provider = new HttpRateProvider('https://rates.example.test');
it('H01: default rate response is 41.25', async () => {
  await expect(provider.getRate('USD', 'UAH')).resolves.toBe(41.25);
});
it('H02: HTTP 503 rejects', async () => {
  server.use(http.get(RATE_URL, () => new HttpResponse(null, { status: 503 })));
  await expect(provider.getRate('USD', 'UAH')).rejects.toThrow(
    'RATE_UNAVAILABLE',
  );
});
it.each([{ rate: '41.25' }, {}, null, 41, { rate: 0 }, { rate: -1 }])(
  'H03: invalid rate payload %j',
  async (payload) => {
    server.use(http.get(RATE_URL, () => HttpResponse.json(payload)));
    await expect(provider.getRate('USD', 'UAH')).rejects.toThrow(
      'INVALID_RATE_FORMAT',
    );
  },
);
it('H04: currency query parameters are sent', async () => {
  let captured: URL | undefined;
  server.use(
    http.get(RATE_URL, ({ request }) => {
      captured = new URL(request.url);
      return HttpResponse.json({ rate: 1 });
    }),
  );
  await provider.getRate('EUR', 'PLN');
  expect(captured?.searchParams.get('from')).toBe('EUR');
  expect(captured?.searchParams.get('to')).toBe('PLN');
});
it('H05: transport error rejects', async () => {
  server.use(http.get(RATE_URL, () => HttpResponse.error()));
  await expect(provider.getRate('USD', 'UAH')).rejects.toThrow();
});
it('H06: malformed JSON rejects with format error', async () => {
  server.use(
    http.get(
      RATE_URL,
      () =>
        new HttpResponse('{broken', {
          headers: { 'Content-Type': 'application/json' },
        }),
    ),
  );
  await expect(provider.getRate('USD', 'UAH')).rejects.toThrow(
    'INVALID_RATE_FORMAT',
  );
});
it('H07: unhandled request is blocked by MSW', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  await expect(
    fetch('https://unhandled.example.test/no-handler'),
  ).rejects.toThrow();
  expect(error).toHaveBeenCalled();
});
