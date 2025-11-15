import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

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
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private orders$ = this.ordersSubject.asObservable();

  constructor() {
    // Load initial mock data
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const mockOrders: Order[] = [
      {
        id: 1,
        tableNumber: 3,
        items: [
          { dishId: 1, dishName: 'Margherita Pizza', quantity: 2, unitPrice: 12.99, total: 25.98 },
          { dishId: 2, dishName: 'Chicken Burger', quantity: 1, unitPrice: 10.50, total: 10.50 }
        ],
        totalPrice: 36.48,
        date: new Date('2025-11-14T12:00:00')
      },
      {
        id: 2,
        tableNumber: 5,
        items: [
          { dishId: 3, dishName: 'Caesar Salad', quantity: 3, unitPrice: 8.99, total: 26.97 }
        ],
        totalPrice: 26.97,
        date: new Date('2025-11-14T13:30:00')
      },
      {
        id: 3,
        tableNumber: 2,
        items: [
          { dishId: 1, dishName: 'Margherita Pizza', quantity: 1, unitPrice: 12.99, total: 12.99 },
          { dishId: 2, dishName: 'Chicken Burger', quantity: 2, unitPrice: 10.50, total: 21.00 },
          { dishId: 3, dishName: 'Caesar Salad', quantity: 1, unitPrice: 8.99, total: 8.99 }
        ],
        totalPrice: 42.98,
        date: new Date('2025-11-15T14:00:00')
      }
    ];
    this.ordersSubject.next(mockOrders.sort((a, b) => b.date.getTime() - a.date.getTime()));
  }

  getOrders(): Observable<Order[]> {
    return this.orders$;
  }

  calculateItemTotal(quantity: number, unitPrice: number): number {
    return quantity * unitPrice;
  }

  addOrder(order: Omit<Order, 'id' | 'date'>): Observable<Order> {
    const currentOrders = this.ordersSubject.value;
    const newOrder: Order = {
      ...order,
      id: Math.max(...currentOrders.map(o => o.id || 0), 0) + 1,
      date: new Date()
    };
    this.ordersSubject.next([newOrder, ...currentOrders]);
    return new Observable(observer => {
      observer.next(newOrder);
      observer.complete();
    });
  }

  getFormattedDishes(order: Order): string {
    return order.items.map(item => `${item.dishName} (x${item.quantity})`).join(', ');
  }
}
