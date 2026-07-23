import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDarkSubject = new BehaviorSubject<boolean>(false);
  isDark$ = this.isDarkSubject.asObservable();

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
  }

  toggleTheme(): void {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const next = !this.isDarkSubject.value;
    this.applyTheme(next);
    this.isDarkSubject.next(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean): void {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }
}
