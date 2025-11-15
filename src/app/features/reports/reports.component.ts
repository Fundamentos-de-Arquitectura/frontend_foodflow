import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

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
  imports: [CommonModule, MatCardModule, MatTabsModule, MatIconModule],
  template: `
    <div class="reports-container">
      <h1>Financial Reports</h1>

      <mat-tab-group [selectedIndex]="selectedTab" (selectedTabChange)="onTabChange($event)">
        <mat-tab label="Daily">
          <ng-container *ngTemplateOutlet="reportContent; context: {data: dailyData}"></ng-container>
        </mat-tab>
        <mat-tab label="Weekly">
          <ng-container *ngTemplateOutlet="reportContent; context: {data: weeklyData}"></ng-container>
        </mat-tab>
        <mat-tab label="Monthly">
          <ng-container *ngTemplateOutlet="reportContent; context: {data: monthlyData}"></ng-container>
        </mat-tab>
      </mat-tab-group>

      <ng-template #reportContent let-data="data">
        <div class="report-content" *ngIf="data">
          <!-- Income and Expenses Summary -->
          <div class="summary-cards">
            <mat-card class="summary-card income-card">
              <mat-card-header>
                <mat-card-title>Total Income</mat-card-title>
                <mat-card-subtitle>
                  <mat-icon>{{ data.incomeChange >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ data.incomeChange >= 0 ? '+' : '' }}{{ data.incomeChange }}% vs previous {{ data.periodType.toLowerCase() }}
                </mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <h2>{{ data.income | currency }}</h2>
              </mat-card-content>
            </mat-card>

            <mat-card class="summary-card expense-card">
              <mat-card-header>
                <mat-card-title>Total Expenses</mat-card-title>
                <mat-card-subtitle>
                  <mat-icon>{{ data.expensesChange >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ data.expensesChange >= 0 ? '+' : '' }}{{ data.expensesChange }}% vs previous {{ data.periodType.toLowerCase() }}
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
              <mat-card-title>Expenses by Category</mat-card-title>
              <mat-card-subtitle>Breakdown of spending areas</mat-card-subtitle>
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
  `]
})
export class ReportsComponent implements OnInit {
  selectedTab = 0;

  dailyData: PeriodData = {
    periodType: 'Day',
    income: 320.50,
    expenses: 185.25,
    incomeChange: 8.5,
    expensesChange: -2.3,
    expensesByCategory: [
      { category: 'Ingredients', amount: 120.00 },
      { category: 'Staff', amount: 35.25 },
      { category: 'Utilities', amount: 20.00 },
      { category: 'Equipment', amount: 10.00 }
    ]
  };

  weeklyData: PeriodData = {
    periodType: 'Week',
    income: 2250.75,
    expenses: 1285.50,
    incomeChange: 12.1,
    expensesChange: 5.8,
    expensesByCategory: [
      { category: 'Ingredients', amount: 850.00 },
      { category: 'Staff', amount: 245.50 },
      { category: 'Utilities', amount: 140.00 },
      { category: 'Equipment', amount: 50.00 }
    ]
  };

  monthlyData: PeriodData = {
    periodType: 'Month',
    income: 9750.25,
    expenses: 5425.75,
    incomeChange: -3.2,
    expensesChange: 7.4,
    expensesByCategory: [
      { category: 'Ingredients', amount: 3650.00 },
      { category: 'Staff', amount: 1075.75 },
      { category: 'Utilities', amount: 600.00 },
      { category: 'Equipment', amount: 100.00 }
    ]
  };

  ngOnInit(): void {
    // Data is already initialized
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
}
