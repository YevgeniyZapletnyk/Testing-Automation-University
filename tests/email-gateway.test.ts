import { expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { HttpEmailGateway } from '../src/email-gateway';
import { MAIL_URL, server } from './msw/server';
const gateway = new HttpEmailGateway('https://mail.example.test');
it('M01: HTTP 202 with sent status returns message id', async () => {
  await expect(gateway.send('student@example.test', 'Hello')).resolves.toBe(
    'MSG-1',
  );
});
it.each([400, 429, 503])('M02: HTTP %s rejects', async (status) => {
  server.use(http.post(MAIL_URL, () => new HttpResponse(null, { status })));
  await expect(gateway.send('x@example.test', 'Hello')).rejects.toThrow(
    'MAIL_UNAVAILABLE',
  );
});
it.each([
  null,
  42,
  {},
  { status: 'queued', messageId: 'M' },
  { status: 'sent' },
  { status: 'sent', messageId: 42 },
  { status: 'sent', messageId: '  ' },
])('M03: invalid mail payload %j', async (payload) => {
  server.use(http.post(MAIL_URL, () => HttpResponse.json(payload)));
  await expect(gateway.send('x@example.test', 'Hello')).rejects.toThrow(
    'INVALID_MAIL_RESPONSE',
  );
});
it('M04: sends POST with JSON body and content type', async () => {
  let body: unknown;
  let contentType: string | null = null;
  server.use(
    http.post(MAIL_URL, async ({ request }) => {
      body = await request.json();
      contentType = request.headers.get('content-type');
      return HttpResponse.json({ status: 'sent', messageId: 'BODY-1' });
    }),
  );
  await gateway.send('student@example.test', 'Нагадування REM-2');
  expect(body).toEqual({
    to: 'student@example.test',
    text: 'Нагадування REM-2',
  });
  expect(contentType).toBe('application/json');
});
it('M05: transport failure rejects', async () => {
  server.use(http.post(MAIL_URL, () => HttpResponse.error()));
  await expect(gateway.send('x@example.test', 'Hello')).rejects.toThrow();
});
it('M06: invalid JSON rejects with domain error', async () => {
  server.use(http.post(MAIL_URL, () => new HttpResponse('broken')));
  await expect(gateway.send('x@example.test', 'Hello')).rejects.toThrow(
    'INVALID_MAIL_RESPONSE',
  );
});
