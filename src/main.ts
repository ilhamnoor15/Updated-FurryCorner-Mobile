import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { NoReuseStrategy } from './app/legacy/no-reuse.strategy';

bootstrapApplication(AppComponent, {
  providers: [
    // Every navigation builds a fresh page (the old pages ran their script once per page load).
    { provide: RouteReuseStrategy, useClass: NoReuseStrategy },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes),
  ],
});
