import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatOptionModule, MatButtonModule, TranslateModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {
  languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' }
  ];

  constructor(public translate: TranslateService, private router: Router) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
