import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatOptionModule, MatButtonModule, TranslateModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit, OnDestroy {
  currentLang: string = 'en';

  languages = [
    { code: 'en', label: 'LANGUAGE_ENGLISH' },
    { code: 'es', label: 'LANGUAGE_SPANISH' }
  ];

  private langChangeSubscription?: Subscription;

  constructor(public translate: TranslateService, private router: Router) {}

  ngOnInit() {
    // Subscribe to language changes to update currentLang
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.currentLang = this.translate.currentLang;
    });
    // Set initial value
    this.currentLang = this.translate.currentLang;
  }

  ngOnDestroy() {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }

  logout() {
    // Clear authentication token
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Navigate to login
    this.router.navigate(['/login']);
  }
}
