import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MenuComponent } from './features/menu/menu.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { OrdersComponent } from './features/orders/orders.component';
import { ReportsComponent } from './features/reports/reports.component';
import { SubscriptionsComponent } from './features/subscriptions/subscriptions.component';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'menu', component: MenuComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'subscriptions', component: SubscriptionsComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
];
