import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OrdersService } from './orders.service';
import { ProductService } from './product.service';
import { MenuService, BackendDish } from './menu.service';

export interface StockAlert {
  ingredientName: string;
  requiredQuantity: number;
  availableQuantity: number;
  shortage: number;
  severity: 'critical' | 'warning' | 'low';
}

@Injectable({
  providedIn: 'root'
})
export class StockAlertService {
  constructor(
    private http: HttpClient,
    private ordersService: OrdersService,
    private productService: ProductService,
    private menuService: MenuService
  ) { }

  /**
   * Check stock availability against all existing orders
   * Returns alerts for ingredients that don't have enough stock
   */
  checkStockAlerts(): Observable<StockAlert[]> {
    const userId = this.getUserId();
    if (!userId) {
      return of([]);
    }

    // Fetch backend dishes directly to get ingredients array
    const dishesUrl = '/api/v1/menu';
    const backendDishes$ = this.http.get<BackendDish[]>(`${dishesUrl}/users/${userId}/dishes`).pipe(
      catchError(() => of([]))
    );

    return forkJoin({
      orders: this.ordersService.getOrders().pipe(catchError(() => of([]))),
      products: this.productService.getProducts().pipe(catchError(() => of([]))),
      dishes: backendDishes$
    }).pipe(
      map(({ orders, products, dishes }) => {
        // Create a map of ingredient names to available quantities
        const inventoryMap = new Map<string, number>();
        products.forEach(product => {
          const quantity = product.quantity || 0;
          inventoryMap.set(product.name.toLowerCase(), quantity);
        });

        // Calculate required ingredients from all orders
        const requiredIngredients = new Map<string, number>();

        orders.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              // Find the dish to get its ingredients
              const dish = dishes.find((d: BackendDish) => d.name === item.dishName || d.id === item.dishId);
              if (dish && dish.ingredients && Array.isArray(dish.ingredients)) {
                // Use the ingredients array directly
                dish.ingredients.forEach(ing => {
                  const totalNeeded = ing.quantity * item.quantity;
                  const ingredientName = ing.name.toLowerCase();
                  const current = requiredIngredients.get(ingredientName) || 0;
                  requiredIngredients.set(ingredientName, current + totalNeeded);
                });
              }
            });
          }
        });

        // Compare required vs available and generate alerts
        const alerts: StockAlert[] = [];

        requiredIngredients.forEach((required, ingredientName) => {
          const available = inventoryMap.get(ingredientName) || 0;

          if (available < required) {
            const shortage = required - available;
            let severity: 'critical' | 'warning' | 'low';

            if (available === 0) {
              severity = 'critical';
            } else if (available < required * 0.5) {
              severity = 'warning';
            } else {
              severity = 'low';
            }

            // Find the original ingredient name (case-sensitive) from inventory or dishes
            let originalName = products.find(p =>
              p.name.toLowerCase() === ingredientName
            )?.name;

            if (!originalName) {
              // Try to find in dishes ingredients
              const dishIngredient = dishes
                .flatMap(d => d.ingredients || [])
                .find(ing => ing.name.toLowerCase() === ingredientName);
              originalName = dishIngredient?.name || ingredientName.charAt(0).toUpperCase() + ingredientName.slice(1);
            }

            alerts.push({
              ingredientName: originalName,
              requiredQuantity: Math.ceil(required),
              availableQuantity: available,
              shortage: Math.ceil(shortage),
              severity: severity
            });
          }
        });

        return alerts.sort((a, b) => {
          // Sort by severity: critical > warning > low
          const severityOrder = { 'critical': 0, 'warning': 1, 'low': 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        });
      })
    );
  }

  /**
   * Parse ingredients string to extract name, quantity, and unit
   * Format: "IngredientName quantity unit" or "IngredientName (quantity unit)"
   */
  private parseIngredients(ingredientsStr: string): Array<{ name: string, quantity: number, unit: string }> {
    if (!ingredientsStr) {
      return [];
    }

    // Split by comma if it's a comma-separated list
    const parts = ingredientsStr.split(',').map(s => s.trim());

    return parts.map(part => {
      // Try multiple patterns
      // Pattern 1: "Name quantity unit" (e.g., "Pollo 1 unit")
      // Pattern 2: "Name (quantity unit)" (e.g., "Pollo (1 unit)")
      // Pattern 3: "Name quantity unit (quantity unit)" - extract from parentheses

      let match = part.match(/(.+?)\s+(\d+(?:\.\d+)?)\s+(\w+)\s*\(/);
      if (match) {
        return {
          name: match[1].trim(),
          quantity: parseFloat(match[2]),
          unit: match[3].trim()
        };
      }

      match = part.match(/(.+?)\s+(\d+(?:\.\d+)?)\s+(\w+)/);
      if (match) {
        return {
          name: match[1].trim(),
          quantity: parseFloat(match[2]),
          unit: match[3].trim()
        };
      }

      match = part.match(/(.+?)\s*\((\d+(?:\.\d+)?)\s+(\w+)\)/);
      if (match) {
        return {
          name: match[1].trim(),
          quantity: parseFloat(match[2]),
          unit: match[3].trim()
        };
      }

      // Default: treat as name with quantity 1
      return {
        name: part.trim(),
        quantity: 1,
        unit: 'unit'
      };
    });
  }

  private getUserId(): number | null {
    const userIdStr = localStorage.getItem('userId');
    return userIdStr ? parseInt(userIdStr, 10) : null;
  }
}

