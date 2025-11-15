import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

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
  imports: [CommonModule, MatCardModule, MatTableModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <!-- Financial Summary -->
      <div class="summary-cards">
        <mat-card class="summary-card income-card">
          <mat-card-header>
            <mat-card-title>Total Income</mat-card-title>
            <mat-card-subtitle>
              <mat-icon>{{ summaryData.incomeChange >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              {{ summaryData.incomeChange >= 0 ? '+' : '' }}{{ summaryData.incomeChange }}% vs yesterday
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <h2>{{ summaryData.totalIncome | currency }}</h2>
          </mat-card-content>
        </mat-card>

        <mat-card class="summary-card expense-card">
          <mat-card-header>
            <mat-card-title>Total Expenses</mat-card-title>
            <mat-card-subtitle>
              <mat-icon>{{ summaryData.expensesChange >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              {{ summaryData.expensesChange >= 0 ? '+' : '' }}{{ summaryData.expensesChange }}% vs yesterday
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
          <mat-card-title>Top 5 Dishes</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="topDishes" class="top-dishes-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Dish Name</th>
              <td mat-cell *matCellDef="let dish">{{ dish.name }}</td>
            </ng-container>

            <ng-container matColumnDef="sales">
              <th mat-header-cell *matHeaderCellDef>Sales</th>
              <td mat-cell *matCellDef="let dish">{{ dish.sales }}</td>
            </ng-container>

            <ng-container matColumnDef="chart">
              <th mat-header-cell *matHeaderCellDef>Chart</th>
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

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Mock data for demonstration
    this.summaryData = {
      totalIncome: 1250.50,
      totalExpenses: 780.25,
      incomeChange: 12.5,
      expensesChange: -8.3
    };

    this.topDishes = [
      { name: 'Margherita Pizza', sales: 45 },
      { name: 'Chicken Burger', sales: 38 },
      { name: 'Caesar Salad', sales: 32 },
      { name: 'Spaghetti Carbonara', sales: 28 },
      { name: 'Fish & Chips', sales: 24 }
    ];

    this.maxSales = Math.max(...this.topDishes.map(d => d.sales));
  }
}
