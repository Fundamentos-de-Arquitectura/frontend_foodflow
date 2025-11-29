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

  constructor(private dialog: MatDialog, private translate: TranslateService, private http: HttpClient) { }

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

    // Try to fetch subscription directly
    this.http.get<any>(`/api/v1/subscriptions/${userId}`).subscribe({
      next: (subscription) => {
        this.userSubscription = subscription;
        if (subscription && subscription.status === 'ACTIVE') {
          this.currentPlan = 'PREMIUM_PLAN';
        } else {
          this.currentPlan = 'BASIC_PLAN';
        }
        this.updatePlanStatus();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading subscription', err);
        this.currentPlan = 'BASIC_PLAN';
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
    const confirmMessage = this.translate.instant('CONFIRM_PREMIUM_UPGRADE');
    const confirmed = confirm(confirmMessage);
    if (confirmed) {
      const userIdStr = localStorage.getItem('userId');
      if (!userIdStr) {
        alert('Error: User ID not found');
        return;
      }

      const userId = parseInt(userIdStr, 10);

      // Prepare subscription request with payment data
      const subscriptionRequest = {
        planName: 'PREMIUM',
        paymentData: {
          cardNumber: '4111111111111111', // Mock data
          cardHolder: 'User Name',
          expirationDate: '12/25',
          cvv: '123',
          amount: 9.99
        }
      };

      this.isLoading = true;

      // Call subscription API
      this.http.post<any>(`/api/v1/subscriptions/subscribe/${userId}`, subscriptionRequest).subscribe({
        next: (subscription) => {
          console.log('Subscription created:', subscription);

          // Update subscriptionId in IAM account
          this.http.patch(`/api/v1/authentication/accounts/${userId}/subscription`, {
            subscriptionId: subscription.id
          }).subscribe({
            next: () => {
              console.log('SubscriptionId updated in IAM');
              this.currentPlan = 'PREMIUM_PLAN';
              this.updatePlanStatus();
              const successMessage = this.translate.instant('UPGRADE_SUCCESS');
              alert(successMessage);
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error updating subscriptionId in IAM:', err);
              alert('Suscripción creada pero hubo un error al actualizar tu cuenta. Por favor contacta soporte.');
              this.isLoading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error upgrading to premium:', err);
          alert('Error al actualizar a Premium. Por favor intenta de nuevo.');
          this.isLoading = false;
        }
      });
    }
  }

  cancelPremium(): void {
    const confirmMessage = this.translate.instant('CONFIRM_CANCEL');
    const confirmed = confirm(confirmMessage);
    if (confirmed) {
      const userIdStr = localStorage.getItem('userId');
      if (!userIdStr) {
        alert('Error: User ID not found');
        return;
      }

      const userId = parseInt(userIdStr, 10);
      this.isLoading = true;

      // Call cancel subscription API
      this.http.delete(`/api/v1/subscriptions/cancel/${userId}`, { responseType: 'text' }).subscribe({
        next: (response) => {
          console.log('Subscription cancelled:', response);

          // Update subscriptionId in IAM to null
          this.http.patch(`/api/v1/authentication/accounts/${userId}/subscription`, {
            subscriptionId: null
          }).subscribe({
            next: () => {
              console.log('SubscriptionId removed from IAM');
              this.currentPlan = 'BASIC_PLAN';
              this.updatePlanStatus();
              const successMessage = this.translate.instant('CANCEL_SUCCESS');
              alert(successMessage);
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error removing subscriptionId from IAM:', err);
              this.currentPlan = 'BASIC_PLAN';
              this.updatePlanStatus();
              this.isLoading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error cancelling subscription:', err);
          alert('Error al cancelar la suscripción. Por favor intenta de nuevo.');
          this.isLoading = false;
        }
      });
    }
  }

  private updatePlanStatus(): void {
    this.plans.forEach(plan => {
      plan.isCurrent = plan.nameKey === this.currentPlan;
      plan.allowUpgrade = plan.nameKey !== this.currentPlan;
    });
  }
}
