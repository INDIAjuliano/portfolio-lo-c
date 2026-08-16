import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs';
import { Subject } from 'rxjs';

// Components
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { LoaderComponent } from '../components/loader/loader.component';
import { MobileMenuComponent } from '../components/mobile-menu/mobile-menu.component';

// Services
import { ThemeService } from '../../core/services/theme.service';
import { ScrollService } from '../../core/services/scroll.service';
import { MenuService } from '../../core/services/menu.service';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-front-office-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    LoaderComponent,
    MobileMenuComponent
  ],
  templateUrl: './front-office-layout.component.html',
  styleUrls: ['./front-office-layout.component.css']
})
export class FrontOfficeLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(LoaderComponent) loaderComponent!: LoaderComponent;
  showLoader = true;
  private initialTimer: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private scrollService: ScrollService,
    public menuService: MenuService,
    private router: Router,
    private loaderService: LoaderService
  ) { }

  ngOnInit(): void {
    this.themeService.initTheme();

    this.loaderService.dismiss$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.loaderComponent && !this.loaderComponent['isDismissed']) {
        this.loaderComponent.dismiss();
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;

    if (this.showLoader && this.loaderComponent) {
      this.loaderComponent.startProgress();
      this.initialTimer = setTimeout(() => {
        this.scrollService.initScrollReveal();
        this.scrollService.initGSAPAnimations();
      }, 2600);
    } else {
      this.refreshHomeAnimations();
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      if (event.urlAfterRedirects === '/' || event.urlAfterRedirects === '') {
        clearTimeout(this.initialTimer);
        this.refreshHomeAnimations();
      }
    });
  }

  private refreshHomeAnimations(): void {
    this.scrollService.disconnectScrollReveal();
    this.scrollService.killGSAPAnimations();

    setTimeout(() => {
      this.scrollService.initScrollReveal();
      this.scrollService.initGSAPAnimations();
    }, 100);
  }

  onLoaderDismissed(): void {
    this.showLoader = false;
    if (this.initialTimer) {
      clearTimeout(this.initialTimer);
      this.initialTimer = null;
    }
    this.refreshHomeAnimations();
  }

  onLoaderReady(): void {
    if (this.loaderComponent && !this.loaderComponent['isDismissed']) {
      this.loaderComponent.dismiss();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.initialTimer) {
      clearTimeout(this.initialTimer);
    }
  }
}
