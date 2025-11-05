import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <h2>Profile</h2>
      <p>Welcome to your FoodFlow Profile.</p>
    </mat-card>
  `
})

export class ProfileComponent {}
