import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatSelectModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {
  languages = ['English', 'Español'];
  selectedLang = 'English';
  subscriptionType = 'Premium'; // vendrá del backend luego

  onLogout() {
    console.log('Logging out...');
  }
}
