import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';
import { MediaStateService } from '../../../../core/services/media-state.service';
import { environment } from '../../../../../environments/environment';
import { merge, Subject, takeUntil } from 'rxjs';

export interface PortfolioItem {
  id: number;
  image: string;
  label: string;
}

const PORTFOLIO_PAGE = 'home';
const PORTFOLIO_SECTION = 'portfolio';
const EXPECTED_MEDIA_COUNT = 5;

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  portfolioItems: PortfolioItem[] = [];
  isLoading = true;
  displayItems: PortfolioItem[] = [];

  private defaultItems: PortfolioItem[] = [
    {
      id: 1,
      image: 'assets/images/home/home-rooms-main.jpg',
      label: 'Wedding'
    },
    {
      id: 2,
      image: 'assets/images/home/home-rooms-1.jpg',
      label: 'Corporate'
    },
    {
      id: 3,
      image: 'assets/images/home/home-portrait.jpg',
      label: 'Portrait'
    },
    {
      id: 4,
      image: 'assets/images/home/home-events.jpg',
      label: 'Events'
    },
    {
      id: 5,
      image: 'assets/images/home/home-fashion.jpg',
      label: 'Fashion'
    }
  ];

  private destroy$ = new Subject<void>();
  constructor(private mediaStateService: MediaStateService) {}

  ngOnInit(): void {
    this.mediaStateService.loadAll().subscribe({
      next: () => {
        this.loadPortfolioImages();
      }
    });

    merge(this.mediaStateService.albums$, this.mediaStateService.media$).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadPortfolioImages();
    });
  }

  private loadPortfolioImages(): void {
    const album = this.mediaStateService.currentAlbums.find(
      a => a.page === PORTFOLIO_PAGE && a.section === PORTFOLIO_SECTION && a.isPublished
    );
    if (album && album.mediaIds.length > 0) {
      const mediaItems = this.mediaStateService.currentMedia.filter(m => album.mediaIds.includes(m.id));
      this.portfolioItems = mediaItems
        .filter((m: any) => m.type === 'image' && (m.url || m.imageUrl))
        .map((m: any) => ({
          id: m.id || 0,
          image: this.getAbsoluteUrl(m.url || m.imageUrl),
          label: (m.title || m.altText || '').substring(0, 30) || 'Photo'
        }));
      this.displayItems = this.portfolioItems;
    } else {
      this.displayItems = [...this.defaultItems];
    }
    this.isLoading = false;
  }

  private getAbsoluteUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('//')) {
      return (environment.apiUrl.startsWith('https') ? 'https:' : 'http:') + url;
    }
    if (url.startsWith('/')) return environment.apiUrl.replace('/api', '') + url;
    return environment.apiUrl.replace('/api', '') + '/' + url;
  }
}
