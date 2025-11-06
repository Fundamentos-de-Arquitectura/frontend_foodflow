import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    TranslateModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  navItems = [
    { route: '/dashboard', icon: 'dashboard', label: 'DASHBOARD' },
    { route: '/menu', icon: 'restaurant_menu', label: 'MENU' },
    { route: '/inventory', icon: 'inventory_2', label: 'INVENTORY' },
    { route: '/orders', icon: 'shopping_cart', label: 'ORDERS' },
    { route: '/reports', icon: 'bar_chart', label: 'REPORTS' },
    { route: '/subscriptions', icon: 'subscriptions', label: 'SUBSCRIPTIONS' }
  ];

  profileItem = { route: '/profile', icon: 'person', label: 'PROFILE' };
}
