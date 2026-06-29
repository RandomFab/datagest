import { Routes } from '@angular/router';

export const FOODS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/foods-page/foods-page.component').then(m => m.FoodsPageComponent),
  },
];
