import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  passwordVisible = false;
  isSubmitting = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isDark = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (typeof document === 'undefined') return;
    const savedTheme = localStorage.getItem('loginTheme');
    this.isDark = savedTheme === 'dark';
    this.applyTheme();

    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user?.roles.includes('ROLE_ADMIN')) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    this.applyTheme();
  }

  private applyTheme(): void {
    if (typeof document === 'undefined') return;
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
    localStorage.setItem('loginTheme', this.isDark ? 'dark' : 'light');
  }

   onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isSubmitting = true;
    console.log('[Login] Submit attempt', { email: this.email });

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('[Login] Success', response);
        this.successMessage = 'Connexion réussie ! Redirection...';
        setTimeout(() => {
          const token = this.authService.getToken();
          console.log('[Login] Token before redirect', token);
          this.router.navigate(['/admin']);
        }, 800);
      },
      error: (err) => {
        console.error('[Login] Error', err);
        this.errorMessage = 'Email ou mot de passe incorrect';
        this.isSubmitting = false;
      }
    });
  }
}
