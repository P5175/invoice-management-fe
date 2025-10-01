import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { Observable, finalize, map, tap } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Invoice } from '../../models/invoice.model';
import { InvoiceDialog } from '../invoice-dialog/invoice-dialog';
import { InvoiceService } from '../../services/invoice.service';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    FormsModule, CommonModule, ReactiveFormsModule, TableModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './invoice.html',
  styleUrls: ['./invoice.css'],
  providers: [DialogService]
})

export class InvoiceComponent {

  lazyLoadEvent: any; // store last lazy load event
  totalRecords: number = 0;
  globalFilter: string = '';
  filters: any = {
    invoiceNumber: '',
    fromName: '',
    toName: ''
  };

  loading: boolean = false;
  invoices$!: Observable<Invoice[]>;

  constructor(private fb: FormBuilder, private dialogService: DialogService,
    private invoiceService: InvoiceService) {
  }

  loadInvoicesLazy(event: any) {
    this.lazyLoadEvent = event;
    this.loading = true;

    const params = {
      page: (event.first / event.rows) + 1,
      limit: event.rows,
      sortField: event.sortField || 'invoiceDate',
      sortOrder: event.sortOrder === 1 ? 'asc' : 'desc',
      globalFilter: this.globalFilter,
      filters: this.filters
    };

    this.invoices$ = this.invoiceService.fetchInvoices(params).pipe(
      finalize(() => (this.loading = false)),
      tap(res => this.totalRecords = res.total),
      map(res => res.data)
    );
  }

  getInvoices(params: any) {
    return this.invoiceService.fetchInvoices(params);  // returns observable from backend
  }

  onSearch() {
    if (this.lazyLoadEvent) {
      this.lazyLoadEvent.first = 0;
      this.loadInvoicesLazy(this.lazyLoadEvent);
    }
  }

  openCreateDialog() {
    const ref = this.dialogService.open(InvoiceDialog, {
      header: 'Create Invoice',
      width: '800px',
      data: { mode: 'create' }
    });

    ref?.onClose?.subscribe(result => {
      if (result?.saved) {
        console.log('Invoice created:', result.data);
        this.loadInvoicesLazy(this.lazyLoadEvent);
      }
    });
  }

  openViewDialog(invoice: Invoice) {
    const invoiceNumberWithHash = `#${invoice.invoiceNumber}`;
    this.dialogService.open(InvoiceDialog, {
      header: invoiceNumberWithHash,
      width: '800px',
      data: { mode: 'view', invoice }
    });
  }

}
