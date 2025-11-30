import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

// Backend Dish structure (from menu service)
export interface BackendIngredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface BackendDish {
  id: number;
  name: string;
  ingredients: BackendIngredient[];
  price: number;
  description: string;
  userId: number;
}

// Frontend Dish interface (for UI compatibility)
export interface Dish {
  id?: number;
  name: string;
  description: string;
  price: number;
  ingredients: string; // Frontend uses string, backend uses array
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.serverBaseUrl}/menu`;

  constructor(private http: HttpClient) { }

  getDishes(): Observable<Dish[]> {
    // Get userId from localStorage to fetch only user's dishes
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      throw new Error('User ID not found. Please log in again.');
    }
    const userId = parseInt(userIdStr, 10);

    // Fetch only dishes created by this user
    return this.http.get<BackendDish[]>(`${this.apiUrl}/users/${userId}/dishes`).pipe(
      map(dishes => dishes.map(d => this.mapBackendToFrontend(d)))
    );
  }

  addDish(dish: Omit<Dish, 'id'>): Observable<Dish> {
    // Get userId from localStorage (set during login)
    const userIdStr = localStorage.getItem('userId');
    if (!userIdStr) {
      throw new Error('User ID not found. Please log in again.');
    }
    const userId = parseInt(userIdStr, 10);

    // Parse ingredients string to array format expected by backend
    const ingredients = this.parseIngredientsString(dish.ingredients);

    const backendDish = {
      name: dish.name,
      description: dish.description,
      price: dish.price,
      ingredients: ingredients
    };

    return this.http.post<BackendDish>(`${this.apiUrl}/users/${userId}/dishes`, backendDish).pipe(
      map(d => this.mapBackendToFrontend(d))
    );
  }

  searchDishes(query: string): Observable<Dish[]> {
    return this.getDishes().pipe(
      map(dishes => query ?
        dishes.filter(dish =>
          dish.name.toLowerCase().includes(query.toLowerCase())
        ) : dishes
      )
    );
  }

  private mapBackendToFrontend(backend: BackendDish): Dish {
    return {
      id: backend.id,
      name: backend.name,
      description: backend.description,
      price: Number(backend.price),
      ingredients: backend.ingredients.map(ing =>
        `${ing.name} (${ing.quantity} ${ing.unit})`
      ).join(', ')
    };
  }

  private parseIngredientsString(ingredientsStr: string): Array<{ name: string, quantity: number, unit: string }> {
    // Simple parser - assumes format like "Tomato sauce, mozzarella, basil"
    // For a more robust solution, you might want to enhance this
    // For now, we'll create a simple mapping
    const parts = ingredientsStr.split(',').map(s => s.trim());
    return parts.map(part => {
      // Try to extract quantity and unit if present (e.g., "2 cups flour" -> quantity: 2, unit: "cups", name: "flour")
      const match = part.match(/^(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)$/);
      if (match) {
        return {
          name: match[3],
          quantity: parseFloat(match[1]),
          unit: match[2]
        };
      }
      // Default: treat entire string as name with default quantity and unit
      return {
        name: part,
        quantity: 1,
        unit: 'unit'
      };
    });
  }
}
