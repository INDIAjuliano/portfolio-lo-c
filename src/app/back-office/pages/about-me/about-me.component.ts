import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.css'
})
export class AboutMeComponent implements OnInit {
  isDark = false;
  user: any = null;
  isLoading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (typeof document === 'undefined') return;
    const savedTheme = localStorage.getItem('adminTheme');
    this.isDark = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.apiService.getUsers().subscribe({
      next: (users) => {
        if (users && users.length > 0) {
          this.user = users[0];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load user data', err);
        this.isLoading = false;
      }
    });
  }
}
