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
  private apiUrl = '/api/v1/orders'; // Proxy handles routing

  constructor(private http: HttpClient) { }

  getOrders(): Observable<Order[]> {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      throw new Error('User ID not found. Please log in again.');
    }
    const userId = parseInt(userIdStr, 10);
    return this.http.get<BackendOrder[]>(`${this.apiUrl}/users/${userId}`).pipe(
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
   * Parses stock-related errors to display user-friendly messages
   */
  extractErrorMessage(error: any): string {
    let errorMessage = '';

    if (error.error?.error) {
      errorMessage = error.error.error;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else {
      return 'An error occurred while processing the order';
    }

    // Check for stock-related errors and format them nicely
    if (errorMessage.toLowerCase().includes('inventory') ||
      errorMessage.toLowerCase().includes('stock') ||
      errorMessage.toLowerCase().includes('ingredient')) {

      // Check for "no stock" errors
      if (errorMessage.toLowerCase().includes('no ') ||
        errorMessage.toLowerCase().includes('has no')) {
        // Extract ingredient name if possible
        const match = errorMessage.match(/has no ([\w\s]+)|no ([\w\s]+)/i);
        if (match) {
          const ingredient = (match[1] || match[2]).trim();
          return `⚠️ URGENT: ${ingredient} is OUT OF STOCK and must be purchased immediately before this order can be fulfilled.`;
        }
        return `⚠️ URGENT: One or more ingredients are OUT OF STOCK and must be purchased immediately.`;
      }

      // Check for "not enough" errors
      if (errorMessage.toLowerCase().includes("doesn't have enough") ||
        errorMessage.toLowerCase().includes('not enough') ||
        errorMessage.toLowerCase().includes('insufficient')) {
        // Extract ingredient name and quantities if possible
        const match = errorMessage.match(/(?:doesn't have enough|not enough|insufficient)\s+([\w\s]+)\.?\s*(?:Required[:\s]+([\d.]+))?(?:,\s*Available[:\s]+(\d+))?/i);
        if (match) {
          const ingredient = match[1].trim();
          const required = match[2] || 'required amount';
          const available = match[3] || 'current stock';
          return `⚠️ ${ingredient} is running LOW. Required: ${required}, Available: ${available}. Please purchase immediately.`;
        }
        return `⚠️ One or more ingredients have INSUFFICIENT STOCK. Please check inventory and purchase missing items immediately.`;
      }

      // Check for "ingredient not found" errors
      if (errorMessage.toLowerCase().includes('ingredient not found')) {
        const match = errorMessage.match(/Ingredient not found[:\s]+([\w\s]+)/i);
        if (match) {
          const ingredient = match[1].trim();
          return `⚠️ ${ingredient} is not in inventory. Please add it to inventory first.`;
        }
        return `⚠️ One or more ingredients are not in inventory. Please add them to inventory first.`;
      }
    }

    return errorMessage;
  }
}
