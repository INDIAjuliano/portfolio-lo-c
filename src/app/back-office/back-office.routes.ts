import { Routes } from '@angular/router';
import { BackOfficeLayoutComponent } from './back-office-layout/back-office-layout.component';

export const BACK_OFFICE_ROUTES: Routes = [
  {
    path: '',
    component: BackOfficeLayoutComponent,
    children: [
      // {
      //   path: '',
      //   redirectTo: 'dashboard',
      //   pathMatch: 'full'
      // },
      // {
      //   path: 'dashboard',
      //   loadComponent: () => import('./pages/dashboard/dashboard.component')
      //     .then(m => m.DashboardComponent)
      // }
    ]
  }
];
