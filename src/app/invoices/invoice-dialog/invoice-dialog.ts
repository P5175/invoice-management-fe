import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DynamicDialogRef, DynamicDialogConfig } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { Invoice } from "../../models/invoice.model";


@Component({
  selector: 'app-invoice-dialog',
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  standalone: true,
  templateUrl: './invoice-dialog.html',
  styleUrl: './invoice-dialog.css'
})
export class InvoiceDialog {
  invoiceForm: FormGroup;
  mode: 'create' | 'view' = 'create';

  get fromName() { return this.invoiceForm.get('fromName'); }
  get fromAddress() { return this.invoiceForm.get('fromAddress'); }
  get toName() { return this.invoiceForm.get('toName'); }
  get toAddress() { return this.invoiceForm.get('toAddress'); }
  get invoiceDate() { return this.invoiceForm.get('invoiceDate'); }


  constructor(
    private fb: FormBuilder,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    this.invoiceForm = this.fb.group({
      fromName: ['', Validators.required],
      fromAddress: ['', Validators.required],
      toName: ['', Validators.required],
      toAddress: ['', Validators.required],
      invoiceDate: [new Date(), Validators.required],
      items: this.fb.array([]),
      totalAmount: [0]
    });
  }

  ngOnInit() {
    if (this.config.data?.mode) {
      this.mode = this.config.data.mode;
    }

    if (this.mode === 'view' && this.config.data?.invoice) {
      const invoice: Invoice = this.config.data.invoice;

      this.invoiceForm.reset({
        fromName: invoice.fromName,
        fromAddress: invoice.fromAddress,
        toName: invoice.toName,
        toAddress: invoice.toAddress,
        invoiceDate: invoice.invoiceDate,
        totalAmount: invoice.totalAmount
      });

      this.items.clear(); // clear any existing items
      invoice.items.forEach(item => {
        const itemForm = this.fb.group({
          itemName: [item.itemName, Validators.required],
          quantity: [item.quantity, [Validators.required, Validators.min(1)]],
          rate: [item.rate, [Validators.required, Validators.min(0)]],
          total: [{ value: item.total, disabled: true }]
        });
        this.items.push(itemForm);
      });
      this.invoiceForm.disable();
    } else if (this.mode === 'create') {
      this.addItem();
    }
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  addItem() {
    const itemForm = this.fb.group({
      itemName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      rate: [0, [Validators.required, Validators.min(0)]],
      total: [{ value: 0, disabled: true }]
    });

    itemForm.valueChanges.subscribe(val => {
      const total = (val.quantity ?? 0) * (val.rate ?? 0);
      itemForm.get('total')?.setValue(total, { emitEvent: false });
      this.updateTotalAmount();
    });

    this.items.push(itemForm);
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.updateTotalAmount();
  }

  updateTotalAmount() {
    const total = this.items.controls.reduce((sum, ctrl) => sum + (ctrl.get('total')?.value || 0), 0);
    this.invoiceForm.get('totalAmount')?.setValue(total);
  }

  save() {
    if (this.invoiceForm.valid) {
      this.ref.close({ saved: true, data: this.invoiceForm.value });
    }else {
      this.invoiceForm.markAllAsTouched(); 
    }
  }

  close() {
    this.ref.close();
  }
}
