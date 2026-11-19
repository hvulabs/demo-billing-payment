import { type Invoice, type Payment, InvoiceStatus, PaymentMethod } from './types.js';
import { newId, makeNumber, round2 } from './utils.js';

function getStatus(outstanding: number): InvoiceStatus {
  if (outstanding > 0) return InvoiceStatus.PARTIALLY_PAID;
  if (outstanding === 0) return InvoiceStatus.PAID;
  return InvoiceStatus.OVERPAID;
}

export function processPayment(invoice: Invoice, amount: number, method: PaymentMethod) {
  if (invoice.outstandingAmount <= 0) {
    throw new Error('Hoá đơn đã thanh toán xong');
  }
  if (!(amount > 0)) {
    throw new Error('Số tiền thanh toán phải lớn hơn 0');
  }

  const now = new Date();
  const payment: Payment = {
    id: newId(),
    invoiceId: invoice.id,
    paymentMethod: method,
    amount: round2(amount),
    paymentDate: now,
    referenceNumber: makeNumber('PMT', now),
  };

  const outstanding = round2(invoice.outstandingAmount - payment.amount);

  // trả về invoice mới, không sửa invoice cũ
  const updatedInvoice: Invoice = {
    ...invoice,
    outstandingAmount: outstanding,
    status: getStatus(outstanding),
  };

  return { payment, invoice: updatedInvoice };
}
