import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Partner } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-partners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.css'
})
export class PartnersComponent implements OnInit, OnDestroy {
  partners: Partner[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  formData: Partial<Partner> = {
    name: '',
    description: '',
    logoUrl: '',
    linkUrl: '',
    position: 0,
    isPublished: false,
    isSiteLogo: false
  };

  private destroy$ = new Subject<void>();
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadPartners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPartners(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.apiService.getAllPartners().subscribe({
      next: (data: any[]) => {
        this.partners = data || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = 'Impossible de charger les partenaires.';
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = {
      name: '',
      description: '',
      logoUrl: '',
      linkUrl: '',
      position: this.partners.length,
      isPublished: true,
      isSiteLogo: false
    };
    this.showModal = true;
  }

  openEditModal(partner: Partner): void {
    this.isEditing = true;
    this.editingId = partner.id;
    this.formData = { ...partner };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = null;
    this.formData = {
      name: '',
      description: '',
      logoUrl: '',
      linkUrl: '',
      position: 0,
      isPublished: false,
      isSiteLogo: false
    };
  }

  submitForm(): void {
    if (!this.formData.name?.trim()) {
      alert('Le nom du partenaire est requis');
      return;
    }

    if (this.isEditing && this.editingId) {
      this.apiService.updatePartner(this.editingId, this.formData).subscribe({
        next: () => {
          this.loadPartners();
          this.closeModal();
        },
        error: () => alert('Erreur lors de la modification')
      });
    } else {
      this.apiService.createPartner(this.formData).subscribe({
        next: () => {
          this.loadPartners();
          this.closeModal();
        },
        error: () => alert('Erreur lors de la création')
      });
    }
  }

  deletePartner(id: number, name: string): void {
    if (!confirm(`Supprimer le partenaire "${name}" ?`)) return;
    this.apiService.deletePartner(id).subscribe({
      next: () => this.loadPartners(),
      error: () => alert('Erreur lors de la suppression')
    });
  }

  togglePublish(id: number, isPublished: boolean): void {
    this.apiService.updatePartner(id, { isPublished: !isPublished }).subscribe({
      next: () => this.loadPartners(),
      error: () => alert('Erreur lors de la mise à jour du statut')
    });
  }

  toggleSiteLogo(id: number, isSiteLogo: boolean): void {
    this.apiService.updatePartner(id, { isSiteLogo: !isSiteLogo }).subscribe({
      next: () => this.loadPartners(),
      error: () => alert('Erreur lors de la mise à jour du logo du site')
    });
  }
}
