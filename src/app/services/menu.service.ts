import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Dish {
  id?: number;
  name: string;
  description: string;
  price: number;
  ingredients: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private dishesSubject = new BehaviorSubject<Dish[]>([]);
  private dishes$ = this.dishesSubject.asObservable();

  constructor() {
    // Load initial mock data
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const mockDishes: Dish[] = [
      {
        id: 1,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 12.99,
        ingredients: 'Tomato sauce, mozzarella, basil, olive oil'
      },
      {
        id: 2,
        name: 'Chicken Burger',
        description: 'Grilled chicken burger with lettuce, tomato, and mayo',
        price: 10.50,
        ingredients: 'Chicken breast, burger bun, lettuce, tomato, mayo'
      },
      {
        id: 3,
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with caesar dressing and croutons',
        price: 8.99,
        ingredients: 'Romaine lettuce, croutons, parmesan, caesar dressing'
      }
    ];
    this.dishesSubject.next(mockDishes);
  }

  getDishes(): Observable<Dish[]> {
    return this.dishes$;
  }

  addDish(dish: Omit<Dish, 'id'>): Observable<Dish> {
    const currentDishes = this.dishesSubject.value;
    const newDish: Dish = {
      ...dish,
      id: Math.max(...currentDishes.map(d => d.id || 0), 0) + 1
    };
    this.dishesSubject.next([...currentDishes, newDish]);
    return new Observable(observer => {
      observer.next(newDish);
      observer.complete();
    });
  }

  searchDishes(query: string): Observable<Dish[]> {
    return new Observable(observer => {
      const allDishes = this.dishesSubject.value;
      const filteredDishes = query ?
        allDishes.filter(dish =>
          dish.name.toLowerCase().includes(query.toLowerCase())
        ) : allDishes;
      observer.next(filteredDishes);
      observer.complete();
    });
  }
}
