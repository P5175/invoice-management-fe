import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Invoice } from '../../models/invoice.model';
import { DialogService } from 'primeng/dynamicdialog';
import { InvoiceDialog } from '../invoice-dialog/invoice-dialog';
import { InvoiceService } from '../../services/invoice.service';

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
  loading: boolean = false;
  globalFilter: string = '';
  filters: any = {
    invoiceNumber: '',
    fromName: '',
    toName: ''
  };

  invoices: Invoice[] = [];

  constructor(private fb: FormBuilder, private dialogService: DialogService,
    private invoiceService: InvoiceService) {
  }

  ngOnInit() {
    this.loadInvoicesLazy({ first: 0, rows: 5, sortField: 'invoiceDate', sortOrder: 1 });
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

    this.getInvoices(params).subscribe(res => {
      this.invoices = res.data;
      this.totalRecords = res.total;
      this.loading = false;
    });
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
