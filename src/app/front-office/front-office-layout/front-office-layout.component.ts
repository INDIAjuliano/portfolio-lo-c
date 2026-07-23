import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

// Components
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { LoaderComponent } from '../components/loader/loader.component';
import { MobileMenuComponent } from '../components/mobile-menu/mobile-menu.component';

// Services
import { ThemeService } from '../../core/services/theme.service';
import { ScrollService } from '../../core/services/scroll.service';
import { MenuService } from '../../core/services/menu.service';

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
export class FrontOfficeLayoutComponent implements OnInit, AfterViewInit {
  showLoader = true;

  constructor(
    private themeService: ThemeService,
    private scrollService: ScrollService,
    public menuService: MenuService
  ) { }

  ngOnInit(): void {
    this.themeService.initTheme();
  }

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      this.scrollService.initScrollReveal();
      this.scrollService.initGSAPAnimations();
      this.scrollService.initPortfolioHover();
    }, 2600);
  }

  onLoaderDismissed(): void {
    this.showLoader = false;
  }
}
