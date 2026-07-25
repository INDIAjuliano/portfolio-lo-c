import { Routes } from '@angular/router';
import { BackOfficeLayoutComponent } from './back-office-layout/back-office-layout.component';
import { MediaLibraryComponent } from './pages/media-library/media-library.component';
import { AboutMeComponent } from './pages/about-me/about-me.component';
import { ThemeComponent } from './pages/theme/theme.component';

export const BACK_OFFICE_ROUTES: Routes = [
  {
    path: '',
    component: BackOfficeLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'media-library',
        pathMatch: 'full'
      },
      {
        path: 'media-library',
        loadComponent: () => import('./pages/media-library/media-library.component')
          .then(m => m.MediaLibraryComponent)
      },
      {
        path: 'about-me',
        loadComponent: () => import('./pages/about-me/about-me.component')
          .then(m => m.AboutMeComponent)
      },
      {
        path: 'theme',
        loadComponent: () => import('./pages/theme/theme.component')
          .then(m => m.ThemeComponent)
      }
    ]
  }
];
