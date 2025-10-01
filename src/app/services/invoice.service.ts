import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private baseUrl = 'http://localhost:3000/invoice';

  // Sample dataset for mocking
  private ALL_INVOICES: Invoice[] = Array.from({ length: 50 }).map((_, i) => ({
    id: i + 1,
    invoiceNumber: `INV${String(i + 1).padStart(3, '0')}`,
    fromName: `Company ${String.fromCharCode(65 + (i % 26))}`,
    fromAddress: `Address ${i + 1}`,
    toName: `Client ${i + 1}`,
    toAddress: `Client Address ${i + 1}`,
    invoiceDate: new Date(2025, i % 12, (i % 28) + 1),
    items: [
      { itemName: `Item ${i + 1}`, quantity: (i % 5) + 1, rate: 10 * (i + 1), total: ((i % 5) + 1) * 10 * (i + 1) }
    ],
    totalAmount: ((i % 5) + 1) * 10 * (i + 1)
  }));

  constructor(private http: HttpClient) { }

  // Save invoice
  saveInvoice(invoice: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, invoice);
  }

  fetchInvoices(fetchParams: any): Observable<{ data: Invoice[]; total: number }> {
    let filtered = [...this.ALL_INVOICES];

    // --- Global filter ---
    if (fetchParams.globalFilter) {
      const gf = fetchParams.globalFilter.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(gf) ||
        inv.fromName.toLowerCase().includes(gf) ||
        inv.toName.toLowerCase().includes(gf) ||
        inv.totalAmount.toString().includes(gf)
      );
    }

    // --- Field-specific filters ---
    if (fetchParams.filters) {
      for (const key in fetchParams.filters) {
        const val = fetchParams.filters[key]?.toLowerCase();
        if (val) {
          filtered = filtered.filter(inv => {
            const field = key as keyof Invoice;
            const fieldValue = inv[field];
            if (typeof fieldValue === 'string') return fieldValue.toLowerCase().includes(val);
            if (typeof fieldValue === 'number') return fieldValue.toString().includes(val);
            return false;
          });
        }
      }
    }

    // --- Sorting ---
    if (fetchParams.sortField) {
      const field = fetchParams.sortField as keyof Invoice;
      filtered.sort((a, b) => {
        let valA: any = a[field];
        let valB: any = b[field];

        if (valA instanceof Date) valA = valA.getTime();
        if (valB instanceof Date) valB = valB.getTime();

        if (fetchParams.sortOrder === 'asc') return valA > valB ? 1 : valA < valB ? -1 : 0;
        else return valA < valB ? 1 : valA > valB ? -1 : 0;
      });
    }

    // --- Pagination ---
    const total = filtered.length;
    const start = ((fetchParams.page ?? 1) - 1) * (fetchParams.limit ?? 5);
    const end = start + (fetchParams.limit ?? 5);
    const paged = filtered.slice(start, end);

    // Simulate HTTP call with delay
    return of({ data: paged, total }).pipe(delay(300));
  }
}
