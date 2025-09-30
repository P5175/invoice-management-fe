import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Invoice } from '../../models/invoice.model';
import { of, delay } from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { InvoiceDialog } from '../invoice-dialog/invoice-dialog';

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

  // Sample full dataset
  ALL_INVOICES: Invoice[] = [
    { id: 1, invoiceNumber: 'INV001', fromName: 'ABC Corp', fromAddress: 'Addr A', toName: 'XYZ Ltd', toAddress: 'Addr B', invoiceDate: new Date('2025-01-01'), items: [], totalAmount: 100 },
    { id: 2, invoiceNumber: 'INV002', fromName: 'DEF Corp', fromAddress: 'Addr C', toName: 'UVW Ltd', toAddress: 'Addr D', invoiceDate: new Date('2025-02-01'), items: [], totalAmount: 200 },
    { id: 3, invoiceNumber: 'INV003', fromName: 'GHI Corp', fromAddress: 'Addr E', toName: 'RST Ltd', toAddress: 'Addr F', invoiceDate: new Date('2025-03-01'), items: [], totalAmount: 300 },
    // ... add more to test pagination
  ];


  constructor(private fb: FormBuilder, private dialogService: DialogService) {
  }

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.ALL_INVOICES = [];
    for (let i = 1; i <= 50; i++) {
      this.ALL_INVOICES.push({
        id: i,
        fromName: `Company ${String.fromCharCode(64 + (i % 26 || 26))}`,
        fromAddress: `Address ${i}`,
        toName: `Client ${i}`,
        toAddress: `Client Address ${i}`,
        invoiceNumber: `INV${String(i).padStart(3, '0')}`,
        invoiceDate: new Date(2025, i % 12, (i % 28) + 1),
        items: [
          { itemName: `Item ${i}`, quantity: (i % 5) + 1, rate: 10 * i, total: ((i % 5) + 1) * 10 * i }
        ],
        totalAmount: ((i % 5) + 1) * 10 * i
      });
    }

    // Directly return all invoices (for frontend testing)
    this.invoices = [...this.ALL_INVOICES];
    this.totalRecords = this.ALL_INVOICES.length;
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
      this.totalRecords = res.totalRecords;
      this.loading = false;
    });
  }

  getInvoices(params: any) {
    let filtered = [...this.ALL_INVOICES];

    // --- Global filter ---
    if (params.globalFilter) {
      const gf = params.globalFilter.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(gf) ||
        inv.fromName.toLowerCase().includes(gf) ||
        inv.toName.toLowerCase().includes(gf)
      );
    }

    // --- Field-wise filters ---
    if (params.filters) {
      for (const key in params.filters) {
        const val = params.filters[key]?.toLowerCase();
        if (val) {
          filtered = filtered.filter(inv => {
            const field = key as keyof Invoice;
            const fieldValue = inv[field];
            return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(val);
          });
        }
      }
    }

    // --- Sorting ---
    if (params.sortField) {
      const sortField = params.sortField as keyof Invoice;
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (aValue instanceof Date) aValue = aValue.getTime();
        if (bValue instanceof Date) bValue = bValue.getTime();

        if (params.sortOrder === 'asc' || params.sortOrder === 1) {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    // --- Pagination ---
    const totalRecords = filtered.length;
    const start = ((params.page ?? 1) - 1) * (params.limit ?? 5);
    const end = start + (params.limit ?? 5);
    const paged = filtered.slice(start, end);

    // Return observable to simulate HTTP call with delay
    return of({ data: paged, totalRecords }).pipe(delay(300)); // 300ms delay
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
        this.ALL_INVOICES.push(result.data);
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
