import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ProductService, Product } from '../../services/product.service';
import { StockAlertService, StockAlert } from '../../services/stock-alert.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  displayedColumns = ['name', 'quantity', 'unitPrice', 'unit'];
  products: Product[] = [];
  form!: FormGroup;
  units = ['Kg', 'g', 'l', 'ml'];
  stockAlerts: StockAlert[] = [];

  constructor(
    private fb: FormBuilder, 
    private productService: ProductService,
    private stockAlertService: StockAlertService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadStockAlerts();
    this.form = this.fb.group({
      name: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      unit: ['', Validators.required],
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loadStockAlerts(); // Reload alerts after products are loaded
      },
      error: (err) => console.error('Error loading products', err),
    });
  }

  loadStockAlerts(): void {
    this.stockAlertService.checkStockAlerts().subscribe({
      next: (alerts) => {
        this.stockAlerts = alerts;
      },
      error: (err) => console.error('Error loading stock alerts', err),
    });
  }

  addProduct(): void {
    if (this.form.valid) {
      this.productService.addProduct(this.form.value).subscribe({
        next: (res) => {
          this.products.push(res);
          this.form.reset();
          this.loadStockAlerts(); // Reload alerts after adding product
        },
        error: (err) => console.error('Error adding product', err),
      });
    }
  }

  getStockAlertForProduct(productName: string): StockAlert | undefined {
    return this.stockAlerts.find(alert => 
      alert.ingredientName.toLowerCase() === productName.toLowerCase()
    );
  }

  getAlertIcon(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  }
}
