import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit {
  currentPlan = 'Basic';
  plans = [
    {
      name: 'Basic',
      price: 'Free',
      features: [
        'Inventory management (up to 50 items)',
        'Basic reporting',
        'Menu management (up to 20 dishes)',
        'Order tracking',
        'Community support'
      ],
      icon: 'star_border',
      isCurrent: true
    },
    {
      name: 'Premium',
      price: '$49.99 / month',
      features: [
        'Unlimited inventory items',
        'Advanced reporting and analytics',
        'Unlimited menu management',
        'Priority support',
        'Custom integrations',
        'Data export'
      ],
      icon: 'star',
      allowUpgrade: true
    }
  ];

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    this.updatePlanStatus();
  }

  selectPlan(planName: string): void {
    if (planName === this.currentPlan) {
      return; // Already on this plan
    }

    if (planName === 'Premium') {
      this.upgradeToPremium();
    }
  }

  private upgradeToPremium(): void {
    // Simulate subscription process
    const confirmed = confirm('Subscribe to Premium plan for $49.99/month?');
    if (confirmed) {
      // Simulate payment and activation
      this.currentPlan = 'Premium';
      this.updatePlanStatus();
      alert('Successfully upgraded to Premium plan!');
    }
  }

  cancelPremium(): void {
    const confirmed = confirm('Cancel your Premium subscription? You will lose access at the end of your billing period.');
    if (confirmed) {
      this.currentPlan = 'Basic';
      this.updatePlanStatus();
      alert('Premium subscription will be canceled at the end of the billing period.');
    }
  }

  private updatePlanStatus(): void {
    this.plans.forEach(plan => {
      plan.isCurrent = plan.name === this.currentPlan;
      plan.allowUpgrade = plan.name !== this.currentPlan;
    });
  }
}
