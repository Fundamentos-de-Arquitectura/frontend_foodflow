import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MenuService, Dish } from '../../services/menu.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  template: `
    <div class="menu-container">
      <h1>Menu Management</h1>

      <!-- Grid Layout: Manual on Left, Form on Right -->
      <div class="form-grid">
        <!-- Left Column: Ingredients Information Card -->
        <mat-card class="info-card">
          <mat-card-header>
            <mat-card-title>How to Enter Ingredients</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-content">
              <p class="info-description">
                Please enter the ingredients separated by commas.<br>
                Each ingredient must follow this format:
              </p>

              <div class="format-section">
                <strong>Name Quantity Unit</strong>
              </div>

              <div class="examples-section">
                <strong>Examples:</strong>
                <div class="example-item">Flour 2 cups</div>
                <div class="example-item">Milk 500 ml</div>
                <div class="example-item">Sugar 100 g</div>
              </div>

              <div class="full-example-section">
                <strong>Full Example (3 ingredients)</strong>
                <div class="full-example">Potato 2 units, GroundBeef 150 g, Onion 50 g</div>
              </div>

              <div class="tips-section">
                <strong>Tips</strong>
                <ul class="tips-list">
                  <li>Do not use parentheses or extra symbols.</li>
                  <li>Keep ingredient names simple (e.g., "Salt", "Butter", "Egg").</li>
                  <li>Use standard units like g, ml, cups, tbsp, units.</li>
                </ul>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Right Column: Add Dish Form -->
        <mat-card class="form-card">
        <mat-card-header>
          <mat-card-title>Add New Dish</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="addDish()" class="dish-form">
            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Dish Name</mat-label>
              <input matInput formControlName="name" />
              <mat-error *ngIf="form.get('name')?.hasError('required')">
                Dish name is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
              <mat-error *ngIf="form.get('description')?.hasError('required')">
                Description is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Price ($)</mat-label>
              <input type="number" matInput formControlName="price" step="0.01" />
              <mat-error *ngIf="form.get('price')?.hasError('required')">
                Price is required
              </mat-error>
              <mat-error *ngIf="form.get('price')?.hasError('min')">
                Price must be greater than 0
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Ingredients</mat-label>
              <textarea matInput formControlName="ingredients" rows="3"
                placeholder="Format: ingredient name, quantity unit (e.g., 'Tomato sauce 2 cups, Mozzarella 500 g, Basil 10 unit')"></textarea>
              <mat-error *ngIf="form.get('ingredients')?.hasError('required')">
                Ingredients are required
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              <mat-icon>add</mat-icon>
              Add Dish
            </button>
          </form>
        </mat-card-content>
      </mat-card>
      </div>

      <!-- Search -->
      <mat-card class="search-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search dishes...</mat-label>
            <input matInput (input)="onSearch($event)" placeholder="Type to search" />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Dishes Table -->
      <mat-card class="table-card">
        <mat-card-header>
          <mat-card-title>Dish List</mat-card-title>
          <mat-card-subtitle *ngIf="dishes.length === 0">No dishes available. Add your first dish above.</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="dishes" class="mat-elevation-z2" *ngIf="dishes.length > 0">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let dish">{{ dish.name }}</td>
            </ng-container>

            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let dish">{{ dish.description }}</td>
            </ng-container>

            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let dish">{{ dish.price | currency }}</td>
            </ng-container>

            <ng-container matColumnDef="ingredients">
              <th mat-header-cell *matHeaderCellDef>Ingredients</th>
              <td mat-cell *matCellDef="let dish">{{ dish.ingredients }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .menu-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
      align-items: start;
    }

    @media (max-width: 960px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-card, .search-card, .table-card, .info-card {
      margin-bottom: 0;
    }

    .search-card, .table-card {
      margin-bottom: 24px;
    }

    .dish-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-field {
      width: 100%;
    }

    .search-field {
      width: 100%;
      max-width: 400px;
    }

    .search-card .mat-mdc-card-content {
      display: flex;
      justify-content: center;
    }

    .info-card {
      background-color: rgba(186, 255, 184, 0.48);
      border-left: 4px solid #1f6e1f;
    }

    .info-content {
      padding: 8px 0;
    }

    .info-description {
      margin: 0 0 16px 0;
      line-height: 1.6;
    }

    .format-section {
      margin: 16px 0;
      padding: 12px;
      background-color: #ffffff;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
    }

    .examples-section {
      margin: 16px 0;
    }

    .examples-section strong {
      display: block;
      margin-bottom: 8px;
    }

    .example-item {
      padding: 8px 12px;
      margin: 4px 0;
      background-color: #ffffff;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
      border-left: 3px solid #4caf50;
    }

    .full-example-section {
      margin: 16px 0;
    }

    .full-example-section strong {
      display: block;
      margin-bottom: 8px;
    }

    .full-example {
      padding: 12px;
      background-color: #ffffff;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
      border: 1px solid #1976d2;
      word-break: break-word;
    }

    .tips-section {
      margin: 16px 0 0 0;
    }

    .tips-section strong {
      display: block;
      margin-bottom: 8px;
    }

    .tips-list {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }

    .tips-list li {
      margin: 6px 0;
      line-height: 1.5;
    }

    table {
      width: 100%;
    }
  `]
})
export class MenuComponent implements OnInit {
  displayedColumns: string[] = ['name', 'description', 'price', 'ingredients'];
  dishes: Dish[] = [];
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      ingredients: ['', Validators.required]
    });

    this.loadDishes();
  }

  loadDishes(): void {
    this.menuService.getDishes().subscribe({
      next: (data) => this.dishes = data,
      error: (err) => console.error('Error loading dishes', err)
    });
  }

  addDish(): void {
    if (this.form.valid) {
      const dishData = this.form.value;
      this.menuService.addDish(dishData).subscribe({
        next: (newDish) => {
          console.log('Dish added:', newDish);
          this.notificationService.success(`Dish "${newDish.name}" added successfully!`);
          this.form.reset();
          this.loadDishes(); // Refresh the list
        },
        error: (err) => {
          console.error('Error adding dish', err);
          this.notificationService.error('Failed to add dish. Please try again.');
        }
      });
    }
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim();
    this.menuService.searchDishes(query).subscribe({
      next: (filteredDishes) => this.dishes = filteredDishes,
      error: (err) => console.error('Error searching dishes', err)
    });
  }
}
