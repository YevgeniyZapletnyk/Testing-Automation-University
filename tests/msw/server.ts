import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const RATE_URL = 'https://rates.example.test/rate';
export const MAIL_URL = 'https://mail.example.test/messages';
export const server = setupServer(
  http.get(RATE_URL, () => HttpResponse.json({ rate: 41.25 })),
  http.post(MAIL_URL, () =>
    HttpResponse.json({ status: 'sent', messageId: 'MSG-1' }, { status: 202 }),
  ),
);
