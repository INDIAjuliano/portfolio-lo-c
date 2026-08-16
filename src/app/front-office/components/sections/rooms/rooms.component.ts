import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaStateService } from '../../../../core/services/media-state.service';
import { ContentService, ContentSectionPage } from '../../../../core/services/content.service';
import { environment } from '../../../../../environments/environment';
import { merge, Subject, takeUntil } from 'rxjs';

const PACKAGES_PAGE = 'home';
const PACKAGES_SECTION = 'packages';
const EXPECTED_PACKAGES_COUNT = 3;

interface PackageItem {
  id: number;
  image: string;
  alt: string;
  title?: string;
  description?: string;
  type?: string;
  name?: string;
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit, OnDestroy {
  packages: PackageItem[] = [];
  isLoading = true;
  sectionPage: ContentSectionPage | null = null;

  private defaultPackages: PackageItem[] = [
    {
      id: 1,
      image: 'assets/images/home/home-rooms-main.jpg',
      alt: 'Wedding Session',
      title: 'Wedding & Engagement',
      type: 'Signature',
      description: 'Wedding Session'
    },
    {
      id: 2,
      image: 'assets/images/home/home-rooms-1.jpg',
      alt: 'Portrait Session',
      title: 'Professional Portrait',
      type: 'Portrait',
      description: 'Portrait Session'
    },
    {
      id: 3,
      image: 'assets/images/home/home-rooms-2.jpg',
      alt: 'Event Session',
      title: 'Corporate & Private Events',
      type: 'Events',
      description: 'Event Session'
    }
  ];

  private destroy$ = new Subject<void>();
  constructor(private mediaStateService: MediaStateService, private contentService: ContentService) {}

  ngOnInit(): void {
    this.mediaStateService.loadAll().subscribe({
      next: () => {
        this.loadPackages();
      }
    });

    merge(this.mediaStateService.albums$, this.mediaStateService.media$).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadPackages();
    });

    this.contentService.getSectionPages(PACKAGES_PAGE, PACKAGES_SECTION).subscribe({
      next: (pages) => {
        this.sectionPage = pages[0] || null;
      },
      error: () => {
        this.sectionPage = null;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPackages(): void {
    const album = this.mediaStateService.currentAlbums.find(
      a => a.page === PACKAGES_PAGE && a.section === PACKAGES_SECTION && a.isPublished
    );
    if (album && album.mediaIds.length > 0) {
      const mediaItems = this.mediaStateService.currentMedia.filter(m => album.mediaIds.includes(m.id));
      this.packages = mediaItems
        .filter((m: any) => m.type === 'image' && (m.url || m.imageUrl))
        .map((m: any) => ({
          id: m.id || 0,
          image: this.getAbsoluteUrl(m.url || m.imageUrl),
          alt: m.altText || m.title || 'Package',
          title: m.title || undefined,
          description: m.description || undefined,
          type: undefined,
          name: m.title || undefined
        }))
        .slice(0, EXPECTED_PACKAGES_COUNT);
    } else {
      this.packages = [...this.defaultPackages].slice(0, EXPECTED_PACKAGES_COUNT);
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
