import type { Clock } from './reminder-service';

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
}
