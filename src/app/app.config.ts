import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { tokenInterceptor } from './interceptor/token-interceptor';
import {provideLottieOptions} from 'ngx-lottie';
import player from 'lottie-web'

export const appConfig: ApplicationConfig = {
  providers: [
    provideLottieOptions({
      player: ()=> player,
    }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor])),
    provideCharts(withDefaultRegisterables()),
    providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: false
                }
            }
        })
  ]
};

