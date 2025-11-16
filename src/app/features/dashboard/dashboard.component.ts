import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ReportsService, DashboardData } from '../../services/reports.service';

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

      <div *ngIf="isLoading" class="loading-message">
        <p>Loading dashboard...</p>
      </div>

      <div *ngIf="!isLoading">
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
            <div *ngIf="topDishes.length === 0" class="no-data-message">
              <p>No dishes sold yet. Create orders to see top dishes!</p>
            </div>
            <table *ngIf="topDishes.length > 0" mat-table [dataSource]="topDishes" class="top-dishes-table">
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

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.loadDashboardData();
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
}
