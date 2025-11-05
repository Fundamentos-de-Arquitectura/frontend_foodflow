import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent {
  plans = [
    {
      name: 'Basic',
      features: ['Active now', '7 days free trial'],
      icon: 'star_border'
    },
    {
      name: 'Premium',
      price: '$49.99 / month',
      features: ['Unlimited items', 'Priority support'],
      icon: 'star_full'
    }
  ];

  selectPlan(plan: string) {
    console.log(`Selected plan: ${plan}`);
  }
}
