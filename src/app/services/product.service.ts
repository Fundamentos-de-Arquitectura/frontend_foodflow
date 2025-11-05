import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id?: number;
  name: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'https://localhost:8080/api/v1/products'; // cambia esto

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }
}
