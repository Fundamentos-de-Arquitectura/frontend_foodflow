import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ReportData {
  periodType: string;
  income: number;
  expenses: number;
  incomeChange: number;
  expensesChange: number;
  expensesByCategory: { category: string; amount: number }[];
}

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  incomeChange: number;
  expensesChange: number;
  topDishes: { name: string; sales: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private ordersUrl = 'http://localhost:8060/api/v1/orders';
  private productsUrl = 'http://localhost:8060/api/v1/products';

  constructor(private http: HttpClient) {}

  /**
   * Get dashboard data (today's summary + top dishes)
   */
  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      orders: this.getOrders().pipe(catchError(() => of([]))),
      products: this.getProducts().pipe(catchError(() => of([])))
    }).pipe(
      map(({ orders, products }) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter today's orders
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today;
        });

        // Calculate today's income
        const totalIncome = todayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        // Calculate today's expenses (products purchased today)
        const totalExpenses = products.reduce((sum, product) => {
          const cost = (product.price?.price || 0) * (product.quantity?.quantity || 0);
          return sum + cost;
        }, 0);

        // Get yesterday's data for comparison
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayEnd = new Date(today);
        
        const yesterdayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= yesterday && orderDate < yesterdayEnd;
        });
        
        const yesterdayIncome = yesterdayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const incomeChange = yesterdayIncome > 0 
          ? ((totalIncome - yesterdayIncome) / yesterdayIncome) * 100 
          : 0;

        // Calculate top dishes from all orders
        const dishSales = new Map<string, number>();
        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const dishName = item.dishName || 'Unknown';
              dishSales.set(dishName, (dishSales.get(dishName) || 0) + (item.quantity || 0));
            });
          }
        });

        const topDishes = Array.from(dishSales.entries())
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 5);

        return {
          totalIncome,
          totalExpenses,
          incomeChange: Math.round(incomeChange * 10) / 10,
          expensesChange: 0, // TODO: Calculate based on previous period
          topDishes
        };
      })
    );
  }

  /**
   * Get report data for a specific period
   * @param period 'day', 'week', or 'month'
   */
  getReportData(period: 'day' | 'week' | 'month'): Observable<ReportData> {
    const userId = this.getUserId();

    return forkJoin({
      orders: this.getOrders().pipe(catchError(() => of([]))),
      products: this.getProducts().pipe(catchError(() => of([])))
    }).pipe(
      map(({ orders, products }) => {
        const now = new Date();
        const startDate = this.getStartDate(period, now);

        // Filter orders by date and calculate income
        const filteredOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startDate && orderDate <= now;
        });

        const income = filteredOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        // Calculate expenses from products (assuming products have a purchase cost)
        // For now, we'll use the product price as cost
        const expenses = products.reduce((sum, product) => {
          const cost = (product.price?.price || 0) * (product.quantity?.quantity || 0);
          return sum + cost;
        }, 0);

        // Calculate changes (simplified - comparing with previous period)
        const previousPeriod = this.getPreviousPeriod(period, now);
        const previousOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= previousPeriod.start && orderDate <= previousPeriod.end;
        });
        const previousIncome = previousOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        
        const incomeChange = previousIncome > 0 
          ? ((income - previousIncome) / previousIncome) * 100 
          : 0;

        // Group expenses by category (simplified)
        const expensesByCategory = this.groupExpensesByCategory(products);

        return {
          periodType: this.getPeriodLabel(period),
          income,
          expenses,
          incomeChange: Math.round(incomeChange * 10) / 10,
          expensesChange: 0, // TODO: Calculate based on previous period
          expensesByCategory
        };
      })
    );
  }

  private getUserId(): number {
    const userIdStr = localStorage.getItem('userId');
    return userIdStr ? parseInt(userIdStr, 10) : 0;
  }

  private getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.ordersUrl);
  }

  private getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.productsUrl);
  }

  private getStartDate(period: 'day' | 'week' | 'month', now: Date): Date {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);

    switch (period) {
      case 'day':
        return date;
      case 'week':
        date.setDate(date.getDate() - 7);
        return date;
      case 'month':
        date.setDate(date.getDate() - 30);
        return date;
      default:
        return date;
    }
  }

  private getPreviousPeriod(period: 'day' | 'week' | 'month', now: Date): { start: Date; end: Date } {
    const end = this.getStartDate(period, now);
    const start = new Date(end);

    switch (period) {
      case 'day':
        start.setDate(start.getDate() - 1);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setDate(start.getDate() - 30);
        break;
    }

    return { start, end };
  }

  private getPeriodLabel(period: 'day' | 'week' | 'month'): string {
    switch (period) {
      case 'day':
        return 'Day';
      case 'week':
        return 'Week';
      case 'month':
        return 'Month';
      default:
        return 'Day';
    }
  }

  private groupExpensesByCategory(products: any[]): { category: string; amount: number }[] {
    // Group products into categories based on their names (simplified)
    const categories: { [key: string]: number } = {
      'Ingredients': 0,
      'Equipment': 0,
      'Supplies': 0,
      'Other': 0
    };

    products.forEach(product => {
      const cost = (product.price?.price || 0) * (product.quantity?.quantity || 0);
      const name = (product.name || '').toLowerCase();

      // Simple categorization based on product name
      if (name.includes('ingredient') || name.includes('food') || name.includes('meat') || 
          name.includes('vegetable') || name.includes('fruit') || name.includes('spice')) {
        categories['Ingredients'] += cost;
      } else if (name.includes('equipment') || name.includes('tool') || name.includes('machine')) {
        categories['Equipment'] += cost;
      } else if (name.includes('supply') || name.includes('package') || name.includes('container')) {
        categories['Supplies'] += cost;
      } else {
        categories['Other'] += cost;
      }
    });

    // Convert to array and filter out zero amounts
    return Object.entries(categories)
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]) => ({ category, amount }));
  }
}

