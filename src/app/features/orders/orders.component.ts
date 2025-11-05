import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <h2>Orders</h2>
      <p>Welcome to FoodFlow Orders Management.</p>
    </mat-card>
  `
})

export class OrdersComponent{}
