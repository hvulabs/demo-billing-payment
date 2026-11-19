import { type Invoice, type InvoiceItem, type InvoiceItemInput, InvoiceStatus } from './types.js';
import { newId, makeNumber, round2 } from './utils.js';

export function calculateInvoiceTotal(items: InvoiceItemInput[], taxRate: number) {
  if (items.length === 0) {
    throw new Error('Hoá đơn phải có ít nhất 1 sản phẩm');
  }
  if (taxRate < 0 || taxRate > 1) {
    throw new Error('Thuế suất phải từ 0 đến 1');
  }

  let subtotal = 0;
  let totalTax = 0;

  const lines: InvoiceItem[] = items.map((item) => {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error(`Số lượng không hợp lệ: ${item.quantity}`);
    }
    if (item.unitPrice < 0) {
      throw new Error(`Đơn giá không hợp lệ: ${item.unitPrice}`);
    }

    const lineTotal = round2(item.quantity * item.unitPrice);
    const taxAmount = round2(lineTotal * taxRate); // thuế tính theo từng dòng

    subtotal += lineTotal;
    totalTax += taxAmount;

    return { id: newId(), ...item, lineTotal, taxAmount };
  });

  subtotal = round2(subtotal);
  totalTax = round2(totalTax);

  return {
    items: lines,
    subtotal,
    totalTax,
    totalAmount: round2(subtotal + totalTax),
  };
}

export function createInvoice(items: InvoiceItemInput[], taxRate: number): Invoice {
  const totals = calculateInvoiceTotal(items, taxRate);
  const now = new Date();

  return {
    id: newId(),
    invoiceNumber: makeNumber('INV', now),
    invoiceDate: now,
    ...totals,
    outstandingAmount: totals.totalAmount,
    // hoá đơn 0 đồng thì coi như đã thanh toán
    status: totals.totalAmount === 0 ? InvoiceStatus.PAID : InvoiceStatus.UNPAID,
  };
}
