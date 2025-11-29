import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Backend Product structure (from inventory service)
export interface BackendProduct {
  productId?: number;
  name: string;
  quantity?: {
    quantity: number;
  };
  price?: {
    price: number;
  };
  expirationDate?: string;
}

// Frontend Product interface (for UI compatibility)
export interface Product {
  id?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string; // Not in backend, but needed for UI
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = '/api/v1/products'; // Proxy handles routing
  private unitMap = new Map<string, string>(); // Store units by product name

  constructor(private http: HttpClient) { }

  private getUserId(): number {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }
    return parseInt(userId, 10);
  }

  getProducts(): Observable<Product[]> {
    const userId = this.getUserId();
    return this.http.get<BackendProduct[]>(`${this.apiUrl}/users/${userId}`).pipe(
      map(products => products.map(p => this.mapBackendToFrontend(p)))
    );
  }

  addProduct(product: Product): Observable<any> {
    const userId = this.getUserId();
    // Store the unit value for this product
    if (product.unit) {
      this.unitMap.set(product.name, product.unit);
    }
    // Map frontend product to backend format
    // Backend expects: name (String), productItemId (Long | null), quantity (Integer), expirationDate (LocalDate - REQUIRED, must be future date), price (BigDecimal)
    // ExpirationDate cannot be null - set to 1 year from now as default
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    const expirationDateString = expirationDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const backendProduct = {
      name: product.name,
      productItemId: product.id ? product.id : null,
      quantity: Math.floor(product.quantity), // Ensure integer
      expirationDate: expirationDateString, // Set to 1 year from now (required, must be future date)
      price: product.unitPrice // Will be converted to BigDecimal by backend
    };
    return this.http.post(`${this.apiUrl}/users/${userId}`, backendProduct);
  }

  private mapBackendToFrontend(backend: BackendProduct): Product {
    // Use stored unit if available, otherwise default to 'unit'
    const storedUnit = this.unitMap.get(backend.name);
    return {
      id: backend.productId,
      name: backend.name,
      quantity: backend.quantity?.quantity || 0,
      unitPrice: backend.price?.price ? Number(backend.price.price) : 0,
      unit: storedUnit || 'unit' // Use stored unit or default to 'unit'
    };
  }
}
