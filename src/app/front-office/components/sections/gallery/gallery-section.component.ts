import { Component, AfterViewInit, ViewChild, ElementRef, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { IconComponent } from '../../icon/icon.component';

interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  large: string;
  size: string;
  video?: string;
}

@Component({
  selector: 'app-gallery-section',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './gallery-section.component.html',
  styleUrls: ['./gallery-section.component.css']
})
export class GallerySectionComponent implements AfterViewInit, OnDestroy {
  @ViewChild('galleryGrid') galleryGrid!: ElementRef<HTMLDivElement>;

  galleryData: GalleryItem[] = [
    {
      id: 1,
      title: "Portrait d'Artiste",
      category: 'portrait',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'normal'
    },
    {
      id: 2,
      title: 'Lueur Matinale',
      category: 'landscape',
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'large'
    },
    {
      id: 3,
      title: 'Scène Cinématique',
      category: 'cinematic',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'normal'
    },
    {
      id: 4,
      title: 'Délice Culinaire',
      category: 'culinary',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'normal'
    },
    {
      id: 5,
      title: 'Modernité Architecturale',
      category: 'realestate',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'tall'
    },
    {
      id: 6,
      title: 'Portrait Urbain',
      category: 'portrait',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'normal'
    },
    {
      id: 7,
      title: 'Sommet Enneigé',
      category: 'landscape',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'wide'
    },
    {
      id: 8,
      title: "Événement d'Entreprise",
      category: 'corporate',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'normal'
    },
    {
      id: 9,
      title: 'Mariage Intime',
      category: 'events',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'normal'
    },
    {
      id: 10,
      title: 'Couleurs de la Nature',
      category: 'landscape',
      image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'large'
    },
    {
      id: 11,
      title: 'Ambiance Cinématique',
      category: 'cinematic',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'normal'
    },
    {
      id: 12,
      title: 'Art Culinaire',
      category: 'culinary',
      image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'normal'
    },
    {
      id: 13,
      title: 'Célébration',
      category: 'events',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'tall'
    },
    {
      id: 14,
      title: 'Lumières de la Ville',
      category: 'realestate',
      image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'wide'
    },
    {
      id: 15,
      title: 'Élégance Corporate',
      category: 'corporate',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'normal'
    },
    {
      id: 16,
      title: 'Rêverie',
      category: 'portrait',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&h=800&q=80',
      large: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=1200&h=1200&q=80',
      size: 'normal'
    }
  ];

  currentFilter = 'all';
  lightboxOpen = false;
  currentGalleryIndex = 0;
  currentFilteredItems: GalleryItem[] = [];
  isFullscreen = false;

  getFilteredItems(): GalleryItem[] {
    return this.currentFilter === 'all'
      ? this.galleryData
      : this.galleryData.filter(item => item.category === this.currentFilter);
  }

  get currentLightboxItem(): GalleryItem | undefined {
    return this.currentFilteredItems[this.currentGalleryIndex];
  }

  ngAfterViewInit(): void {
    if (typeof document === 'undefined') return;
    setTimeout(() => this.animateGalleryItems(), 50);
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onHorizontalResize);
    }
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
    setTimeout(() => {
      this.animateGalleryItems();
      this.refreshHorizontalGallery();
    }, 50);
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
    const items = this.galleryGrid.nativeElement.querySelectorAll('.gallery-item');
    if (!items.length) return;
    items.forEach((item, i: number) => {
      const el = item as HTMLElement;
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px) scale(0.97)';
      gsap.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out',
        delay: i * 0.06
      });
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
