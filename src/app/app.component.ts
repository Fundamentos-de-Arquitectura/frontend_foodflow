import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  ngOnInit() {
    this.translate.onLangChange.subscribe(() => {
      // Handle language change if needed
    });

    // Set up default language and supported languages
    this.translate.setDefaultLang('en');
    this.translate.addLangs(['en', 'es']);

    // Browser language detection
    const browserLang = this.translate.getBrowserLang();
    const supportedLanguages = ['en', 'es'];

    // Use browser language if supported, otherwise default to English
    const defaultLang = supportedLanguages.includes(browserLang || '') ? (browserLang || 'en') : 'en';
    this.translate.use(defaultLang);
  }
}
