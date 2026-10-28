export interface ReminderOrder {
  id: string;
  email: string;
  createdAt: string;
  remindedAt?: string;
  messageId?: string;
}
export interface ReminderStore {
  findById(id: string): Promise<ReminderOrder | undefined>;
  save(order: ReminderOrder): Promise<void>;
}
export interface EmailGateway {
  send(email: string, text: string): Promise<string>;
}
export interface Clock {
  now(): number;
}
export type ReminderResult =
  | { sent: true; messageId: string }
  | { sent: false; reason: 'NOT_DUE' | 'ALREADY_SENT' };
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export class ReminderService {
  constructor(
    private store: ReminderStore,
    private mail: EmailGateway,
    private clock: Clock,
  ) {}
  async remind(id: string): Promise<ReminderResult> {
    const order = await this.store.findById(id);
    if (!order) throw new Error('ORDER_NOT_FOUND');
    if (order.remindedAt !== undefined)
      return { sent: false, reason: 'ALREADY_SENT' };
    const createdAt = Date.parse(order.createdAt);
    if (!Number.isFinite(createdAt)) throw new Error('INVALID_ORDER_DATE');
    const now = this.clock.now();
    if (now - createdAt <= SEVEN_DAYS_MS)
      return { sent: false, reason: 'NOT_DUE' };
    const messageId = await this.mail.send(
      order.email,
      `Нагадування про замовлення ${order.id}`,
    );
    await this.store.save({
      ...order,
      remindedAt: new Date(now).toISOString(),
      messageId,
    });
    return { sent: true, messageId };
  }
}
