import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { ReminderService } from '../src/reminder-service.ts';
import { HttpEmailGateway } from '../src/email-gateway.ts';
import { InMemoryReminderStore } from '../tests/fakes/in-memory-repository.ts';

const days = Number(process.argv[2] ?? '8');
const mode = process.argv[3] ?? 'success';
if (
  !Number.isFinite(days) ||
  days < 0 ||
  !['success', 'http-error', 'bad-response'].includes(mode)
) {
  process.stderr.write(
    'Usage: npm run demo:lab4 -- <nonnegative days> [success|http-error|bad-response]\n',
  );
  process.exit(1);
}
const now = Date.parse('2026-03-15T10:00:00.000Z');
let requests = 0;
const server = setupServer(
  http.post('https://mail.example.test/messages', () => {
    requests++;
    if (mode === 'http-error') return new HttpResponse(null, { status: 503 });
    if (mode === 'bad-response') return HttpResponse.json({ status: 'queued' });
    return HttpResponse.json(
      { status: 'sent', messageId: 'DEMO-2' },
      { status: 202 },
    );
  }),
);
server.listen({ onUnhandledRequest: 'error' });
const store = new InMemoryReminderStore();
await store.save({
  id: 'DEMO-2',
  email: 'student@example.test',
  createdAt: new Date(now - days * 86400000).toISOString(),
});
const service = new ReminderService(
  store,
  new HttpEmailGateway('https://mail.example.test'),
  { now: () => now },
);
try {
  const result = await service.remind('DEMO-2');
  process.stdout.write(
    JSON.stringify(
      { days, mode, result, requests, stored: await store.findById('DEMO-2') },
      null,
      2,
    ) + '\n',
  );
} catch (error) {
  process.stdout.write(
    JSON.stringify(
      {
        days,
        mode,
        error: error instanceof Error ? error.message : String(error),
        requests,
        stored: await store.findById('DEMO-2'),
      },
      null,
      2,
    ) + '\n',
  );
  process.exitCode = 1;
} finally {
  server.close();
}
