import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { OrdersService, Order } from '../../services/orders.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule],
  template: `
    <div class="orders-container">
      <h1>Orders Management</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Order History</mat-card-title>
          <mat-card-subtitle *ngIf="orders.length === 0">No orders found</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="orders" class="mat-elevation-z2" *ngIf="orders.length > 0">
            <ng-container matColumnDef="tableNumber">
              <th mat-header-cell *matHeaderCellDef>Table</th>
              <td mat-cell *matCellDef="let order">{{ order.tableNumber }}</td>
            </ng-container>

            <ng-container matColumnDef="dishes">
              <th mat-header-cell *matHeaderCellDef>Dishes</th>
              <td mat-cell *matCellDef="let order">{{ getFormattedDishes(order) }}</td>
            </ng-container>

            <ng-container matColumnDef="totalPrice">
              <th mat-header-cell *matHeaderCellDef>Total Price</th>
              <td mat-cell *matCellDef="let order">{{ order.totalPrice | currency }}</td>
            </ng-container>

            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let order">{{ order.date | date:'short' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    table {
      width: 100%;
    }

    .mat-mdc-card-content {
      overflow-x: auto;
    }
  `]
})
export class OrdersComponent implements OnInit {
  displayedColumns: string[] = ['tableNumber', 'dishes', 'totalPrice', 'date'];
  orders: Order[] = [];

  constructor(
    private ordersService: OrdersService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.ordersService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        if (data.length === 0) {
          this.notificationService.info('No orders found');
        }
      },
      error: (err) => {
        console.error('Error loading orders', err);
        const errorMsg = this.ordersService.extractErrorMessage(err);
        this.notificationService.error(errorMsg);
      }
    });
  }

  getFormattedDishes(order: Order): string {
    return this.ordersService.getFormattedDishes(order);
  }

  // Example of calculating total for a dish (used in services, demo purpose)
  calculateTotalExample(): void {
    const quantity = 3;
    const unitPrice = 10.50;
    const total = this.ordersService.calculateItemTotal(quantity, unitPrice);
    console.log(`Total for ${quantity} x $${unitPrice} = $${total}`);
  }
}
