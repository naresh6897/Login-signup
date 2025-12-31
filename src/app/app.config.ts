import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { CookieService } from './cookie-service';

export const appConfig: ApplicationConfig = {
  providers: [CookieService,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
