import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { FingerprintjsProAngularModule } from '@fingerprintjs/fingerprintjs-pro-angular';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      FingerprintjsProAngularModule.forRoot({
        loadOptions: {
          apiKey: environment.fingerprintPro.apiKey,
          region: environment.fingerprintPro.region as 'eu' | 'us' | 'ap',
        }
      })
    )
  ]
};
