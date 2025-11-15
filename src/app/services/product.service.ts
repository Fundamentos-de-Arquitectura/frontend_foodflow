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
  private apiUrl = 'http://localhost:8060/api/v1/products'; // API Gateway routes to inventory service

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<BackendProduct[]>(this.apiUrl).pipe(
      map(products => products.map(p => this.mapBackendToFrontend(p)))
    );
  }

  addProduct(product: Product): Observable<any> {
    // Map frontend product to backend format
    const backendProduct = {
      name: product.name,
      productItemId: product.id || null,
      quantity: product.quantity,
      expirationDate: null, // Can be set if needed
      price: product.unitPrice
    };
    return this.http.post(this.apiUrl, backendProduct);
  }

  private mapBackendToFrontend(backend: BackendProduct): Product {
    return {
      id: backend.productId,
      name: backend.name,
      quantity: backend.quantity?.quantity || 0,
      unitPrice: backend.price?.price ? Number(backend.price.price) : 0,
      unit: 'unit' // Default unit since backend doesn't provide it
    };
  }
}
