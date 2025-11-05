import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';
import { PlaceholderComponent } from './placeholder.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: PlaceholderComponent },
      // luego agregaremos aquí Inventory, Orders, etc.
    ]
  }
];
