import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReportsService, ReportData } from '../../services/reports.service';

interface PeriodData {
  periodType: string;
  income: number;
  expenses: number;
  incomeChange: number;
  expensesChange: number;
  expensesByCategory: { category: string; amount: number }[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTabsModule, MatIconModule, TranslateModule],
  template: `
    <div class="reports-container">
      <h1>{{ 'FINANCIAL_REPORTS' | translate }}</h1>

      <div *ngIf="isLoading" class="loading-message">
        <p>{{ 'LOADING_REPORTS' | translate }}</p>
      </div>

      <mat-tab-group *ngIf="!isLoading" [selectedIndex]="selectedTab" (selectedTabChange)="onTabChange($event)">
        <mat-tab [label]="'DAILY' | translate">
          <ng-container *ngTemplateOutlet="reportContent; context: {data: dailyData}"></ng-container>
        </mat-tab>
        <mat-tab [label]="'WEEKLY' | translate">
          <ng-container *ngTemplateOutlet="reportContent; context: {data: weeklyData}"></ng-container>
        </mat-tab>
        <mat-tab [label]="'MONTHLY' | translate">
          <ng-container *ngTemplateOutlet="reportContent; context: {data: monthlyData}"></ng-container>
        </mat-tab>
      </mat-tab-group>

      <ng-template #reportContent let-data="data">
        <div class="report-content" *ngIf="data">
          <div *ngIf="data.income === 0 && data.expenses === 0" class="no-data-message">
            <p>{{ 'NO_DATA_AVAILABLE' | translate }}</p>
          </div>
          <!-- Income and Expenses Summary -->
          <div class="summary-cards">
            <mat-card class="summary-card income-card">
              <mat-card-header>
                <mat-card-title>{{ 'TOTAL_INCOME' | translate }}</mat-card-title>
                <mat-card-subtitle>
                  <mat-icon>{{ data.incomeChange >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ data.incomeChange >= 0 ? '+' : '' }}{{ data.incomeChange }}% {{ getPeriodTranslation(data.periodType) }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <h2>{{ data.income | currency }}</h2>
              </mat-card-content>
            </mat-card>

            <mat-card class="summary-card expense-card">
              <mat-card-header>
                <mat-card-title>{{ 'TOTAL_EXPENSES' | translate }}</mat-card-title>
                <mat-card-subtitle>
                  <mat-icon>{{ data.expensesChange >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ data.expensesChange >= 0 ? '+' : '' }}{{ data.expensesChange }}% {{ getPeriodTranslation(data.periodType) }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <h2>{{ data.expenses | currency }}</h2>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Expenses Breakdown -->
          <mat-card class="breakdown-card">
            <mat-card-header>
              <mat-card-title>{{ 'EXPENSES_BY_CATEGORY' | translate }}</mat-card-title>
              <mat-card-subtitle>{{ 'BREAKDOWN_SPENDING' | translate }}</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div class="category-list">
                <div *ngFor="let category of data.expensesByCategory; trackBy: trackByCategory"
                     class="category-item">
                  <div class="category-info">
                    <span class="category-name">{{ category.category }}</span>
                    <span class="category-amount">{{ category.amount | currency }}</span>
                  </div>
                  <div class="category-chart">
                    <div class="chart-bar"
                         [style.width.%]="getBarWidth(category.amount, data.expenses)"></div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .reports-container {
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

    .income-card .mat-card-subtitle {
      color: #4caf50;
    }

    .expense-card .mat-card-subtitle {
      color: #f44336;
    }

    .summary-card h2 {
      font-size: 2em;
      font-weight: bold;
      margin: 8px 0;
    }

    .mat-card-subtitle {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .breakdown-card {
      margin-top: 24px;
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .category-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex: 1;
      min-width: 200px;
    }

    .category-name {
      font-weight: 500;
    }

    .category-chart {
      width: 200px;
      height: 20px;
      background-color: #f5f5f5;
      border-radius: 10px;
      overflow: hidden;
    }

    .chart-bar {
      height: 100%;
      background-color: #ff9800;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .mat-tab-body-content {
      padding: 24px 0;
    }

    .loading-message, .no-data-message {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class ReportsComponent implements OnInit {
  selectedTab = 0;
  isLoading = true;

  dailyData: PeriodData | null = null;
  weeklyData: PeriodData | null = null;
  monthlyData: PeriodData | null = null;

  constructor(
    private reportsService: ReportsService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadAllReports();
  }

  loadAllReports(): void {
    this.isLoading = true;

    // Load daily data
    this.reportsService.getReportData('day').subscribe({
      next: (data) => {
        this.dailyData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading daily report', err);
        this.isLoading = false;
      }
    });

    // Load weekly data
    this.reportsService.getReportData('week').subscribe({
      next: (data) => {
        this.weeklyData = data;
      },
      error: (err) => console.error('Error loading weekly report', err)
    });

    // Load monthly data
    this.reportsService.getReportData('month').subscribe({
      next: (data) => {
        this.monthlyData = data;
      },
      error: (err) => console.error('Error loading monthly report', err)
    });
  }

  onTabChange(event: any): void {
    this.selectedTab = event.index;
  }

  getBarWidth(amount: number, total: number): number {
    return total > 0 ? (amount / total) * 100 : 0;
  }

  trackByCategory(index: number, item: { category: string; amount: number }): string {
    return item.category;
  }

  getPeriodTranslation(periodType: string): string {
    const periodMap: { [key: string]: string } = {
      'day': this.translate.instant('DAILY').toLowerCase(),
      'week': this.translate.instant('WEEKLY').toLowerCase(),
      'month': this.translate.instant('MONTHLY').toLowerCase()
    };
    const period = periodMap[periodType.toLowerCase()] || periodType.toLowerCase();
    return this.translate.instant('VS_PREVIOUS', { period });
  }
}
