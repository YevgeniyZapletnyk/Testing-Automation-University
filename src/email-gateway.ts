import type { EmailGateway } from './reminder-service';

export class HttpEmailGateway implements EmailGateway {
  constructor(private baseUrl: string) {}
  async send(email: string, text: string): Promise<string> {
    const response = await fetch(new URL('/messages', this.baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: email, text }),
    });
    if (!response.ok) throw new Error('MAIL_UNAVAILABLE');
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error('INVALID_MAIL_RESPONSE');
    }
    if (
      typeof data !== 'object' ||
      data === null ||
      !('status' in data) ||
      data.status !== 'sent' ||
      !('messageId' in data) ||
      typeof data.messageId !== 'string' ||
      data.messageId.trim() === ''
    ) {
      throw new Error('INVALID_MAIL_RESPONSE');
    }
    return data.messageId;
  }
}
