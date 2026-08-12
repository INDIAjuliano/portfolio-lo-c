import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../front-office/components/icon/icon.component';
import { ApiService, Category } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { MediaStateService } from '../../../core/services/media-state.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  formData: Partial<Category> = {
    name: '',
    slug: '',
    description: '',
    icon: ''
  };

  private destroy$ = new Subject<void>();
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private mediaStateService = inject(MediaStateService);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.mediaStateService.categories$.pipe(takeUntil(this.destroy$)).subscribe((categories: Category[]) => {
      this.categories = categories || [];
      this.isLoading = false;
    });

    this.mediaStateService.loadAll().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les catégories.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (!this.authService.isAuthenticated()) {
      this.errorMessage = 'Vous devez être connecté pour voir les catégories.';
      this.isLoading = false;
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }

    this.mediaStateService.loadAll().subscribe({
      next: () => {
        this.categories = this.mediaStateService.currentCategories || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        const status = err?.status;
        const message = err?.error?.message || err?.message || 'Erreur inconnue';
        if (status === 401) {
          this.errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.errorMessage = `Impossible de charger les catégories. (${status}: ${message})`;
        }
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = { name: '', slug: '', description: '', icon: '' };
    this.showModal = true;
  }

  openEditModal(category: Category): void {
    this.isEditing = true;
    this.editingId = category.id;
    this.formData = { ...category };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.formData = { name: '', slug: '', description: '', icon: '' };
  }

  submitForm(): void {
    if (!this.formData.name || !this.formData.slug) {
      alert('Le nom et le slug sont requis');
      return;
    }

    const payload = {
      name: this.formData.name,
      slug: this.formData.slug,
      description: this.formData.description || null,
      icon: this.formData.icon || null
    };

    if (this.isEditing && this.editingId) {
      this.apiService.updateCategory(this.editingId, payload).subscribe({
        next: () => {
          this.mediaStateService.loadAll().subscribe();
          this.closeModal();
        },
        error: (err: any) => alert('Erreur lors de la modification: ' + (err.error?.message || err.message))
      });
    } else {
      this.apiService.createCategory(payload).subscribe({
        next: () => {
          this.mediaStateService.loadAll().subscribe();
          this.closeModal();
        },
        error: (err: any) => alert('Erreur lors de la création: ' + (err.error?.message || err.message))
      });
    }
  }

  deleteCategory(id: number, name: string): void {
    if (!confirm(`Supprimer la catégorie "${name}" ?`)) return;
    this.apiService.deleteCategory(id).subscribe({
      next: () => {
        this.mediaStateService.loadAll().subscribe();
      },
      error: (err: any) => alert('Erreur lors de la suppression: ' + (err.error?.message || err.message))
    });
  }
}
