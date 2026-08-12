import { Component, OnInit, OnDestroy, HostListener, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, map, Observable, switchMap, of, catchError, Subject, takeUntil } from 'rxjs';
import { ApiService, AlbumCreateRequest, Category, MediaItem } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { MediaStateService } from '../../../core/services/media-state.service';
import { ContentService, ContentSectionPage } from '../../../core/services/content.service';
import { environment } from '../../../../environments/environment';
import { ManagePagesComponent } from '../manage-pages/manage-pages.component';

interface MediaItemLocal {
  id?: number;
  title: string;
  category: string;
  type: string;
  url: string;
  date: string;
  alt: string;
  description: string;
  keywords: string[];
  status: string;
  albumId: number;
  albumName: string;
  albums: { id: number; name: string }[];
}

interface AlbumLocal {
  id: number;
  name: string;
  cover: string;
  category: string;
  photosCount: number;
  status: 'published' | 'draft';
  description?: string;
  coverUrl?: string;
  mediaIds: number[];
  categoryId?: number;
  page?: string;
  section?: string;
  mediaUrls?: string[];
}

const DEFAULT_ALBUM_COVER = 'https://images.pexels.com/photos/10965788/pexels-photo-10965788.jpeg';

export const CAROUSEL_PAGES = [
  { value: 'home', label: 'Home' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'about', label: 'About' },
  { value: 'contact', label: 'Contact' }
] as const;

export const CAROUSEL_SECTIONS: Record<string, { value: string; label: string }[]> = {
  home: [
    { value: 'hero', label: 'Hero' },
    { value: 'hero2', label: 'Hero 2' },
    { value: 'gallery', label: 'Gallery section' },
    { value: 'portfolio', label: 'Portfolio section' },
    { value: 'about', label: 'About section' },
    { value: 'passion', label: 'Passion' },
    { value: 'offer', label: 'Offer' }
  ],
  gallery: [
    { value: 'main', label: 'Main gallery' }
  ],
  portfolio: [
    { value: 'main', label: 'Main portfolio' }
  ],
  about: [
    { value: 'main', label: 'Main about' }
  ],
  contact: [
    { value: 'main', label: 'Main contact' }
  ]
};

interface MediaFormData {
  title: string;
  slug: string;
  description: string;
  type: string;
  imageUrl: string;
  videoUrl: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
}

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [CommonModule, FormsModule, ManagePagesComponent],
  templateUrl: './media-library.component.html',
  styleUrl: './media-library.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaLibraryComponent implements OnInit, OnDestroy {
  images: MediaItemLocal[] = [];
  albums: AlbumLocal[] = [];
  mediaItems: MediaItem[] = [];
  categories: Category[] = [];
  currentFilter = 'all';
  isDropdownOpen = false;
  isDark = false;
  viewMode: 'grid' | 'table' = 'grid';
  pageSize = 10;
  currentPage = 1;
  selectedAlbumId: number | null = null;
  albumViewMode: 'grid' | 'table' = 'grid';
  albumMediaTypeFilter: 'all' | 'image' | 'video' = 'all';
  isLoading = false;
  errorMessage: string | null = null;

  selectedMediaIds: Set<number> = new Set();
  isSelectionMode = false;
  draggedMediaId: number | null = null;
  dragOverMediaId: number | null = null;
  managePagesTabActive = false;

  showAddModal = false;
  newAlbum: AlbumCreateRequest & { page?: string; section?: string } = {
    title: '',
    description: '',
    coverUrl: '',
    mediaIds: [],
    categoryId: 0,
    page: '',
    section: '',
    mediaUrls: []
  };
  isSubmitting = false;
  editingAlbumId: number | null = null;
  coverSource: 'url' | 'file' = 'url';
  coverFile: File | null = null;
  coverPreview: string | null = null;

  showMediaModal = false;
  isEditingMedia = false;
  editingMediaId: number | null = null;
  mediaForm: MediaFormData = {
    title: '',
    slug: '',
    description: '',
    type: 'image',
    imageUrl: '',
    videoUrl: '',
    tags: [],
    isPublished: false,
    isFeatured: false
  };
  isMediaSubmitting = false;
  tagsInput = '';
  mediaFiles: File[] = [];
  mediaPreviews: string[] = [];
  mediaSource: 'url' | 'file' = 'url';
  currentAlbumId: number | null = null;

  showDeleteConfirm = false;
  deleteConfirmType: 'media' | 'album' = 'media';
  deleteConfirmId: number | null = null;
  isDeleteSubmitting = false;

  showPreview = false;
  previewMedia: { url: string; type: string; title: string } | null = null;
  previewIndex = -1;

  showMediaActions = false;
  selectedMedia: { id: number; title: string } | null = null;

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimer: any = null;
  toastProgress = 100;

  textsTabActive = false;
  sectionPages: ContentSectionPage[] = [];
  selectedSectionPageId: number | null = null;
  sectionTextForm: { title: string; description: string; content: string } = { title: '', description: '', content: '' };
  isSectionTextSubmitting = false;

  private destroy$ = new Subject<void>();
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private mediaStateService = inject(MediaStateService);
  private contentService = inject(ContentService);

  private cachedFilteredImages: MediaItemLocal[] = [];
  private cachedPagedImages: MediaItemLocal[] = [];

  ngOnInit(): void {
    if (typeof document === 'undefined') return;
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    const savedTheme = localStorage.getItem('adminTheme');
    this.isDark = savedTheme === 'dark';
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
    document.addEventListener('click', this.closeDropdown);

    this.mediaStateService.loadAll().subscribe({
      next: () => {
        this.syncLocalState();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les données.';
        this.isLoading = false;
      }
    });

    this.mediaStateService.media$.pipe(takeUntil(this.destroy$)).subscribe(media => {
      this.mediaItems = media;
      this.images = [...this.getHeroFramesImages(), ...this.transformMedia(media)];
      this.updateImageCache();
    });

    this.mediaStateService.albums$.pipe(takeUntil(this.destroy$)).subscribe(albums => {
      this.albums = [this.getHeroFramesAlbum(), ...albums.map(a => this.mapAlbum(a))];
    });

    this.mediaStateService.categories$.pipe(takeUntil(this.destroy$)).subscribe(categories => {
      this.categories = categories;
    });

    this.route.paramMap.subscribe(params => {
      const albumId = params.get('albumId');
      if (albumId) {
        const id = Number(albumId);
        if (!isNaN(id)) {
          this.selectedAlbumId = id;
          this.currentAlbumId = id;
        }
      } else {
        this.currentAlbumId = null;
      }
      this.updateImageCache();
    });

    this.loadSectionPages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.closeDropdown);
    }
  }

  loadSectionPages(): void {
    this.contentService.getSectionPages().subscribe({
      next: (pages) => {
        this.sectionPages = pages;
      },
      error: () => {
        this.sectionPages = [];
      }
    });
  }

  selectSectionPage(page: ContentSectionPage | null): void {
    this.selectedSectionPageId = page?.id ?? null;
    this.sectionTextForm = {
      title: page?.title ?? '',
      description: page?.description ?? '',
      content: page?.content ?? ''
    };
  }

  saveSectionText(): void {
    if (!this.sectionTextForm.title) {
      this.showToastMessage('Le titre est requis', 'error');
      return;
    }

    this.isSectionTextSubmitting = true;
    const payload: any = {
      title: this.sectionTextForm.title,
      description: this.sectionTextForm.description || null,
      content: this.sectionTextForm.content || null
    };

    if (this.selectedSectionPageId) {
      this.apiService.updateSectionPage(this.selectedSectionPageId, payload).subscribe({
        next: () => {
          this.loadSectionPages();
          this.selectSectionPage(null);
          this.showToastMessage('Texte modifié avec succès', 'success');
          this.isSectionTextSubmitting = false;
        },
        error: () => {
          this.showToastMessage('Erreur lors de la modification', 'error');
          this.isSectionTextSubmitting = false;
        }
      });
    }
  }

  deleteSectionPage(page: ContentSectionPage): void {
    if (!confirm('Supprimer ce texte de section ?')) return;
    this.apiService.deleteSectionPage(page.id).subscribe({
      next: () => {
        this.loadSectionPages();
        if (this.selectedSectionPageId === page.id) {
          this.selectSectionPage(null);
        }
        this.showToastMessage('Texte supprimé avec succès', 'success');
      },
      error: () => {
        this.showToastMessage('Erreur lors de la suppression', 'error');
      }
    });
  }

  getSectionTextCharCount(field: 'title' | 'description' | 'content'): number {
    return this.sectionTextForm[field]?.length ?? 0;
  }

  private syncLocalState(): void {
    this.mediaItems = this.mediaStateService.currentMedia;
    this.albums = [this.getHeroFramesAlbum(), ...this.mediaStateService.currentAlbums.map(a => this.mapAlbum(a))];
    this.categories = this.mediaStateService.currentCategories;
    this.images = [...this.getHeroFramesImages(), ...this.transformMedia(this.mediaStateService.currentMedia)];
    this.updateImageCache();
    this.isLoading = false;
  }

  private transformMedia(media: MediaItem[]): MediaItemLocal[] {
    return media.map((m: MediaItem) => {
      const absoluteImageUrl = this.getAbsoluteUrl(m.imageUrl);
      const absoluteVideoUrl = this.getAbsoluteUrl(m.videoUrl);
      return {
        id: m.id,
        title: m.title || 'Sans titre',
        category: m.albumName || 'Non classé',
        type: m.type === 'video' ? 'Vidéo' : 'Photo',
        url: absoluteImageUrl || absoluteVideoUrl || '',
        date: m.createdAt ? new Date(m.createdAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
        alt: m.title || '',
        description: m.description || '',
        keywords: m.tags || [],
        status: m.isPublished ? 'published' : 'draft',
        albumId: m.albumId || 0,
        albumName: m.albumName || 'Non classé',
        albums: (m as any).albums || []
      };
    });
  }

  private getHeroFramesAlbum(): AlbumLocal {
    return {
      id: -1,
      name: 'Hero Frames',
      cover: '/assets/images/hero-frames/frame_001.jpg',
      category: 'Hero',
      photosCount: 192,
      status: 'published',
      description: 'Images par défaut pour le hero 1',
      coverUrl: '/assets/images/hero-frames/frame_001.jpg',
      mediaIds: [],
      categoryId: 0,
      page: 'home',
      section: 'hero'
    };
  }

  private mapAlbum(a: any): AlbumLocal {
    return {
      id: a.id,
      name: a.title || 'Sans titre',
      cover: a.coverUrl || DEFAULT_ALBUM_COVER,
      category: a.category?.name || 'Non classé',
      photosCount: (a.mediaIds || []).length,
      status: a.isPublished ? 'published' : 'draft',
      description: a.description || '',
      coverUrl: a.coverUrl || '',
      mediaIds: a.mediaIds || [],
      categoryId: a.categoryId,
      page: a.page || '',
      section: a.section || ''
    };
  }

  private getHeroFramesImages(): MediaItemLocal[] {
    const images: MediaItemLocal[] = [];
    for (let i = 1; i <= 192; i++) {
      const padded = String(i).padStart(4, '0');
      images.push({
        id: -i,
        title: `Hero Frame ${padded}`,
        category: 'Hero',
        type: 'Photo',
        url: `/assets/images/hero-frames/frame_${padded}.jpg`,
        date: new Date().toLocaleDateString('fr-FR'),
        alt: `Hero Frame ${padded}`,
        description: '',
        keywords: [],
        status: 'published',
        albumId: -1,
        albumName: 'Hero Frames',
        albums: [{ id: -1, name: 'Hero Frames' }]
      });
    }
    return images;
  }

  private getAbsoluteUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
     if (url.startsWith('//')) return (environment.apiUrl.startsWith('https') ? 'https:' : 'http:') + url;
    if (url.startsWith('/')) return environment.apiUrl.replace('/api', '') + url;
    return environment.apiUrl.replace('/api', '') + '/' + url;
  }

  get filteredImages(): MediaItemLocal[] {
    return this.cachedFilteredImages;
  }

  get albumImages(): MediaItemLocal[] {
    if (this.selectedAlbumId === null) return [];
    return this.images.filter(img => img.albums.some(a => a.id === this.selectedAlbumId));
  }

  setAlbumMediaTypeFilter(filter: 'all' | 'image' | 'video'): void {
    this.albumMediaTypeFilter = filter;
    this.currentPage = 1;
    this.updateImageCache();
  }

  get filteredAlbums(): AlbumLocal[] {
    if (this.currentFilter === 'all') return this.albums;
    return this.albums.filter(album => album.name === this.currentFilter);
  }

  get albumsCount(): number {
    return this.albums.length;
  }

  get pagedImages(): MediaItemLocal[] {
    return this.cachedPagedImages;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.cachedFilteredImages.length / this.pageSize));
  }

  get selectedAlbum(): AlbumLocal | undefined {
    return this.albums.find(album => album.id === this.selectedAlbumId);
  }

  private updateImageCache(): void {
    let result = this.images;
    if (this.selectedAlbumId !== null) {
      result = result.filter(img => img.albums.some(a => a.id === this.selectedAlbumId));
    }
    if (this.currentFilter !== 'all') {
      result = result.filter(img => img.albumName === this.currentFilter);
    }
    if (this.selectedAlbumId !== null && this.albumMediaTypeFilter !== 'all') {
      result = result.filter(img => {
        if (this.albumMediaTypeFilter === 'image') return img.type === 'Photo';
        if (this.albumMediaTypeFilter === 'video') return img.type === 'Vidéo';
        return true;
      });
    }
    this.cachedFilteredImages = result;
    const start = (this.currentPage - 1) * this.pageSize;
    this.cachedPagedImages = result.slice(start, start + this.pageSize);
  }

  getAlbumLocation(album: AlbumLocal): string {
    if (!album.page) return '';
    return album.section ? `${album.page} / ${album.section}` : album.page;
  }

  carouselPages() {
    return CAROUSEL_PAGES;
  }

  carouselSections(page: string) {
    return CAROUSEL_SECTIONS[page] || [];
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.updateImageCache();
  }

  selectAlbum(albumId: number): void {
    this.selectedAlbumId = albumId;
    this.currentPage = 1;
    this.updateImageCache();
    this.router.navigate(['/admin/media-library', 'album', albumId]);
  }

  clearAlbumSelection(): void {
    this.selectedAlbumId = null;
    this.currentAlbumId = null;
    this.currentFilter = 'all';
    this.albumMediaTypeFilter = 'all';
    this.currentPage = 1;
    this.updateImageCache();
    this.router.navigate(['/admin/media-library']);
  }

  setPageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateImageCache();
  }

  goToPage(page: number): void {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
  }

  deleteImage(id: number): void {
    this.deleteConfirmType = 'media';
    this.deleteConfirmId = id;
    this.showDeleteConfirm = true;
  }

  togglePublishMedia(id: number): void {
    const media = this.mediaStateService.currentMedia.find(m => m.id === id);
    if (!media) return;
    const newStatus = !media.isPublished;
    this.apiService.updateMedia(id, { isPublished: newStatus }).subscribe({
      next: () => {
        this.mediaStateService.updateMedia(id, { isPublished: newStatus });
        this.showToastMessage(newStatus ? 'Média publié' : 'Média mis en brouillon', 'success');
      },
      error: () => this.showToastMessage('Erreur lors de la mise à jour du statut', 'error')
    });
  }

  toggleMediaSelection(id: number): void {
    if (this.selectedMediaIds.has(id)) {
      this.selectedMediaIds.delete(id);
    } else {
      this.selectedMediaIds.add(id);
    }
  }

  toggleSelectionMode(): void {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.selectedMediaIds.clear();
    }
  }

  deleteSelectedMedia(): void {
    if (this.selectedMediaIds.size === 0) return;

    const idsToDelete = Array.from(this.selectedMediaIds);
    this.isDeleteSubmitting = true;
    this.deleteConfirmType = 'media';
    this.showDeleteConfirm = true;

    const deleteRequests = idsToDelete.map(id =>
      this.apiService.deleteMedia(id)
    );

    forkJoin(deleteRequests).subscribe({
      next: () => {
        idsToDelete.forEach(id => this.mediaStateService.removeMedia(id));
        this.selectedMediaIds.clear();
        this.isSelectionMode = false;
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
        this.showToast = true;
        this.toastMessage = `${idsToDelete.length} média(s) supprimé(s)`;
        this.toastType = 'success';
        this.closeDeleteConfirm();
      },
      error: () => {
        this.showToast = true;
        this.toastMessage = 'Erreur lors de la suppression';
        this.toastType = 'error';
        this.isDeleteSubmitting = false;
      }
    });
  }

  confirmDelete(): void {
    if (this.deleteConfirmId === null) return;

    if (this.deleteConfirmType === 'media' && this.selectedMediaIds.size > 1) {
      this.deleteSelectedMedia();
      return;
    }

    const id = this.deleteConfirmId;
    this.isDeleteSubmitting = true;

    if (this.deleteConfirmType === 'media') {
      this.apiService.deleteMedia(id).subscribe({
        next: () => {
          this.mediaStateService.removeMedia(id!);
          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
          }
          this.showToast = true;
          this.toastMessage = 'Média supprimé avec succès';
          this.toastType = 'success';
          this.closeDeleteConfirm();
        },
        error: (err) => {
          this.showToast = true;
          this.toastMessage = 'Erreur lors de la suppression';
          this.toastType = 'error';
          this.isDeleteSubmitting = false;
        }
      });
    } else {
      this.apiService.deleteAlbum(id).subscribe({
        next: () => {
          this.mediaStateService.removeAlbum(id!);
          if (this.selectedAlbumId === id) {
            this.selectedAlbumId = null;
            this.updateImageCache();
          }
          this.showToast = true;
          this.toastMessage = 'Album supprimé avec succès';
          this.toastType = 'success';
          this.closeDeleteConfirm();
        },
        error: (err) => {
          this.showToast = true;
          this.toastMessage = 'Erreur lors de la suppression';
          this.toastType = 'error';
          this.isDeleteSubmitting = false;
        }
      });
    }
  }

  closeDeleteConfirm(): void {
    this.showDeleteConfirm = false;
    this.isDeleteSubmitting = false;
    this.deleteConfirmId = null;
  }

  deleteAlbum(id: number | undefined): void {
    if (id === undefined) return;
    this.deleteConfirmType = 'album';
    this.deleteConfirmId = id;
    this.showDeleteConfirm = true;
  }

  togglePublishAlbum(id: number | undefined): void {
    if (id === undefined) return;
    const album = this.mediaStateService.currentAlbums.find(a => a.id === id);
    if (!album) return;
    const newStatus = !album.isPublished;
    this.apiService.updateAlbum(id, { isPublished: newStatus }).subscribe({
      next: () => {
        this.mediaStateService.updateAlbum(id, { isPublished: newStatus });
        this.showToastMessage(newStatus ? 'Album publié' : 'Album mis en brouillon', 'success');
      },
      error: () => this.showToastMessage('Erreur lors de la mise à jour du statut', 'error')
    });
  }

  showToastMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.toastProgress = 100;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    const startTime = Date.now();
    const duration = 1000;
    const animateProgress = () => {
      const elapsed = Date.now() - startTime;
      this.toastProgress = Math.max(0, 100 - (elapsed / duration) * 100);
      if (elapsed < duration) {
        requestAnimationFrame(animateProgress);
      }
    };
    requestAnimationFrame(animateProgress);
    this.toastTimer = setTimeout(() => {
      this.showToast = false;
    }, duration);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown = (): void => {
    this.isDropdownOpen = false;
  };

  openAddModal(): void {
    this.editingAlbumId = null;
    this.newAlbum = {
      title: '',
      description: '',
      coverUrl: '',
      mediaIds: [],
      categoryId: this.categories.length > 0 ? this.categories[0].id : 0,
      page: '',
      section: ''
    };
    this.coverSource = 'url';
    this.coverFile = null;
    this.coverPreview = null;
    this.showAddModal = true;
  }

  openEditAlbumModal(album: AlbumLocal): void {
    this.editingAlbumId = album.id ?? null;
    this.newAlbum = {
      title: album.name || '',
      description: album.description || '',
      coverUrl: album.coverUrl || album.cover || '',
      mediaIds: album.mediaIds || [],
      categoryId: album.categoryId || 0,
      page: album.page || '',
      section: album.section || ''
    };
    this.coverFile = null;
    this.coverPreview = album.cover || null;
    this.coverSource = (album.coverUrl || album.cover) ? 'url' : 'file';
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.isSubmitting = false;
    this.editingAlbumId = null;
  }

  onMediaChange(mediaId: number): void {
    const media = this.mediaItems.find(m => m.id === mediaId);
    if (media && media.imageUrl) {
      this.newAlbum.coverUrl = media.imageUrl;
    }
  }

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.coverFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreview = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.apiService.uploadAlbumCover(file).subscribe({
      next: (res) => {
        this.newAlbum.coverUrl = res.url;
      },
      error: (err) => {
        alert('Erreur lors de l\'upload de l\'image: ' + (err.error?.message || err.message));
        this.coverFile = null;
        this.coverPreview = null;
      }
    });
  }

  submitAlbum(): void {
    if (!this.newAlbum.title) {
      this.showToastMessage('Le titre est requis', 'error');
      return;
    }
    if (!this.newAlbum.categoryId) {
      this.showToastMessage('Veuillez sélectionner une catégorie', 'error');
      return;
    }

    this.isSubmitting = true;
    const payload: any = {
      title: this.newAlbum.title,
      description: this.newAlbum.description || null,
      coverUrl: this.newAlbum.coverUrl || null,
      mediaIds: this.newAlbum.mediaIds || [],
      categoryId: this.newAlbum.categoryId || null,
      page: this.newAlbum.page || null,
      section: this.newAlbum.section || null,
      mediaUrls: this.newAlbum.mediaUrls || []
    };

    if (this.editingAlbumId) {
      this.apiService.updateAlbum(this.editingAlbumId!, payload).subscribe({
        next: (updated) => {
          this.mediaStateService.loadAll().subscribe();
          this.closeAddModal();
          this.showToastMessage('Album modifié avec succès', 'success');
        },
        error: (err) => {
          this.showToastMessage('Erreur lors de la modification', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      this.apiService.createAlbum(payload).subscribe({
        next: (createdAlbum) => {
          this.mediaStateService.loadAll().subscribe();
          this.closeAddModal();
          this.showToastMessage('Album créé avec succès', 'success');
        },
        error: (err) => {
          this.showToastMessage('Erreur lors de la création', 'error');
          this.isSubmitting = false;
        }
      });
    }
  }

  openCreateMediaModal(): void {
    this.isEditingMedia = false;
    this.editingMediaId = null;
    this.mediaForm = {
      title: '',
      slug: '',
      description: '',
      type: 'image',
      imageUrl: '',
      videoUrl: '',
      tags: [],
      isPublished: false,
      isFeatured: false
    };
    this.tagsInput = '';
    this.mediaFiles = [];
    this.mediaPreviews = [];
    this.mediaSource = 'url';
    this.showMediaModal = true;
  }

  openEditMediaModal(media: MediaItem): void {
    this.isEditingMedia = true;
    this.editingMediaId = media.id;
    this.mediaForm = {
      title: media.title || '',
      slug: media.slug || '',
      description: media.description || '',
      type: media.type || 'image',
      imageUrl: media.imageUrl || '',
      videoUrl: media.videoUrl || '',
      tags: media.tags || [],
      isPublished: media.isPublished,
      isFeatured: media.isFeatured
    };
    this.tagsInput = (media.tags || []).join(', ');
    this.showMediaModal = true;
  }

  openEditMediaModalById(id: number | undefined): void {
    if (id === undefined) return;
    const media = this.mediaItems.find(m => m.id === id);
    if (media) {
      this.openEditMediaModal(media);
    }
  }

  updateTagsFromInput(): void {
    this.mediaForm.tags = this.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);
  }

  onMediaFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    const remaining = 10 - this.mediaFiles.length;
    const toAdd = files.slice(0, Math.max(0, remaining));

    if (toAdd.length < files.length) {
      this.showToastMessage(`Vous ne pouvez ajouter que ${remaining} fichier(s) supplémentaire(s)`, 'error');
    }

    for (const file of toAdd) {
      const reader = new FileReader();
      reader.onload = () => {
        this.mediaPreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    this.mediaFiles.push(...toAdd);
  }

  onMediaTypeChange(): void {
    this.mediaFiles = [];
    this.mediaPreviews = [];
  }

  removeMediaFile(index: number): void {
    this.mediaFiles.splice(index, 1);
    this.mediaPreviews.splice(index, 1);
  }

  isImageFile(file: File): boolean {
    return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
  }

  isVideoFile(file: File): boolean {
    return ['video/mp4', 'video/avi', 'video/x-msvideo'].includes(file.type);
  }

  uploadMediaFile(file: File): Observable<{url: string; type: string}> {
    return this.apiService.uploadMedia(file).pipe(
      map(res => ({ url: res.url, type: res.type }))
    );
  }

  closeMediaModal(): void {
    this.showMediaModal = false;
    this.isMediaSubmitting = false;
    this.mediaFiles = [];
    this.mediaPreviews = [];
  }

  openLightbox(id: number): void {
    const media = this.images.find(img => img.id === id);
    if (!media) return;
    this.previewIndex = this.filteredImages.findIndex(img => img.id === id);
    this.previewMedia = {
      url: media.url,
      type: media.type === 'Vidéo' ? 'video' : 'image',
      title: media.title
    };
    this.showPreview = true;
  }

  navigatePreview(direction: number): void {
    const items = this.filteredImages;
    if (!items.length) return;
    this.previewIndex = (this.previewIndex + direction + items.length) % items.length;
    const media = items[this.previewIndex];
    this.previewMedia = {
      url: media.url,
      type: media.type === 'Vidéo' ? 'video' : 'image',
      title: media.title
    };
  }

  closePreview(): void {
    this.showPreview = false;
    this.previewMedia = null;
    this.previewIndex = -1;
  }

  onGalleryItemClick(img: MediaItemLocal): void {
    if (this.isSelectionMode && this.selectedMediaIds.has(img.id!)) {
      this.openMediaActions(img);
    }
  }

  onDragStart(id: number, event: DragEvent): void {
    this.draggedMediaId = id;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', String(id));
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDragEnter(targetId: number): void {
    if (this.draggedMediaId !== null && this.draggedMediaId !== targetId) {
      this.dragOverMediaId = targetId;
    }
  }

  onDragLeave(): void {
    this.dragOverMediaId = null;
  }

  onDrop(targetId: number): void {
    this.dragOverMediaId = null;
    if (this.draggedMediaId === null || this.draggedMediaId === targetId) {
      this.draggedMediaId = null;
      return;
    }

    const draggedIndex = this.images.findIndex(img => img.id === this.draggedMediaId);
    const targetIndex = this.images.findIndex(img => img.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      this.draggedMediaId = null;
      return;
    }

    const item = this.images[draggedIndex];
    const updatedImages = [...this.images];
    updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(targetIndex, 0, item);

    this.images = updatedImages;
    this.updateImageCache();
    this.draggedMediaId = null;
  }

  openMediaActions(img: MediaItemLocal): void {
    this.selectedMedia = { id: img.id!, title: img.title };
    this.showMediaActions = true;
  }

  closeMediaActions(): void {
    this.showMediaActions = false;
    this.selectedMedia = null;
  }

  linkMediaToAlbum(mediaId: number): void {
    if (this.currentAlbumId) {
      this.apiService.addMediaToAlbum(this.currentAlbumId, mediaId).subscribe({
        next: () => this.mediaStateService.loadAll().subscribe(),
        error: () => console.warn('Failed to link media to album')
      });
    }
  }

  submitMediaForm(): void {
    if (!this.mediaForm.title && this.mediaFiles.length === 0) {
      this.showToastMessage('Le titre ou des fichiers sont requis', 'error');
      return;
    }
    if (!this.mediaForm.type) {
      this.showToastMessage('Le type est requis', 'error');
      return;
    }

    if (this.mediaFiles.length > 0) {
      const invalidFile = this.mediaFiles.find(file => {
        if (this.mediaForm.type === 'image') return !this.isImageFile(file);
        if (this.mediaForm.type === 'video') return !this.isVideoFile(file);
        return false;
      });

      if (invalidFile) {
        this.showToastMessage(`Type de fichier invalide. Pour ${this.mediaForm.type === 'image' ? 'images' : 'vidéos'}: ${this.mediaForm.type === 'image' ? 'jpeg, jpg, png, webp, gif' : 'mp4, avi'}`, 'error');
        return;
      }
    }

    this.isMediaSubmitting = true;

    if (this.isEditingMedia && this.editingMediaId) {
      const payload = {
        title: this.mediaForm.title,
        slug: this.mediaForm.slug || this.mediaForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: this.mediaForm.description || null,
        type: this.mediaForm.type,
        imageUrl: this.mediaForm.imageUrl || null,
        videoUrl: this.mediaForm.videoUrl || null,
        tags: this.mediaForm.tags,
        isPublished: this.mediaForm.isPublished,
        isFeatured: this.mediaForm.isFeatured
      };

      this.apiService.updateMedia(this.editingMediaId, payload).subscribe({
        next: () => {
          this.mediaStateService.loadAll().subscribe();
          this.closeMediaModal();
          this.showToastMessage('Média modifié avec succès', 'success');
        },
        error: (err) => {
          this.showToastMessage('Erreur lors de la modification', 'error');
          this.isMediaSubmitting = false;
        }
      });
      return;
    }

    const createMediaFromUpload = (index: number, uploadedUrls: {url: string; type: string}[]) => {
      if (index >= uploadedUrls.length) {
        this.mediaStateService.loadAll().subscribe();
        this.closeMediaModal();
        this.showToastMessage(`${uploadedUrls.length} média(s) créé(s) avec succès`, 'success');
        return;
      }

      const upload = uploadedUrls[index];
      const payload = {
        title: this.mediaForm.title || `Media ${index + 1}`,
        slug: this.mediaForm.slug || this.mediaForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `media-${Date.now()}-${index}`,
        description: this.mediaForm.description || null,
        type: upload.type,
        imageUrl: upload.type === 'image' ? upload.url : null,
        videoUrl: upload.type === 'video' ? upload.url : null,
        tags: this.mediaForm.tags,
        isPublished: this.mediaForm.isPublished,
        isFeatured: this.mediaForm.isFeatured
      };

      this.apiService.createMedia(payload).pipe(
        switchMap((res) => {
          if (this.currentAlbumId && res?.id) {
            return this.apiService.addMediaToAlbum(this.currentAlbumId, res.id).pipe(
              map(() => res),
              catchError(() => of(res))
            );
          }
          return of(res);
        })
      ).subscribe({
        next: () => createMediaFromUpload(index + 1, uploadedUrls),
        error: () => {
          this.showToastMessage(`Erreur lors de la création du média ${index + 1}`, 'error');
          this.isMediaSubmitting = false;
        }
      });
    };

    if (this.mediaFiles.length > 0) {
      const uploadPromises = this.mediaFiles.map(file => this.uploadMediaFile(file));
      let uploadedUrls: {url: string; type: string}[] = [];

      forkJoin(uploadPromises).subscribe({
        next: (results) => {
          uploadedUrls = results;
          createMediaFromUpload(0, uploadedUrls);
        },
        error: (err) => {
          this.showToastMessage('Erreur lors de l\'upload des fichiers', 'error');
          this.isMediaSubmitting = false;
        }
      });
    } else {
      const payload = {
        title: this.mediaForm.title,
        slug: this.mediaForm.slug || this.mediaForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        description: this.mediaForm.description || null,
        type: this.mediaForm.type,
        imageUrl: this.mediaForm.imageUrl || null,
        videoUrl: this.mediaForm.videoUrl || null,
        tags: this.mediaForm.tags,
        isPublished: this.mediaForm.isPublished,
        isFeatured: this.mediaForm.isFeatured
      };

      this.apiService.createMedia(payload).pipe(
        switchMap((res) => {
          if (this.currentAlbumId && res?.id) {
            return this.apiService.addMediaToAlbum(this.currentAlbumId, res.id).pipe(
              map(() => res),
              catchError(() => of(res))
            );
          }
          return of(res);
        })
      ).subscribe({
        next: (res) => {
          this.mediaStateService.loadAll().subscribe();
          this.closeMediaModal();
          this.showToastMessage('Média créé avec succès', 'success');
        },
        error: (err) => {
          this.showToastMessage('Erreur lors de la création', 'error');
          this.isMediaSubmitting = false;
        }
      });
    }
  }
}
