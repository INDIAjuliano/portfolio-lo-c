import { Component, HostListener, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { ThemeService } from '../../../core/services/theme.service';
import { MenuService } from '../../../core/services/menu.service';
import { gsap } from 'gsap';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  isScrolled = false;
  isDark = false;
  private themeSubscription: Subscription | null = null;
  @ViewChild('navbar') navbar!: ElementRef<HTMLElement>;
  @ViewChild('logoWrapper') logoWrapper!: ElementRef<HTMLElement>;

  constructor(
    private themeService: ThemeService,
    public menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.themeSubscription = this.themeService.isDark$.subscribe(
      isDark => this.isDark = isDark
    );
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    setTimeout(() => {
      this.navbar.nativeElement.classList.add('visible');
    }, 100);
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 80;
  }

  toggleMenu(): void {
    this.menuService.toggle();
  }

  closeMenu(): void {
    this.menuService.close();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  scrollTo(sectionId: string): void {
    this.menuService.close();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
