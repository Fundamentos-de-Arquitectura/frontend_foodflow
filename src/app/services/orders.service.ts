import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// Backend Order structure (from orders service)
export interface BackendOrderItem {
  dishId: number;
  dishName: string;
  quantity: number;
  unitPrice: number;
  finalPrice: number;
}

export interface StockWarning {
  ingredientName: string;
  warningLevel: string; // "OUT_OF_STOCK", "LOW_STOCK", "CRITICAL"
  availableQuantity: number;
  requiredQuantity: number;
  message: string;
}

export interface BackendOrder {
  id: number;
  tableNumber: number;
  items: BackendOrderItem[];
  totalPrice: number;
  createdAt: string;
  stockWarnings?: StockWarning[]; // Optional stock warnings
}

// Frontend Order interface (for UI compatibility)
export interface OrderItem {
  dishId: number;
  dishName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id?: number;
  tableNumber: number;
  items: OrderItem[];
  totalPrice: number;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = 'http://localhost:8060/api/v1/orders'; // API Gateway routes to orders service

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Order[]> {
    return this.http.get<BackendOrder[]>(this.apiUrl).pipe(
      map(orders => orders.map(o => this.mapBackendToFrontend(o)).sort((a, b) => b.date.getTime() - a.date.getTime()))
    );
  }

  calculateItemTotal(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }

  addOrder(order: Omit<Order, 'id' | 'date'>): Observable<any> {
    // Get userId from localStorage
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      throw new Error('User ID not found. Please log in again.');
    }
    const userId = parseInt(userIdStr, 10);

    // Map frontend order to backend format
    const backendOrder = {
      tableNumber: order.tableNumber,
      dishes: order.items.map(item => ({
        dishId: item.dishId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        finalPrice: item.total
      })),
      userId: userId
    };
    return this.http.post(this.apiUrl, backendOrder);
  }

  getFormattedDishes(order: Order): string {
    return order.items.map(item => `${item.dishName} (x${item.quantity})`).join(', ');
  }

  private mapBackendToFrontend(backend: BackendOrder): Order {
    return {
      id: backend.id,
      tableNumber: backend.tableNumber,
      items: backend.items.map(item => ({
        dishId: item.dishId,
        dishName: item.dishName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.finalPrice)
      })),
      totalPrice: Number(backend.totalPrice),
      date: new Date(backend.createdAt)
    };
  }

  /**
   * Extract error message from backend error
   */
  extractErrorMessage(error: any): string {
    if (error.error?.error) {
      return error.error.error;
    }
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An error occurred while processing the order';
  }
}
