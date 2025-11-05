import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MatListModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  navItems = [
    { icon: 'dashboard', label: 'Dashboard' },
    { icon: 'restaurant_menu', label: 'Menu' },
    { icon: 'inventory_2', label: 'Inventory' },
    { icon: 'receipt_long', label: 'Orders' },
    { icon: 'bar_chart', label: 'Reports' },
    { icon: 'subscriptions', label: 'Subscriptions' },
  ];

  profileItem = { icon: 'person', label: 'Profile' };
}
