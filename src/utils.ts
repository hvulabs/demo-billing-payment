import { randomUUID } from 'node:crypto';

// làm tròn 2 chữ số thập phân (half away from zero).
// Nhân thêm (1 + EPSILON) để bù sai số nhị phân, vd 1.005 * 100 = 100.49999999999999
export function round2(n: number): number {
  const cents = Math.round(Math.abs(n) * 100 * (1 + Number.EPSILON));
  return (Math.sign(n) * cents) / 100;
}

export function newId(): string {
  return randomUUID();
}

// vd: INV-20260115-1A2B3C
export function makeNumber(prefix: string, date: Date): string {
  const day = date.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = randomUUID().slice(0, 6).toUpperCase();
  return `${prefix}-${day}-${rand}`;
}
