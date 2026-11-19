export enum InvoiceStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERPAID = 'OVERPAID',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
}

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceItem extends InvoiceItemInput {
  id: string;
  lineTotal: number;
  taxAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  totalTax: number;
  totalAmount: number;
  outstandingAmount: number;
  status: InvoiceStatus;
}

export interface Payment {
  id: string;
  invoiceId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  paymentDate: Date;
  referenceNumber: string;
}

export interface Receipt {
  receiptNumber: string;
  paymentId: string;
  invoiceNumber: string;
  receiptDate: Date;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  totalPaid: number;
  remainingBalance: number;
  items: InvoiceItem[];
}
