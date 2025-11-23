import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReportsService, DashboardData } from '../../services/reports.service';
import { StockAlertService, StockAlert } from '../../services/stock-alert.service';
import { NotificationService } from '../../services/notification.service';

interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  incomeChange: number;
  expensesChange: number;
}

interface TopDish {
  name: string;
  sales: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule, MatSnackBarModule, TranslateModule],
  template: `
    <div class="dashboard-container">
      <h1>{{ 'DASHBOARD' | translate }}</h1>

      <div *ngIf="isLoading" class="loading-message">
        <p>{{ 'LOADING_DASHBOARD' | translate }}</p>
      </div>

      <div *ngIf="!isLoading">
        <!-- Stock Alerts -->
        <div *ngIf="stockAlerts.length > 0" class="stock-alerts">
          <mat-card *ngFor="let alert of stockAlerts" 
                   [class]="'alert-card ' + alert.severity + '-alert'">
            <mat-card-content>
              <div class="alert-content">
                <mat-icon class="alert-icon">{{ getAlertIcon(alert.severity) }}</mat-icon>
                <div class="alert-message">
                  <strong>{{ alert.ingredientName }}</strong>: {{ 'INSUFFICIENT_STOCK' | translate }}
                  {{ 'REQUIRED' | translate }}: {{ alert.requiredQuantity }}, {{ 'AVAILABLE' | translate }}: {{ alert.availableQuantity }}, 
                  {{ 'SHORTAGE' | translate }}: {{ alert.shortage }}
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Financial Summary -->
        <div class="summary-cards">
        <mat-card class="summary-card income-card">
          <mat-card-header>
            <mat-card-title>{{ 'TOTAL_INCOME' | translate }}</mat-card-title>
            <mat-card-subtitle>
              <mat-icon>{{ summaryData.incomeChange >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              {{ summaryData.incomeChange >= 0 ? '+' : '' }}{{ summaryData.incomeChange }}% {{ 'VS_YESTERDAY' | translate }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ summaryData.totalIncome | currency }}</h2>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card expense-card">
          <mat-card-header>
            <mat-card-title>{{ 'TOTAL_EXPENSES' | translate }}</mat-card-title>
            <mat-card-subtitle>
              <mat-icon>{{ summaryData.expensesChange >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              {{ summaryData.expensesChange >= 0 ? '+' : '' }}{{ summaryData.expensesChange }}% {{ 'VS_YESTERDAY' | translate }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ summaryData.totalExpenses | currency }}</h2>
          </mat-card-content>
        </mat-card>
      </div>

        <!-- Top Dishes -->
        <mat-card class="top-dishes-card">
          <mat-card-header>
            <mat-card-title>{{ 'TOP_5_DISHES' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="topDishes.length === 0" class="no-data-message">
              <p>{{ 'NO_DISHES_SOLD' | translate }}</p>
            </div>
            <table *ngIf="topDishes.length > 0" mat-table [dataSource]="topDishes" class="top-dishes-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>{{ 'DISH_NAME' | translate }}</th>
              <td mat-cell *matCellDef="let dish">{{ dish.name }}</td>
            </ng-container>

            <ng-container matColumnDef="sales">
              <th mat-header-cell *matHeaderCellDef>{{ 'SALES' | translate }}</th>
              <td mat-cell *matCellDef="let dish">{{ dish.sales }}</td>
            </ng-container>

            <ng-container matColumnDef="chart">
              <th mat-header-cell *matHeaderCellDef>{{ 'CHART' | translate }}</th>
              <td mat-cell *matCellDef="let dish">
                <div class="chart-bar" [style.width.%]="(dish.sales / maxSales) * 100"></div>
              </td>
            </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .summary-cards {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
    }

    .summary-card {
      flex: 1;
    }

    .income-card .mat-card-subtitle mat-icon {
      color: #4caf50;
    }

    .expense-card .mat-card-subtitle mat-icon {
      color: #f44336;
    }

    .summary-card h2 {
      font-size: 2em;
      font-weight: bold;
      margin: 8px 0;
    }

    .top-dishes-card {
      margin-bottom: 24px;
    }

    .top-dishes-table {
      width: 100%;
    }

    .chart-bar {
      height: 20px;
      background-color: #4caf50;
      border-radius: 10px;
      min-width: 20px;
    }

    .mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .loading-message, .no-data-message {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .stock-alerts {
      margin-bottom: 24px;
    }

    .alert-card {
      margin-bottom: 12px;
    }

    .critical-alert {
      border-left: 4px solid #f44336;
      background-color: #ffebee;
    }

    .warning-alert {
      border-left: 4px solid #ff9800;
      background-color: #fff3e0;
    }

    .low-alert {
      border-left: 4px solid #ffc107;
      background-color: #fffde7;
    }

    .alert-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .alert-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .critical-alert .alert-icon {
      color: #f44336;
    }

    .warning-alert .alert-icon {
      color: #ff9800;
    }

    .low-alert .alert-icon {
      color: #ffc107;
    }

    .alert-message {
      flex: 1;
    }
  `]
})
export class DashboardComponent implements OnInit {
  summaryData: SummaryData = {
    totalIncome: 0,
    totalExpenses: 0,
    incomeChange: 0,
    expensesChange: 0
  };

  topDishes: TopDish[] = [];
  maxSales: number = 0;
  displayedColumns: string[] = ['name', 'sales', 'chart'];
  isLoading = true;
  stockAlerts: StockAlert[] = [];

  constructor(
    private reportsService: ReportsService,
    private stockAlertService: StockAlertService,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadStockAlerts();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    this.reportsService.getDashboardData().subscribe({
      next: (data: DashboardData) => {
        this.summaryData = {
          totalIncome: data.totalIncome,
          totalExpenses: data.totalExpenses,
          incomeChange: data.incomeChange,
          expensesChange: data.expensesChange
        };

        this.topDishes = data.topDishes;
        this.maxSales = this.topDishes.length > 0 
          ? Math.max(...this.topDishes.map(d => d.sales)) 
          : 0;
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.isLoading = false;
      }
    });
  }

  loadStockAlerts(): void {
    this.stockAlertService.checkStockAlerts().subscribe({
      next: (alerts) => {
        this.stockAlerts = alerts;
        if (alerts.length > 0) {
          // Show notification for critical alerts
          const criticalAlerts = alerts.filter(a => a.severity === 'critical');
          if (criticalAlerts.length > 0) {
            const message = this.translate.instant('URGENT_STOCK_ALERT', { count: criticalAlerts.length });
            this.notificationService.warning(message, 8000);
          } else {
            const warningAlerts = alerts.filter(a => a.severity === 'warning');
            if (warningAlerts.length > 0) {
              const message = this.translate.instant('LOW_STOCK_ALERT', { count: warningAlerts.length });
              this.notificationService.warning(message, 6000);
            }
          }
        }
      },
      error: (err) => {
        console.error('Error loading stock alerts', err);
      }
    });
  }

  getAlertIcon(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  }
}
