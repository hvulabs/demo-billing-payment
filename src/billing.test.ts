import { describe, expect, it } from 'vitest';
import {
  InvoiceStatus,
  PaymentMethod,
  calculateInvoiceTotal,
  createInvoice,
  generateReceipt,
  processPayment,
} from './index.js';
import { round2 } from './utils.js';

describe('round2', () => {
  it('làm tròn tiền về 2 chữ số', () => {
    expect(round2(4.145)).toBe(4.15);
    expect(round2(8.165)).toBe(8.17);
    expect(round2(-2.405)).toBe(-2.41);
    expect(round2(19.99)).toBe(19.99);
    expect(round2(250)).toBe(250);
  });

  it('thuế 7% của dòng 14.95 = 1.0465 -> 1.05', () => {
    const totals = calculateInvoiceTotal([{ description: 'A', quantity: 1, unitPrice: 14.95 }], 0.07);
    expect(totals.totalTax).toBe(1.05);
  });
});

describe('invoice', () => {
  it('tính tổng như ví dụ trong đề', () => {
    const totals = calculateInvoiceTotal(
      [
        { description: 'Monthly Fee', quantity: 1, unitPrice: 500 },
        { description: 'Activity Fee', quantity: 2, unitPrice: 25.5 },
      ],
      0.07,
    );
    expect(totals.subtotal).toBe(551);
    expect(totals.totalTax).toBe(38.57);
    expect(totals.totalAmount).toBe(589.57);
  });

  it('báo lỗi khi dữ liệu sai', () => {
    expect(() => calculateInvoiceTotal([], 0.07)).toThrow();
    expect(() => calculateInvoiceTotal([{ description: 'A', quantity: 0, unitPrice: 10 }], 0)).toThrow();
    expect(() => calculateInvoiceTotal([{ description: 'A', quantity: 1, unitPrice: -5 }], 0)).toThrow();
  });

  it('hoá đơn 0 đồng', () => {
    const inv = createInvoice([{ description: 'Quà tặng', quantity: 1, unitPrice: 0 }], 0.07);
    expect(inv.totalAmount).toBe(0);
    expect(inv.status).toBe(InvoiceStatus.PAID);
  });
});

describe('payment', () => {
  const newInvoice = () => createInvoice([{ description: 'Dịch vụ', quantity: 1, unitPrice: 1000 }], 0);

  it('trả nhiều lần: thiếu -> đủ', () => {
    let inv = newInvoice();
    inv = processPayment(inv, 300, PaymentMethod.CASH).invoice;
    expect(inv.outstandingAmount).toBe(700);
    expect(inv.status).toBe(InvoiceStatus.PARTIALLY_PAID);

    inv = processPayment(inv, 700, PaymentMethod.BANK_TRANSFER).invoice;
    expect(inv.outstandingAmount).toBe(0);
    expect(inv.status).toBe(InvoiceStatus.PAID);
  });

  it('trả dư -> OVERPAID', () => {
    const inv = processPayment(newInvoice(), 1200, PaymentMethod.CASH).invoice;
    expect(inv.outstandingAmount).toBe(-200);
    expect(inv.status).toBe(InvoiceStatus.OVERPAID);
  });

  it('không cho trả khi đã thanh toán xong hoặc số tiền <= 0', () => {
    const inv = newInvoice();
    expect(() => processPayment(inv, 0, PaymentMethod.CASH)).toThrow();

    const paid = processPayment(inv, 1000, PaymentMethod.CASH).invoice;
    expect(() => processPayment(paid, 10, PaymentMethod.CASH)).toThrow();
  });
});

describe('receipt', () => {
  it('tạo biên nhận sau khi thanh toán', () => {
    const inv = createInvoice([{ description: 'Dịch vụ', quantity: 2, unitPrice: 250 }], 0);
    const first = processPayment(inv, 100, PaymentMethod.CASH);
    const second = processPayment(first.invoice, 150, PaymentMethod.CASH);

    const receipt = generateReceipt(second.payment, second.invoice);
    expect(receipt.amountPaid).toBe(150);
    expect(receipt.totalPaid).toBe(250);
    expect(receipt.remainingBalance).toBe(250);
  });
});
