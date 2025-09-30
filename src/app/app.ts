import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InvoiceComponent } from './invoices/invoice/invoice';

@Component({
  selector: 'app-root',
  imports: [InvoiceComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Invoice Manage');
}
