import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [MatButtonModule, MatCardModule],
  template: `
    <div style="display:flex; justify-content:center; margin-top:5rem;">
      <mat-card style="padding:2rem; text-align:center;">
        <h1>FoodFlow</h1>
        <p>Angular Material setup</p>
        <button mat-raised-button color="primary">Primary</button>
        <button mat-raised-button color="accent">Accent</button>
      </mat-card>
    </div>
  `
})
export class PlaceholderComponent {}
