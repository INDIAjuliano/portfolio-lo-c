import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDarkSubject = new BehaviorSubject<boolean>(false);
  isDark$ = this.isDarkSubject.asObservable();

  private heroVariantSubject = new BehaviorSubject<'hero1' | 'hero2'>('hero2');
  heroVariant$ = this.heroVariantSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  initTheme(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    this.applyTheme(isDark);
    this.isDarkSubject.next(isDark);
    const adminTheme = localStorage.getItem('adminTheme');
    if (adminTheme) {
      try {
        const parsed = JSON.parse(adminTheme);
        if (parsed && parsed.heroVariant) {
          this.setHeroVariant(parsed.heroVariant);
        }
      } catch (e) {}
    }
  }

  toggleTheme(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const next = !this.isDarkSubject.value;
    this.applyTheme(next);
    this.isDarkSubject.next(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  setHeroVariant(variant: 'hero1' | 'hero2'): void {
    this.heroVariantSubject.next(variant);
  }

  getCurrentHeroVariant(): 'hero1' | 'hero2' {
    return this.heroVariantSubject.value;
  }

  private applyTheme(isDark: boolean): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}
