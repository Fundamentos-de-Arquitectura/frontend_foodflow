import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <h2>Inventory</h2>
      <p>Welcome to FoodFlow Inventory Management.</p>
    </mat-card>
  `
})

export class InventoryComponent {}
