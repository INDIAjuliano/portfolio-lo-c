import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../front-office/components/icon/icon.component';
import { ThemeService } from '../../../core/services/theme.service';

interface ThemePalette {
  name: string;
  accent: string;
  accentHover: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  buttonBg: string;
  buttonText: string;
  light: string;
  tertiary: string;
  shadow: string;
  darkBgPrimary: string;
  darkBgSecondary: string;
  darkTextPrimary: string;
  darkTextSecondary: string;
  darkBorder: string;
  description: string;
  previewImage: string;
  heroVariant: 'hero1' | 'hero2';
}

@Component({
  selector: 'app-theme',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './theme.component.html',
  styleUrl: './theme.component.css'
})
export class ThemeComponent implements OnInit, OnDestroy {
  themes: ThemePalette[] = [
    {
      name: 'India-J',
      accent: '#b8965a',
      accentHover: '#a07d4a',
      primary: '#fafaf9',
      secondary: '#ffffff',
      text: '#1a1c1c',
      textSecondary: '#4c4546',
      border: '#cfc4c5',
      buttonBg: '#000000',
      buttonText: '#ffffff',
      light: '#e2c98a',
      tertiary: '#f5f2ed',
      shadow: 'rgba(0,0,0,0.08)',
      darkBgPrimary: '#0a0a0a',
      darkBgSecondary: '#141414',
      darkTextPrimary: '#f0f0f0',
      darkTextSecondary: '#a0a0a0',
      darkBorder: '#2a2a2a',
      description: 'Thème premium inspiré de l\'esthétique India-J avec des tons dorés et une élégance minimaliste.',
      previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      heroVariant: 'hero1'
    },
    {
      name: 'Violet',
      accent: '#6c5ce7',
      accentHover: '#5a4bd1',
      primary: '#f5f5f5',
      secondary: '#ffffff',
      text: '#1a1a2e',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      buttonBg: '#6c5ce7',
      buttonText: '#ffffff',
      light: '#8b7cf7',
      tertiary: '#f5f5f5',
      shadow: 'rgba(0,0,0,0.05)',
      darkBgPrimary: '#0f0f1a',
      darkBgSecondary: '#1a1a2e',
      darkTextPrimary: '#f0f0f0',
      darkTextSecondary: '#a0a0b0',
      darkBorder: '#2a2a3e',
      description: 'Palette violette moderne avec des accents profonds et un design professionnel.',
      previewImage: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=800&q=80',
      heroVariant: 'hero2'
    },
    {
      name: 'Vert',
      accent: '#059669',
      accentHover: '#047857',
      primary: '#f0fdf4',
      secondary: '#ffffff',
      text: '#064e3b',
      textSecondary: '#4b5563',
      border: '#bbf7d0',
      buttonBg: '#059669',
      buttonText: '#ffffff',
      light: '#34d399',
      tertiary: '#f0fdf4',
      shadow: 'rgba(0,0,0,0.05)',
      darkBgPrimary: '#022c22',
      darkBgSecondary: '#064e3b',
      darkTextPrimary: '#ecfdf5',
      darkTextSecondary: '#a7f3d0',
      darkBorder: '#14532d',
      description: 'Thème naturel et frais inspiré des tones vertes émeraude.',
      previewImage: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80',
      heroVariant: 'hero1'
    },
    {
      name: 'Orange',
      accent: '#f59e0b',
      accentHover: '#d97706',
      primary: '#fff7ed',
      secondary: '#ffffff',
      text: '#7c2d12',
      textSecondary: '#4b5563',
      border: '#fed7aa',
      buttonBg: '#f59e0b',
      buttonText: '#ffffff',
      light: '#fbbf24',
      tertiary: '#fff7ed',
      shadow: 'rgba(0,0,0,0.05)',
      darkBgPrimary: '#431407',
      darkBgSecondary: '#7c2d12',
      darkTextPrimary: '#fff7ed',
      darkTextSecondary: '#fed7aa',
      darkBorder: '#9a3412',
      description: 'Thème chaleureux et dynamique avec des accents orange ambré.',
      previewImage: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80',
      heroVariant: 'hero1'
    }
  ];

  selectedTheme: ThemePalette = this.themes[0];
  showThemeModal = false;
  applyColorsOnly = true;
  applyStructure = false;
  pendingTheme: ThemePalette | null = null;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    if (typeof document === 'undefined') return;
    const saved = localStorage.getItem('adminTheme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const found = this.themes.find(t => t.name === parsed.name);
        if (found) {
          this.selectedTheme = found;
        }
      } catch (e) {
        // ignore invalid JSON
      }
    }
    this.applyTheme(this.selectedTheme);
  }

  ngOnDestroy(): void {}

  @HostListener('window:resize')
  onResize(): void {}

  openThemeModal(theme: ThemePalette): void {
    this.pendingTheme = theme;
    this.applyColorsOnly = true;
    this.applyStructure = false;
    this.showThemeModal = true;
  }

  closeModal(): void {
    this.showThemeModal = false;
    this.pendingTheme = null;
  }

  confirmThemeChange(): void {
    if (this.pendingTheme) {
      this.selectedTheme = this.pendingTheme;
      this.applyTheme(this.pendingTheme);
    }
    this.closeModal();
  }

  selectTheme(theme: ThemePalette): void {
    this.selectedTheme = theme;
    this.applyTheme(theme);
  }

  private applyTheme(theme: ThemePalette): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--accent-hover', theme.accentHover);
    root.style.setProperty('--bg-primary', theme.primary);
    root.style.setProperty('--bg-secondary', theme.secondary);
    root.style.setProperty('--text-primary', theme.text);
    root.style.setProperty('--text-secondary', theme.textSecondary);
    root.style.setProperty('--border-color', theme.border);
    root.style.setProperty('--btn-primary-bg', theme.buttonBg);
    root.style.setProperty('--btn-primary-text', theme.buttonText);
    root.style.setProperty('--accent-light', theme.light);
    root.style.setProperty('--bg-tertiary', theme.tertiary);
    root.style.setProperty('--shadow-color', theme.shadow);
    root.style.setProperty('--dark-bg-primary', theme.darkBgPrimary);
    root.style.setProperty('--dark-bg-secondary', theme.darkBgSecondary);
    root.style.setProperty('--dark-text-primary', theme.darkTextPrimary);
    root.style.setProperty('--dark-text-secondary', theme.darkTextSecondary);
    root.style.setProperty('--dark-border-color', theme.darkBorder);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--accent-dark', theme.accentHover);
    root.style.setProperty('--bg-dark', theme.darkBgPrimary);
    root.style.setProperty('--bg-dark2', theme.darkBgSecondary);
    root.style.setProperty('--text-inverse', theme.buttonText);
    root.style.setProperty('--text-muted', theme.textSecondary);
    root.style.setProperty('--overlay-light', theme.shadow);
    root.style.setProperty('--card-bg', theme.secondary);
    root.style.setProperty('--btn-primary-hover', theme.accentHover);
    root.style.setProperty('--loader-bg', theme.darkBgPrimary);
    root.style.setProperty('--curtain-color1', theme.darkBgPrimary);
    root.style.setProperty('--curtain-color2', theme.darkBgSecondary);
    root.style.setProperty('--logo-color', theme.text);
    root.style.setProperty('--nav-link-color', theme.textSecondary);
    root.style.setProperty('--nav-link-hover', theme.accent);
    root.style.setProperty('--footer-bg', theme.secondary);
    body.setAttribute('data-hero-variant', theme.heroVariant);
    this.themeService.setHeroVariant(theme.heroVariant);
    try {
      localStorage.setItem('adminTheme', JSON.stringify(theme));
    } catch (e) {}
  }
}
