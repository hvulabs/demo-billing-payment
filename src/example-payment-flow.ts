import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import {
  PaymentMethod,
  createInvoice,
  generateReceipt,
  processPayment,
  type Invoice,
  type InvoiceItemInput,
} from './index.js';

const rl = readline.createInterface({ input, output });

async function askNumber(question: string): Promise<number> {
  while (true) {
    const n = Number(await rl.question(question));
    if (!Number.isNaN(n)) return n;
    console.log('Vui lòng nhập số.');
  }
}

function printInvoice(invoice: Invoice) {
  console.log(
    `Tổng: ${invoice.totalAmount.toFixed(2)} | Còn nợ: ${invoice.outstandingAmount.toFixed(2)} | ${invoice.status}`,
  );
}

async function main() {
  console.log('===== TẠO HOÁ ĐƠN =====');
  const count = await askNumber('Số sản phẩm: ');

  const items: InvoiceItemInput[] = [];
  for (let i = 1; i <= count; i++) {
    const description = await rl.question(`Sản phẩm ${i}: `);
    const quantity = await askNumber('  số lượng: ');
    const unitPrice = await askNumber('  đơn giá: ');
    items.push({ description, quantity, unitPrice });
  }

  const taxPercent = await askNumber('Thuế (%): ');
  let invoice = createInvoice(items, taxPercent / 100);

  console.log(`\nĐã tạo hoá đơn ${invoice.invoiceNumber}, thuế: ${invoice.totalTax.toFixed(2)}`);
  printInvoice(invoice);

  console.log('\n===== THANH TOÁN =====');
  while (invoice.outstandingAmount > 0) {
    const raw = await rl.question('Số tiền thanh toán (Enter để dừng): ');
    if (raw.trim() === '') break;

    const method = (await rl.question('Phương thức (1 = tiền mặt, 2 = chuyển khoản): ')) === '2'
      ? PaymentMethod.BANK_TRANSFER
      : PaymentMethod.CASH;

    try {
      const result = processPayment(invoice, Number(raw), method);
      invoice = result.invoice;
      const receipt = generateReceipt(result.payment, invoice);
      console.log(`Biên nhận ${receipt.receiptNumber}: đã trả ${receipt.amountPaid.toFixed(2)}`);
      printInvoice(invoice);
    } catch (err) {
      console.log('Lỗi:', (err as Error).message);
    }
  }

  console.log('\n===== KẾT THÚC =====');
  printInvoice(invoice);
}

main()
  .catch((err) => console.error((err as Error).message))
  .finally(() => rl.close());
