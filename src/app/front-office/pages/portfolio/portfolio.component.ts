import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../components/icon/icon.component';
import { ContentService, ContentMedia } from '../../../core/services/content.service';
import { environment } from '../../../../environments/environment';

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  type: string;
  tags: string[];
  category: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.css'
})
export class PortfolioComponent implements OnInit {
  portfolioItems: PortfolioItem[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  currentFilter = 'all';
  lightboxOpen = false;
  currentLightboxIndex = 0;
  currentFilteredItems: PortfolioItem[] = [];

  constructor(private contentService: ContentService) {}

  private getAbsoluteUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
     if (url.startsWith('//')) return (environment.apiUrl.startsWith('https') ? 'https:' : 'http:') + url;
    if (url.startsWith('/')) return environment.apiUrl.replace('/api', '') + url;
    return environment.apiUrl.replace('/api', '') + '/' + url;
  }

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.contentService.getPublicMedia().subscribe({
      next: (media: ContentMedia[]) => {
        this.portfolioItems = media
          .filter((m) => m.isPublished && m.imageUrl)
          .map((m) => ({
            id: m.id,
            title: m.title || 'Sans titre',
            description: m.description || '',
            imageUrl: this.getAbsoluteUrl(m.imageUrl),
            type: m.type || 'image',
            tags: m.tags || [],
            category: (m.tags && m.tags.length > 0 ? m.tags[0] : 'portfolio') as string
          }));
        this.currentFilteredItems = this.getFilteredItems();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load portfolio', err);
        this.errorMessage = 'Impossible de charger le portfolio.';
        this.isLoading = false;
      }
    });
  }

  getFilteredItems(): PortfolioItem[] {
    if (this.currentFilter === 'all') return this.portfolioItems;
    return this.portfolioItems.filter((item) =>
      item.tags.some((tag) => tag.toLowerCase() === this.currentFilter.toLowerCase()) ||
      item.category.toLowerCase() === this.currentFilter.toLowerCase()
    );
  }

  get availableFilters(): string[] {
    const tags = new Set<string>();
    this.portfolioItems.forEach((item) => {
      item.tags.forEach((tag) => tags.add(tag));
    });
    return ['all', ...Array.from(tags)];
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.lightboxOpen = false;
    this.currentFilteredItems = this.getFilteredItems();
  }

  openLightbox(index: number): void {
    this.currentFilteredItems = this.getFilteredItems();
    this.currentLightboxIndex = index;
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  navigateGallery(direction: number): void {
    this.currentFilteredItems = this.getFilteredItems();
    this.currentLightboxIndex =
      (this.currentLightboxIndex + direction + this.currentFilteredItems.length) %
      this.currentFilteredItems.length;
  }

  onLightboxOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeLightbox();
    }
  }

  get currentLightboxItem(): PortfolioItem | undefined {
    return this.currentFilteredItems[this.currentLightboxIndex];
  }
}
