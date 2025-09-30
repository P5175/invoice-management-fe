import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private baseUrl = 'https://invoicemanagementbe-odyt--3000--96435430.local-credentialless.webcontainer.io/invoice'; // NestJS backend URL

  constructor(private http: HttpClient) {}

  // Save invoice
  saveInvoice(invoice: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, invoice);
  }

  // Fetch invoices with pagination, sorting, and filters
  fetchInvoices(fetchParams: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/fetch`, fetchParams);
  }
}
