import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDialogModule, TranslateModule],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent implements OnInit {
  currentPlan = 'BASIC_PLAN';
  userSubscription: any = null;
  isLoading = true;
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

  constructor(private dialog: MatDialog, private translate: TranslateService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserSubscription();
  }

  loadUserSubscription(): void {
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      console.error('User ID not found');
      this.isLoading = false;
      return;
    }
    
    const userId = parseInt(userIdStr, 10);
    
    // Fetch user with subscription data from profiles service
    this.http.get<any>(`http://localhost:8060/api/v1/profiles/users/${userId}/with-subscription`).subscribe({
      next: (data) => {
        this.userSubscription = data;
        // Set current plan based on subscription data
        if (data.planName) {
          this.currentPlan = data.planName === 'PREMIUM' ? 'PREMIUM_PLAN' : 'BASIC_PLAN';
        }
        this.updatePlanStatus();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading subscription', err);
        this.isLoading = false;
        this.updatePlanStatus();
      }
    });
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
    // TODO: Implement actual subscription upgrade API call
    const confirmMessage = this.translate.instant('CONFIRM_PREMIUM_UPGRADE');
    const confirmed = confirm(confirmMessage);
    if (confirmed) {
      // For now, just update the UI (later this should call the subscription API)
      this.currentPlan = 'PREMIUM_PLAN';
      this.updatePlanStatus();
      const successMessage = this.translate.instant('UPGRADE_SUCCESS');
      alert(successMessage);
      this.loadUserSubscription(); // Reload subscription data
    }
  }

  cancelPremium(): void {
    // TODO: Implement actual subscription cancellation API call
    const confirmMessage = this.translate.instant('CONFIRM_CANCEL');
    const confirmed = confirm(confirmMessage);
    if (confirmed) {
      this.currentPlan = 'BASIC_PLAN';
      this.updatePlanStatus();
      const successMessage = this.translate.instant('CANCEL_SUCCESS');
      alert(successMessage);
      this.loadUserSubscription(); // Reload subscription data
    }
  }

  private updatePlanStatus(): void {
    this.plans.forEach(plan => {
      plan.isCurrent = plan.nameKey === this.currentPlan;
      plan.allowUpgrade = plan.nameKey !== this.currentPlan;
    });
  }
}
