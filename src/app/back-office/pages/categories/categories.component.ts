import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../front-office/components/icon/icon.component';
import { ApiService, Category } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
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

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCategories();
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

    this.apiService.getCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
        this.isLoading = false;
      },
      error: (err) => {
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
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => alert('Erreur lors de la modification: ' + (err.error?.message || err.message))
      });
    } else {
      this.apiService.createCategory(payload).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => alert('Erreur lors de la création: ' + (err.error?.message || err.message))
      });
    }
  }

  deleteCategory(id: number, name: string): void {
    if (!confirm(`Supprimer la catégorie "${name}" ?`)) return;
    this.apiService.deleteCategory(id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => alert('Erreur lors de la suppression: ' + (err.error?.message || err.message))
    });
  }
}
