import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, TranslateModule],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit {
  currentPlan = 'BASIC_PLAN';
  plans = [
    {
      nameKey: 'BASIC_PLAN',
      priceKey: 'FREE',
      features: [
        'BASIC_FEATURE_1',
        'BASIC_FEATURE_2',
        'BASIC_FEATURE_3',
        'BASIC_FEATURE_4',
        'BASIC_FEATURE_5'
      ],
      icon: 'star_border',
      isCurrent: true
    },
    {
      nameKey: 'PREMIUM_PLAN',
      priceKey: 'PREMIUM_PRICE',
      features: [
        'PREMIUM_FEATURE_1',
        'PREMIUM_FEATURE_2',
        'PREMIUM_FEATURE_3',
        'PREMIUM_FEATURE_4',
        'PREMIUM_FEATURE_5',
        'PREMIUM_FEATURE_6'
      ],
      icon: 'star',
      allowUpgrade: true
    }
  ];

  constructor(private dialog: MatDialog, private translate: TranslateService) {}

  ngOnInit(): void {
    this.updatePlanStatus();
  }

  selectPlan(planNameKey: string): void {
    if (planNameKey === this.currentPlan) {
      return; // Already on this plan
    }

    if (planNameKey === 'PREMIUM_PLAN') {
      this.upgradeToPremium();
    }
  }

  private upgradeToPremium(): void {
    // Simulate subscription process
    const confirmMessage = this.translate.instant('CONFIRM_PREMIUM_UPGRADE');
    const confirmed = confirm(confirmMessage);
    if (confirmed) {
      // Simulate payment and activation
      this.currentPlan = 'PREMIUM_PLAN';
      this.updatePlanStatus();
      const successMessage = this.translate.instant('UPGRADE_SUCCESS');
      alert(successMessage);
    }
  }

  cancelPremium(): void {
    const confirmMessage = this.translate.instant('CONFIRM_CANCEL');
    const confirmed = confirm(confirmMessage);
    if (confirmed) {
      this.currentPlan = 'BASIC_PLAN';
      this.updatePlanStatus();
      const successMessage = this.translate.instant('CANCEL_SUCCESS');
      alert(successMessage);
    }
  }

  private updatePlanStatus(): void {
    this.plans.forEach(plan => {
      plan.isCurrent = plan.nameKey === this.currentPlan;
      plan.allowUpgrade = plan.nameKey !== this.currentPlan;
    });
  }
}
