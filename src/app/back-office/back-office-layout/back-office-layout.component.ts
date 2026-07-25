import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../front-office/components/icon/icon.component';

interface LangOption {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-back-office-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, IconComponent],
  templateUrl: './back-office-layout.component.html',
  styleUrl: './back-office-layout.component.css'
})
export class BackOfficeLayoutComponent implements OnInit, OnDestroy {
  isSidebarHidden = false;
  isDropdownOpen = false;
  isDark = false;
  sidebarToggleIcon = 'chevron_left';
  sidebarTooltip = 'Réduire le menu';

  languages: LangOption[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' }
  ];
  currentLang = 'fr';
  isLangMenuOpen = false;

  get currentLangLabel(): string {
    const found = this.languages.find(l => l.code === this.currentLang);
    return found ? `${found.flag} ${found.name}` : 'Langue';
  }

  ngOnInit(): void {
    if (typeof document === 'undefined') return;
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme && savedTheme.trim().startsWith('{')) {
      try {
        const theme = JSON.parse(savedTheme);
        this.applyThemeFromStorage(theme);
      } catch (e) {
        // ignore invalid JSON
      }
      this.isDark = false;
    } else {
      this.isDark = savedTheme === 'dark';
    }
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
    document.addEventListener('click', this.closeDropdown);
    document.addEventListener('click', this.closeLangMenu);

    const savedSidebar = localStorage.getItem('adminSidebarHidden');
    if (savedSidebar === 'true') {
      this.isSidebarHidden = true;
      this.sidebarToggleIcon = 'chevron_right';
      this.sidebarTooltip = 'Afficher le menu';
      if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.remove('open');
      } else {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        const toggleWrap = document.getElementById('sidebarToggleWrap');
        sidebar?.classList.add('hidden');
        mainContent?.classList.add('expanded');
        toggleWrap?.classList.add('hidden');
      }
    }

    this.detectBrowserLang();
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.closeDropdown);
      document.removeEventListener('click', this.closeLangMenu);
    }
  }

  toggleSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const toggleWrap = document.getElementById('sidebarToggleWrap');

    if (window.innerWidth <= 1024) {
      sidebar?.classList.toggle('open', !this.isSidebarHidden);
      sidebar?.classList.remove('hidden');
    } else {
      sidebar?.classList.toggle('hidden', this.isSidebarHidden);
      sidebar?.classList.remove('open');
    }

    mainContent?.classList.toggle('expanded', this.isSidebarHidden);
    toggleWrap?.classList.toggle('hidden', this.isSidebarHidden);

    if (this.isSidebarHidden) {
      this.sidebarToggleIcon = 'chevron_right';
      this.sidebarTooltip = 'Afficher le menu';
    } else {
      this.sidebarToggleIcon = 'chevron_left';
      this.sidebarTooltip = 'Réduire le menu';
    }

    localStorage.setItem('adminSidebarHidden', String(this.isSidebarHidden));
  }

  @HostListener('window:resize')
  onResize(): void {
    const sidebar = document.getElementById('sidebar');

    if (window.innerWidth <= 1024) {
      sidebar?.classList.remove('hidden');
      if (!this.isSidebarHidden) {
        sidebar?.classList.add('open');
      }
      this.sidebarToggleIcon = this.isSidebarHidden ? 'menu' : 'close';
      this.sidebarTooltip = this.isSidebarHidden ? 'Afficher le menu' : 'Réduire le menu';
    } else {
      sidebar?.classList.remove('open');
      if (this.isSidebarHidden) {
        sidebar?.classList.add('hidden');
      } else {
        sidebar?.classList.remove('hidden');
      }
      if (this.isSidebarHidden) {
        this.sidebarToggleIcon = 'chevron_right';
        this.sidebarTooltip = 'Afficher le menu';
      } else {
        this.sidebarToggleIcon = 'chevron_left';
        this.sidebarTooltip = 'Réduire le menu';
      }
    }
  }

  toggleTheme(): void {
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme && savedTheme.trim().startsWith('{')) {
      localStorage.removeItem('adminTheme');
    }
    this.isDark = !this.isDark;
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
    localStorage.setItem('adminTheme', this.isDark ? 'dark' : 'light');
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown = (): void => {
    this.isDropdownOpen = false;
  };

  toggleLangMenu(): void {
    this.isLangMenuOpen = !this.isLangMenuOpen;
  }

  closeLangMenu = (): void => {
    this.isLangMenuOpen = false;
  };

  selectLang(code: string): void {
    this.currentLang = code;
    this.isLangMenuOpen = false;
    localStorage.setItem('adminLang', code);
  }

  private detectBrowserLang(): void {
    if (typeof navigator === 'undefined') return;
    const browserLang = navigator.language?.slice(0, 2).toLowerCase() || 'fr';
    const supported = this.languages.find(l => l.code === browserLang);
    this.currentLang = supported ? supported.code : 'fr';
    localStorage.setItem('adminLang', this.currentLang);
  }

  private applyThemeFromStorage(theme: any): void {
    if (typeof document === 'undefined' || !theme) return;
    const root = document.documentElement;
    root.style.setProperty('--accent-color', theme.accent || theme.accentColor || '#b8965a');
    root.style.setProperty('--accent-hover', theme.accentHover || '#a07d4a');
    root.style.setProperty('--bg-primary', theme.primary || '#fafaf9');
    root.style.setProperty('--bg-secondary', theme.secondary || '#ffffff');
    root.style.setProperty('--text-primary', theme.text || '#1a1c1c');
    root.style.setProperty('--text-secondary', theme.textSecondary || '#4c4546');
    root.style.setProperty('--border-color', theme.border || '#cfc4c5');
    root.style.setProperty('--btn-primary-bg', theme.buttonBg || '#000000');
    root.style.setProperty('--btn-primary-text', theme.buttonText || '#ffffff');
    root.style.setProperty('--accent-light', theme.light || '#e2c98a');
    root.style.setProperty('--bg-tertiary', theme.tertiary || '#f5f2ed');
    root.style.setProperty('--shadow-color', theme.shadow || 'rgba(0,0,0,0.08)');
    root.style.setProperty('--dark-bg-primary', theme.darkBgPrimary || '#0a0a0a');
    root.style.setProperty('--dark-bg-secondary', theme.darkBgSecondary || '#141414');
    root.style.setProperty('--dark-text-primary', theme.darkTextPrimary || '#f0f0f0');
    root.style.setProperty('--dark-text-secondary', theme.darkTextSecondary || '#a0a0a0');
    root.style.setProperty('--dark-border-color', theme.darkBorder || '#2a2a2a');
    root.style.setProperty('--accent', theme.accent || '#b8965a');
    root.style.setProperty('--accent-dark', theme.accentHover || '#a07d4a');
    root.style.setProperty('--bg-dark', theme.darkBgPrimary || '#0a0a0a');
    root.style.setProperty('--bg-dark2', theme.darkBgSecondary || '#141414');
    root.style.setProperty('--text-inverse', theme.buttonText || '#ffffff');
    root.style.setProperty('--text-muted', theme.textSecondary || '#4c4546');
    root.style.setProperty('--overlay-light', theme.shadow || 'rgba(0,0,0,0.08)');
    root.style.setProperty('--card-bg', theme.secondary || '#ffffff');
    root.style.setProperty('--btn-primary-hover', theme.accentHover || '#a07d4a');
    root.style.setProperty('--loader-bg', theme.darkBgPrimary || '#0a0a0a');
    root.style.setProperty('--curtain-color1', theme.darkBgPrimary || '#0a0a0a');
    root.style.setProperty('--curtain-color2', theme.darkBgSecondary || '#141414');
    root.style.setProperty('--logo-color', theme.text || '#1a1c1c');
    root.style.setProperty('--nav-link-color', theme.textSecondary || '#4c4546');
    root.style.setProperty('--nav-link-hover', theme.accent || '#b8965a');
    root.style.setProperty('--footer-bg', theme.secondary || '#f9f9f9');
  }
}
