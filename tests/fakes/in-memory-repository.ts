import type { OrderRecord, OrderRepository } from '../../src/order-service';
import type { ReminderOrder, ReminderStore } from '../../src/reminder-service';

export class InMemoryOrderRepository implements OrderRepository {
  private items = new Map<string, OrderRecord>();
  async save(record: OrderRecord): Promise<void> {
    this.items.set(record.id, { ...record });
  }
  async findById(id: string): Promise<OrderRecord | undefined> {
    const item = this.items.get(id);
    return item ? { ...item } : undefined;
  }
  get size(): number {
    return this.items.size;
  }
}
export class InMemoryReminderStore implements ReminderStore {
  private items = new Map<string, ReminderOrder>();
  async save(record: ReminderOrder): Promise<void> {
    this.items.set(record.id, { ...record });
  }
  async findById(id: string): Promise<ReminderOrder | undefined> {
    const item = this.items.get(id);
    return item ? { ...item } : undefined;
  }
}
