export interface InvoiceItem {
  itemName: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Invoice {
  id: number;
  fromName: string;
  fromAddress: string;
  toName: string;
  toAddress: string;
  invoiceNumber: string;
  invoiceDate: Date;
  items: InvoiceItem[];
  totalAmount: number;
}
