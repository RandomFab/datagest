import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'today', pathMatch: 'full' },
  {
    path: 'today',
    loadChildren: () =>
      import('./features/today/today.routes').then(m => m.TODAY_ROUTES),
  },
];
