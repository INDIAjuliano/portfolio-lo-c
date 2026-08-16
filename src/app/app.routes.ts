import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () => import('./front-office/front-office-layout/front-office-layout.component')
      .then(m => m.FrontOfficeLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./front-office/pages/home/home.component')
          .then(m => m.HomeComponent)
      },
      {
        path: 'gallery',
        loadComponent: () => import('./front-office/pages/gallery/gallery.component')
          .then(m => m.GalleryComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./front-office/pages/about-page/about-page.component')
          .then(m => m.AboutPageComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./front-office/pages/contact/contact.component')
          .then(m => m.ContactComponent)
      },
      {
        path: 'portfolio',
        loadComponent: () => import('./front-office/pages/portfolio/portfolio.component')
          .then(m => m.PortfolioComponent)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./front-office/pages/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./back-office/back-office.routes')
      .then(m => m.BACK_OFFICE_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
