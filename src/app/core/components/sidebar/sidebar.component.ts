import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatDividerModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  navItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'restaurant_menu', label: 'Menu', route: '/menu' },
    { icon: 'inventory_2', label: 'Inventory', route: '/inventory' },
    { icon: 'receipt_long', label: 'Orders', route: '/orders' },
    { icon: 'bar_chart', label: 'Reports', route: '/reports' },
    { icon: 'subscriptions', label: 'Subscriptions', route: '/subscriptions' },
  ];

  profileItem = { icon: 'person', label: 'Profile', route: '/profile' };
}
