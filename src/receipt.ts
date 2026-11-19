import type { Invoice, Payment, Receipt } from './types.js';
import { makeNumber, round2 } from './utils.js';

// invoice ở đây là invoice SAU khi đã thanh toán
export function generateReceipt(payment: Payment, invoice: Invoice): Receipt {
  if (payment.invoiceId !== invoice.id) {
    throw new Error('Payment không thuộc hoá đơn này');
  }

  return {
    receiptNumber: makeNumber('RCP', payment.paymentDate),
    paymentId: payment.id,
    invoiceNumber: invoice.invoiceNumber,
    receiptDate: payment.paymentDate,
    paymentMethod: payment.paymentMethod,
    amountPaid: payment.amount,
    totalPaid: round2(invoice.totalAmount - invoice.outstandingAmount),
    remainingBalance: invoice.outstandingAmount,
    items: invoice.items,
  };
}
