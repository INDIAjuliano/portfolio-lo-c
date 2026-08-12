import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { IconComponent } from '../../icon/icon.component';
import { ContentService } from '../../../../core/services/content.service';
import { environment } from '../../../../../environments/environment';
import { HeroGalleryComponent } from './hero-gallery.component';
import { ScrollInfiniteDirective } from '../../../../shared/directives/scroll-infinite.directive';

const PAGE_SIZE = 20;

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  large: string;
  size: string;
  video?: string;
  width?: number;
  height?: number;
}

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [CommonModule, IconComponent, HeroGalleryComponent, ScrollInfiniteDirective],
  templateUrl: './gallery-section.component.html',
  styleUrls: ['./gallery-section.component.css']
})
export class GallerySectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('galleryGrid') galleryGrid!: ElementRef<HTMLDivElement>;

  galleryData: GalleryItem[] = [];
  categories: string[] = [];
  currentFilter = 'all';
  lightboxOpen = false;
  currentGalleryIndex = 0;
  currentFilteredItems: GalleryItem[] = [];
  isFullscreen = false;
  isLoading = true;
  hasMore = true;
  currentPage = 1;
  isLoadingMore = false;
  allGalleryData: GalleryItem[] = [];

  constructor(private contentService: ContentService) {}

  getFilteredItems(): GalleryItem[] {
    return this.currentFilter === 'all'
      ? this.galleryData
      : this.galleryData.filter(item => item.category === this.currentFilter);
  }

  get currentLightboxItem(): GalleryItem | undefined {
    return this.currentFilteredItems[this.currentGalleryIndex];
  }

  getItemLayoutClass(item: GalleryItem, index: number): string {
    return '';
  }

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    this.loadGallery();
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onHorizontalResize);
    }
  }

  loadGallery(): void {
    this.isLoading = true;
    this.currentPage = 1;
    this.hasMore = true;
    this.allGalleryData = [];
    this.galleryData = [];

    this.contentService.getPublicMediaPage(1, PAGE_SIZE).subscribe({
      next: (media: any[]) => {
        const mapped = media.map((m: any) => this.mapGalleryItem(m));
        this.allGalleryData = mapped;
        this.galleryData = mapped;
        this.categories = Array.from(new Set(this.galleryData.map(item => item.category))).sort();
        this.hasMore = media.length >= PAGE_SIZE;
        this.isLoading = false;
        this.currentPage = 2;
        setTimeout(() => this.animateGalleryItems(), 50);
      },
      error: (err) => {
        console.error('Failed to load gallery', err);
        this.isLoading = false;
      }
    });
  }

  loadMoreGallery(): void {
    if (this.isLoadingMore || !this.hasMore) return;

    this.isLoadingMore = true;
    this.contentService.getPublicMediaPage(this.currentPage, PAGE_SIZE).subscribe({
      next: (media: any[]) => {
        const mapped = media.map((m: any) => this.mapGalleryItem(m));
        this.allGalleryData = [...this.allGalleryData, ...mapped];
        this.galleryData = this.applyFilter(this.allGalleryData);
        this.hasMore = media.length >= PAGE_SIZE;
        this.currentPage++;
        this.isLoadingMore = false;
      },
      error: (err) => {
        console.error('Failed to load more gallery', err);
        this.isLoadingMore = false;
        this.hasMore = false;
      }
    });
  }

  private mapGalleryItem(m: any): GalleryItem {
    const category = m.category || (m.albumName ? this.slugify(m.albumName) : 'autre');
    const imageUrl = this.getAbsoluteUrl(m.thumbnailUrl || m.imageUrl || '');
    const largeUrl = this.getAbsoluteUrl(m.imageUrl || m.thumbnailUrl || '');
    const width = m.width || m.imageWidth || 0;
    const height = m.height || m.imageHeight || 0;
    const albumPage = m.albumPage || (m.albums && m.albums[0]?.page) || '';
    const albumSection = m.albumSection || (m.albums && m.albums[0]?.section) || '';
    if (albumPage === 'home' && albumSection === 'partners') {
      return null as any;
    }
    return {
      id: m.id,
      title: m.title || 'Sans titre',
      category,
      image: imageUrl,
      large: largeUrl,
      size: 'normal',
      video: m.type === 'video' ? this.getAbsoluteUrl(m.videoUrl || m.embedUrl || '') : undefined,
      width,
      height
    };
  }

  private applyFilter(items: GalleryItem[]): GalleryItem[] {
    return this.currentFilter === 'all' ? items : items.filter(item => item.category === this.currentFilter);
  }

  private getAbsoluteUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) return (environment.apiUrl.startsWith('https') ? 'https:' : 'http:') + url;
    if (url.startsWith('/')) return environment.apiUrl.replace('/api', '') + url;
    return environment.apiUrl.replace('/api', '') + '/' + url;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-');
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.lightboxOpen) return;
    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowLeft') {
      this.navigateGallery(-1);
    } else if (event.key === 'ArrowRight') {
      this.navigateGallery(1);
    }
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.lightboxOpen = false;
    this.loadGallery();
  }

  onScrollReached(): void {
    this.loadMoreGallery();
  }

  openLightbox(index: number): void {
    this.currentFilteredItems = this.getFilteredItems();
    this.currentGalleryIndex = index;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  navigateGallery(direction: number): void {
    this.currentFilteredItems = this.getFilteredItems();
    this.currentGalleryIndex =
      (this.currentGalleryIndex + direction + this.currentFilteredItems.length) %
      this.currentFilteredItems.length;
  }

  goToSlide(index: number): void {
    this.currentFilteredItems = this.getFilteredItems();
    this.currentGalleryIndex = index;
  }

  toggleFullscreen(): void {
    const lightboxContent = document.querySelector('.lightbox-content');
    if (!lightboxContent) return;

    if (!document.fullscreenElement) {
      lightboxContent.requestFullscreen().catch(() => {});
      this.isFullscreen = true;
    } else {
      document.exitFullscreen().catch(() => {});
      this.isFullscreen = false;
    }
  }

  onLightboxOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeLightbox();
    }
  }

  private animateGalleryItems(): void {
    const items = document.querySelectorAll('.pexels-item');
    if (!items.length) return;
    items.forEach((item, i: number) => {
      const el = item as HTMLElement;
      gsap.fromTo(el, 
        { opacity: 0, y: 20, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
          delay: i * 0.04
        }
      );
    });
  }

  private horizontalGallery: HTMLElement | null = null;
  private horizontalImages: HTMLImageElement[] = [];
  private animationId: number | null = null;
  private isDragging = false;
  private startX = 0;
  private startScroll = 0;
  private lastMoveX = 0;
  private lastMoveTime = 0;
  private targetScroll = 0;
  private currentScroll = 0;
  private velocity = 0;
  private snapTimeout: any = null;

  private initHorizontalGallery(): void {
    this.horizontalGallery = document.getElementById('horizontalGallery');
    if (!this.horizontalGallery) return;

    this.horizontalImages = Array.from(this.horizontalGallery.querySelectorAll('img'));
    this.bindHorizontalEvents();
    this.animateHorizontal();
  }

  private refreshHorizontalGallery(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    setTimeout(() => this.initHorizontalGallery(), 50);
  }

  private bindHorizontalEvents(): void {
    if (!this.horizontalGallery) return;
    this.horizontalGallery.style.cursor = 'grab';

    this.horizontalGallery.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startScroll = this.targetScroll;
      this.lastMoveX = e.clientX;
      this.lastMoveTime = Date.now();
      this.velocity = 0;
      clearTimeout(this.snapTimeout);
      this.horizontalGallery!.style.cursor = 'grabbing';
    });

    this.horizontalGallery.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const now = Date.now();
      const dx = this.startX - e.clientX;
      const maxScroll = this.horizontalGallery!.scrollWidth - this.horizontalGallery!.clientWidth;
      let newScroll = Math.max(0, Math.min(this.startScroll + dx, maxScroll));
      this.targetScroll = newScroll;
      this.currentScroll = newScroll;
      this.horizontalGallery!.scrollLeft = this.currentScroll;

      const timeDiff = now - this.lastMoveTime;
      if (timeDiff > 0 && timeDiff < 100) {
        const moveDelta = this.lastMoveX - e.clientX;
        this.velocity = moveDelta / timeDiff * 8;
      }
      this.lastMoveX = e.clientX;
      this.lastMoveTime = now;
    });

    const stopDrag = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.horizontalGallery!.style.cursor = 'grab';
      this.triggerSnap();
    };

    this.horizontalGallery.addEventListener('pointerup', stopDrag);
    this.horizontalGallery.addEventListener('pointerleave', stopDrag);

    window.addEventListener('resize', this.onHorizontalResize);
  }

  private onHorizontalResize = () => {
    if (!this.horizontalGallery) return;
    const maxScroll = this.horizontalGallery.scrollWidth - this.horizontalGallery.clientWidth;
    this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
    this.currentScroll = this.targetScroll;
    this.horizontalGallery.scrollLeft = this.currentScroll;
  };

  private triggerSnap(): void {
    clearTimeout(this.snapTimeout);
    this.snapTimeout = setTimeout(() => {
      if (Math.abs(this.velocity) > 0.5) return;
      const containerCenter = window.innerWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      this.horizontalImages.forEach((img, i) => {
        const rect = img.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const dist = Math.abs(containerCenter - center);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      const targetItem = this.horizontalImages[closest];
      const rect = targetItem.getBoundingClientRect();
      const targetPosition = this.targetScroll + (rect.left + rect.width / 2 - containerCenter);
      const maxScroll = this.horizontalGallery!.scrollWidth - this.horizontalGallery!.clientWidth;
      const newTarget = Math.max(0, Math.min(targetPosition, maxScroll));
      const snapVelocity = (newTarget - this.targetScroll) * 0.08;
      this.velocity += snapVelocity;
    }, 300);
  }

  private animateHorizontal = () => {
    if (!this.horizontalGallery || !this.horizontalImages.length) return;

    if (!this.isDragging) {
      this.targetScroll += this.velocity;
      this.velocity *= 0.92;
      if (Math.abs(this.velocity) < 0.05) this.velocity = 0;
    }

    const maxScroll = this.horizontalGallery.scrollWidth - this.horizontalGallery.clientWidth;
    this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
    this.currentScroll += (this.targetScroll - this.currentScroll) * 0.15;
    this.horizontalGallery.scrollLeft = this.currentScroll;

    const containerCenter = window.innerWidth / 2;
    this.horizontalImages.forEach((img) => {
      const rect = img.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      let offset = (containerCenter - center) / 6;
      offset = Math.max(-80, Math.min(80, offset));
      img.style.transform = `translate(calc(-50% + ${offset.toFixed(1)}px), -50%)`;
    });

    this.animationId = requestAnimationFrame(this.animateHorizontal);
  };
}
