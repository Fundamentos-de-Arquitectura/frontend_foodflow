import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <h2>Subscriptions</h2>
      <p>Welcome to FoodFlow Subscriptions.</p>
    </mat-card>
  `
})

export class SubscriptionsComponent{}
