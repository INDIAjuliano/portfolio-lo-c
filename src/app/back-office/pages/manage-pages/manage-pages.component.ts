import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { forkJoin, switchMap, of } from 'rxjs';

interface Album {
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

@Component({
  selector: 'app-manage-pages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-pages.component.html',
  styleUrls: ['./manage-pages.component.css']
})
export class ManagePagesComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  albums: Album[] = [];
  mediaItems: any[] = [];
  categories: any[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  selectedAlbumId: number | null = null;
  selectedAlbum: Album | null = null;
  albumImages: any[] = [];
  editingAlbumId: number | null = null;
  isSubmitting = false;
  showAddModal = false;
  coverSource: 'url' | 'file' = 'url';
  coverFile: File | null = null;
  coverPreview: string | null = null;
  selectedPage = 'home';
  selectedSection = '';

  setSelectedPage(page: string): void {
    this.selectedPage = page;
    this.selectedSection = this.sections[page]?.[0]?.value || '';
  }

  pageMediaFiles: File[] = [];
  pageMediaPreviews: string[] = [];
  pageFiles: {name: string; label: string; uploadDir: string; files: string[]}[] = [];
  isLoadingPageFiles = false;

  viewMode: 'grid' | 'list' | 'carousel' | 'cover' = 'carousel';
  coverImages: Record<string, string> = {};
  coverImageKey = '';
  coverImageFile: File | null = null;
  coverImagePreview: string | null = null;
  coverImageSource: 'url' | 'file' = 'url';

  showImageModal = false;
  isEditingImage = false;
  editingImageId: number | null = null;
  imageForm: any = {
    title: '',
    description: '',
    type: 'image',
    imageUrl: '',
    videoUrl: '',
    tags: [],
    isPublished: false,
    isFeatured: false
  };
  imageFiles: File[] = [];
  imagePreviews: string[] = [];
  imageSource: 'url' | 'file' = 'url';
  tagsInput = '';

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  showToast = false;
  toastProgress = 100;
  toastTimer: any = null;

  newAlbum: any = {
    title: '',
    description: '',
    coverUrl: '',
    mediaIds: [],
    categoryId: 0,
    page: '',
    section: '',
    mediaUrls: []
  };

  readonly DEFAULT_ALBUM_COVER = 'https://images.pexels.com/photos/10965788/pexels-photo-10965788.jpeg';

  readonly pages = [
    { value: 'home', label: 'Home' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'about', label: 'About' },
    { value: 'contact', label: 'Contact' }
  ];

  readonly sections: Record<string, { value: string; label: string }[]> = {
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
      { value: 'hero', label: 'Hero' },
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

  private readonly HERO_FRAMES_ALBUM_ID = -1;
  private readonly HERO_FRAMES_PATH = '/assets/images/hero-frames';

  ngOnInit(): void {
    if (typeof document === 'undefined') return;
    if (!this.authService.isAuthenticated()) {
      return;
    }
    this.selectedSection = this.sections[this.selectedPage]?.[0]?.value || '';
    this.loadDataFromApi();
    this.loadPageFiles();
    this.loadCoverImages();
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', () => {});
    }
  }

  loadDataFromApi(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.apiService.getAlbums().subscribe({
      next: (albums) => {
        this.albums = albums.map((a: any) => this.mapAlbum(a));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load albums', err);
        this.errorMessage = 'Impossible de charger les albums.';
        this.isLoading = false;
      }
    });

    this.apiService.getMedia().subscribe({
      next: (media) => {
        this.mediaItems = media;
      },
      error: (err) => console.error('Failed to load media', err)
    });

    this.apiService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => console.error('Failed to load categories', err)
    });
  }

  private mapAlbum(a: any): Album {
    return {
      id: a.id,
      name: a.title || 'Sans titre',
      cover: this.getAbsoluteUrl(a.coverUrl || a.coverMedia?.imageUrl || a.coverMedia?.videoUrl || this.DEFAULT_ALBUM_COVER),
      category: a.category?.name || 'Non classé',
      photosCount: (a.mediaIds || []).length,
      status: a.isPublished ? 'published' : 'draft',
      description: a.description || '',
      coverUrl: this.getAbsoluteUrl(a.coverUrl || ''),
      mediaIds: a.mediaIds || [],
      categoryId: a.categoryId,
      page: a.page || '',
      section: a.section || ''
    };
  }

  private getAbsoluteUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
     if (url.startsWith('//')) return (environment.apiUrl.startsWith('https') ? 'https:' : 'http:') + url;
    return environment.apiUrl.replace('/api', '') + url;
  }

  get selectedAlbumName(): string {
    return this.selectedAlbum?.name || '';
  }

  get selectedAlbumPhotosCount(): number {
    return this.selectedAlbum?.photosCount || 0;
  }

  get currentCoverImage(): string {
    return this.coverImages[this.coverImageKey] || '';
  }

  updateCoverImageKey(): void {
    this.coverImageKey = `cover-image-${this.selectedPage}-${this.selectedSection}`;
    this.coverImageFile = null;
    this.coverImagePreview = this.currentCoverImage || null;
    if (!this.coverImagePreview) {
      this.coverImageSource = 'url';
    }
  }

  getCurrentSection(): string {
    return this.sections[this.selectedPage]?.[0]?.value || '';
  }

  private loadCoverImages(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('coverImages');
        this.coverImages = raw ? JSON.parse(raw) : {};
      } catch {
        this.coverImages = {};
      }
    }
    this.updateCoverImageKey();
  }

  private persistCoverImages(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('coverImages', JSON.stringify(this.coverImages));
    }
  }

  onCoverImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    this.coverImageFile = file;
    this.resizeImageFile(file, 1920, 1080).then((dataUrl) => {
      this.coverImagePreview = dataUrl;
      this.setCoverImagePreviewVisible();
    }).catch(() => {
      const reader = new FileReader();
      reader.onload = () => {
        this.coverImagePreview = reader.result as string;
        this.setCoverImagePreviewVisible();
      };
      reader.readAsDataURL(file);
    });
  }

  private setCoverImagePreviewVisible(): void {
    const el = document.getElementById('heroGalleryFallback');
    if (el) (el as HTMLElement).style.display = 'none';
  }

  private resizeImageFile(file: File, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas context error')); return; }

        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type || 'image/jpeg';
        const quality = mimeType === 'image/png' ? 1.0 : 0.85;
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Image load error'));
      };
      img.src = objectUrl;
    });
  }

  saveCoverImage(): void {
    if (!this.coverImagePreview) return;
    this.coverImages[this.coverImageKey] = this.coverImagePreview;
    try {
      this.persistCoverImages();
      this.showToastMessage('Image de couverture enregistrée', 'success');
    } catch (e) {
      console.error('Failed to save cover image to localStorage:', e);
      delete this.coverImages[this.coverImageKey];
      this.showToastMessage('Image trop volumineuse. Utilisez une URL ou une image plus petite.', 'error');
    }
  }

  removeCoverImage(): void {
    delete this.coverImages[this.coverImageKey];
    this.coverImageFile = null;
    this.coverImagePreview = null;
    this.persistCoverImages();
    this.showToastMessage('Image de couverture supprimée', 'success');
  }

  setViewMode(mode: 'grid' | 'list' | 'carousel' | 'cover'): void {
    this.viewMode = mode;
    if (mode === 'cover') {
      this.updateCoverImageKey();
    }
  }

  isViewModeActive(mode: 'grid' | 'list' | 'carousel' | 'cover'): boolean {
    return this.viewMode === mode;
  }

  isCoverModeActive(): boolean {
    return this.viewMode === 'cover';
  }

  getAlbumLocation(album: Album): string {
    if (!album.page) return '';
    return album.section ? `${album.page} / ${album.section}` : album.page;
  }

  getAlbumsByPage(page: string): Album[] {
    return this.albums.filter(a => a.page === page);
  }

  getPageSectionAlbums(page: string, section: string): Album[] {
    const apiAlbums = this.albums.filter(a => {
      if (a.page !== page) return false;
      if (section === 'main') {
        return !a.section;
      }
      return a.section === section;
    });

    if (page === 'home' && section === 'hero') {
      const hasHeroFrames = apiAlbums.some(a => a.id === this.HERO_FRAMES_ALBUM_ID);
      if (!hasHeroFrames) {
        const heroFramesAlbum = this.getHeroFramesAlbum();
        return [heroFramesAlbum, ...apiAlbums];
      }
    }

    return apiAlbums;
  }

  isAlbumDetailVisible(page: string, section: string): boolean {
    if (!this.selectedAlbum) return false;
    const albums = this.getPageSectionAlbums(page, section);
    return albums.some(a => a.id === this.selectedAlbum!.id);
  }

  getSectionsForPage(page: string): { value: string; label: string }[] {
    return this.sections[page] || [];
  }

  openCreateModal(pageValue: string, sectionValue: string): void {
    this.editingAlbumId = null;
    this.newAlbum = {
      title: '',
      description: '',
      coverUrl: '',
      mediaIds: [],
      categoryId: this.categories.length > 0 ? this.categories[0].id : 0,
      page: pageValue,
      section: sectionValue,
      mediaUrls: []
    };
    this.coverSource = 'url';
    this.coverFile = null;
    this.coverPreview = null;
    this.showAddModal = true;
  }

  openEditModal(album: Album): void {
    this.editingAlbumId = album.id ?? null;
    this.newAlbum = {
      title: album.name || '',
      description: album.description || '',
      coverUrl: album.coverUrl || album.cover || '',
      mediaIds: album.mediaIds || [],
      categoryId: album.categoryId || 0,
      page: album.page || '',
      section: album.section || '',
      mediaUrls: album.mediaUrls || []
    };
    this.coverFile = null;
    this.coverPreview = album.cover || null;
    this.coverSource = (album.coverUrl || album.cover) ? 'url' : 'file';
    this.showAddModal = true;
  }

  closeModal(): void {
    this.showAddModal = false;
    this.isSubmitting = false;
    this.editingAlbumId = null;
  }

  selectAlbum(album: Album): void {
    this.selectedAlbum = album;
    this.loadAlbumImages(album.id);
  }

  closeAlbumDetail(): void {
    this.selectedAlbum = null;
    this.albumImages = [];
  }

  private getHeroFramesAlbum(): Album {
    return {
      id: this.HERO_FRAMES_ALBUM_ID,
      name: 'Hero Frames',
      cover: `${this.HERO_FRAMES_PATH}/frame_001.jpg`,
      category: 'Hero',
      photosCount: 192,
      status: 'published',
      description: 'Images par défaut pour le hero 1',
      coverUrl: `${this.HERO_FRAMES_PATH}/frame_001.jpg`,
      mediaIds: [],
      categoryId: 0,
      page: 'home',
      section: 'hero'
    };
  }

  private getHeroFramesImages(): any[] {
    const images: any[] = [];
    for (let i = 1; i <= 192; i++) {
      const padded = String(i).padStart(4, '0');
      images.push({
        id: -i,
        title: `Hero Frame ${padded}`,
        description: '',
        type: 'image',
        imageUrl: `${this.HERO_FRAMES_PATH}/frame_${padded}.jpg`,
        videoUrl: null,
        tags: [],
        isPublished: true,
        isFeatured: false,
        thumbnailUrl: `${this.HERO_FRAMES_PATH}/frame_${padded}.jpg`
      });
    }
    return images;
  }

  loadAlbumImages(albumId: number): void {
    if (albumId === this.HERO_FRAMES_ALBUM_ID) {
      this.albumImages = this.getHeroFramesImages();
      return;
    }

    this.apiService.getMedia().subscribe({
      next: (media: any[]) => {
        const allMedia = media;
        this.apiService.getAlbums().subscribe({
          next: (albums: any[]) => {
            const album = albums.find(a => a.id === albumId);
            const mediaIds = album?.mediaIds || [];
            this.albumImages = allMedia
              .filter((m: any) => mediaIds.includes(m.id))
              .map((m: any) => ({
                ...m,
                imageUrl: this.getAbsoluteUrl(m.imageUrl),
                thumbnailUrl: this.getAbsoluteUrl(m.thumbnailUrl),
                videoUrl: this.getAbsoluteUrl(m.videoUrl),
                embedUrl: this.getAbsoluteUrl(m.embedUrl)
              }));
          }
        });
      }
    });
  }

  openCreateImageModal(): void {
    this.isEditingImage = false;
    this.editingImageId = null;
    this.imageForm = {
      title: '',
      description: '',
      type: 'image',
      imageUrl: '',
      videoUrl: '',
      tags: [],
      isPublished: false,
      isFeatured: false
    };
    this.imageFiles = [];
    this.imagePreviews = [];
    this.imageSource = 'url';
    this.showImageModal = true;
  }

  openEditImageModal(image: any): void {
    this.isEditingImage = true;
    this.editingImageId = image.id;
    this.imageForm = {
      title: image.title || '',
      description: image.description || '',
      type: image.type || 'image',
      imageUrl: image.imageUrl || '',
      videoUrl: image.videoUrl || '',
      tags: image.tags || [],
      isPublished: image.isPublished,
      isFeatured: image.isFeatured
    };
    this.tagsInput = (image.tags || []).join(', ');
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.isEditingImage = false;
    this.editingImageId = null;
  }

  onImageFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    this.imageFiles = files;
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  submitImageForm(): void {
    if (!this.imageForm.title && this.imageFiles.length === 0) {
      alert('Le titre ou des fichiers sont requis');
      return;
    }
    if (!this.imageForm.type) {
      alert('Le type est requis');
      return;
    }

    this.isSubmitting = true;

    if (this.imageFiles.length > 0) {
      const uploadPromises = this.imageFiles.map(file => this.apiService.uploadMedia(file));
      forkJoin(uploadPromises).subscribe({
        next: (results) => {
          results.forEach((res) => {
            const payload = {
              title: this.imageForm.title || 'Image ' + Date.now(),
              type: res.type,
              imageUrl: res.type === 'image' ? res.url : null,
              videoUrl: res.type === 'video' ? res.url : null,
              description: this.imageForm.description || null,
              tags: this.imageForm.tags,
              isPublished: this.imageForm.isPublished,
              isFeatured: this.imageForm.isFeatured
            };
            this.apiService.createMedia(payload).pipe(
              switchMap((created) => {
                if (created?.id && this.selectedAlbum?.id) {
                  return this.apiService.addMediaToAlbum(this.selectedAlbum.id, created.id);
                }
                return of(null);
              })
            ).subscribe({
              next: () => {
                this.loadAlbumImages(this.selectedAlbum!.id);
                this.closeImageModal();
                this.showToastMessage('Image ajoutée avec succès', 'success');
              },
              error: () => {
                this.showToastMessage('Erreur lors de l\'ajout de l\'image', 'error');
                this.isSubmitting = false;
              }
            });
          });
        },
        error: () => {
          this.showToastMessage('Erreur lors de l\'upload', 'error');
          this.isSubmitting = false;
        }
      });
    } else {
      const payload = {
        title: this.imageForm.title,
        type: this.imageForm.type,
        imageUrl: this.imageForm.imageUrl || null,
        videoUrl: this.imageForm.videoUrl || null,
        description: this.imageForm.description || null,
        tags: this.imageForm.tags,
        isPublished: this.imageForm.isPublished,
        isFeatured: this.imageForm.isFeatured
      };

      this.apiService.createMedia(payload).pipe(
        switchMap((created) => {
          if (created?.id && this.selectedAlbum?.id) {
            return this.apiService.addMediaToAlbum(this.selectedAlbum.id, created.id);
          }
          return of(null);
        })
      ).subscribe({
        next: () => {
          this.loadAlbumImages(this.selectedAlbum!.id);
          this.closeImageModal();
          this.showToastMessage('Image créée avec succès', 'success');
        },
        error: () => {
          this.showToastMessage('Erreur lors de la création', 'error');
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteImage(image: any): void {
    if (!confirm(`Supprimer l'image "${image.title}" ?`)) return;
    this.apiService.deleteMedia(image.id).subscribe({
      next: () => {
        if (this.selectedAlbum?.id) {
          this.apiService.removeMediaFromAlbum(this.selectedAlbum.id, image.id).subscribe();
        }
        this.albumImages = this.albumImages.filter(img => img.id !== image.id);
        this.showToastMessage('Image supprimée avec succès', 'success');
      },
      error: () => {
        this.showToastMessage('Erreur lors de la suppression', 'error');
      }
    });
  }

  removeImageFromAlbum(image: any): void {
    if (!this.selectedAlbum?.id) return;
    this.apiService.removeMediaFromAlbum(this.selectedAlbum.id, image.id).subscribe({
      next: () => {
        this.albumImages = this.albumImages.filter(img => img.id !== image.id);
        this.showToastMessage('Image retirée de l\'album', 'success');
      },
      error: () => {
        this.showToastMessage('Erreur lors du retrait', 'error');
      }
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

  togglePublishAlbum(album: Album): void {
    const newStatus = album.status === 'published' ? 'draft' : 'published';
    this.apiService.updateAlbum(album.id, { isPublished: newStatus === 'published' }).subscribe({
      next: () => {
        album.status = newStatus;
      },
      error: () => alert('Erreur lors de la mise à jour')
    });
  }

  submitAlbum(): void {
    if (!this.newAlbum.title) {
      alert('Le titre est requis');
      return;
    }
    if (!this.newAlbum.categoryId) {
      alert('Veuillez sélectionner une catégorie');
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
      isPublished: true
    };

    if (this.editingAlbumId) {
      this.apiService.updateAlbum(this.editingAlbumId!, payload).subscribe({
        next: (updated) => {
          this.loadDataFromApi();
          this.closeModal();
        },
        error: () => {
          alert('Erreur lors de la modification');
          this.isSubmitting = false;
        }
      });
    } else {
      this.apiService.createAlbum(payload).subscribe({
        next: () => {
          this.loadDataFromApi();
          this.closeModal();
        },
        error: () => {
          alert('Erreur lors de la création');
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteAlbum(album: Album): void {
    if (!confirm(`Supprimer l'album "${album.name}" ?`)) return;
    this.apiService.deleteAlbum(album.id).subscribe({
      next: () => {
        this.albums = this.albums.filter(a => a.id !== album.id);
      },
      error: () => alert('Erreur lors de la suppression')
    });
  }

  togglePublish(album: Album): void {
    const newStatus = album.status === 'published' ? 'draft' : 'published';
    this.apiService.updateAlbum(album.id, { isPublished: newStatus === 'published' }).subscribe({
      next: () => {
        album.status = newStatus;
      },
      error: () => alert('Erreur lors de la mise à jour')
    });
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
      error: () => {
        alert('Erreur lors de l\'upload de l\'image');
        this.coverFile = null;
        this.coverPreview = null;
      }
    });
  }

  onPageMediaFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    this.pageMediaFiles = files;
    this.pageMediaPreviews = [];
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        this.pageMediaPreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPageMedia(): void {
    if (!this.selectedPage || this.pageMediaFiles.length === 0) {
      alert('Veuillez sélectionner une page et des fichiers');
      return;
    }

    this.isSubmitting = true;
    const uploadPromises = this.pageMediaFiles.map(file =>
      this.apiService.uploadMediaForPage(this.selectedPage, file)
    );

    forkJoin(uploadPromises).subscribe({
      next: (results) => {
        results.forEach((res) => {
          this.apiService.storeMediaUrl(res.url, res.page, res.type).subscribe({
            next: () => {
              this.loadPageFiles();
            },
            error: () => {
              console.error('Failed to store media URL', res.url);
            }
          });
        });
        this.pageMediaFiles = [];
        this.pageMediaPreviews = [];
        this.showToastMessage('Médias uploadés avec succès', 'success');
        this.isSubmitting = false;
      },
      error: () => {
        this.showToastMessage('Erreur lors de l\'upload des médias', 'error');
        this.isSubmitting = false;
      }
    });
  }

  loadPageFiles(): void {
    this.isLoadingPageFiles = true;
    this.apiService.listPages().subscribe({
      next: (pages) => {
        this.pageFiles = pages;
        this.isLoadingPageFiles = false;
      },
      error: () => {
        this.isLoadingPageFiles = false;
      }
    });
  }

  getPageFiles(page: string): string[] {
    const pageData = this.pageFiles.find(p => p.name === page);
    return pageData?.files || [];
  }

  trackByAlbumId(index: number, album: Album): number {
    return album.id;
  }
}
