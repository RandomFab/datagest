import { Routes } from '@angular/router';

export const TODAY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/today-page/today-page.component').then(
        m => m.TodayPageComponent,
      ),
  },
];
