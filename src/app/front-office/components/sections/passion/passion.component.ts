import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService, ContentSectionPage } from '../../../../core/services/content.service';
import { MediaStateService } from '../../../../core/services/media-state.service';
import { environment } from '../../../../../environments/environment';
import { merge, Subject, takeUntil } from 'rxjs';

const PASSION_PAGE = 'home';
const PASSION_SECTION = 'passion';
const EXPECTED_PASSION_COUNT = 2;

@Component({
  selector: 'app-passion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './passion.component.html',
  styleUrls: ['./passion.component.css']
})
export class PassionComponent implements OnInit {
  passionImages: string[] = [];
  isLoading = true;
  sectionPage: ContentSectionPage | null = null;

  private defaultImages: string[] = [
    'assets/images/home/home-passion-1.jpg',
    'assets/images/home/home-passion-2.jpg'
  ];

  private destroy$ = new Subject<void>();
  constructor(private contentService: ContentService, private mediaStateService: MediaStateService) {}

  ngOnInit(): void {
    this.mediaStateService.loadAll().subscribe({
      next: () => {
        this.loadPassionImages();
      }
    });

    merge(this.mediaStateService.albums$, this.mediaStateService.media$).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadPassionImages();
    });

    this.contentService.getSectionPages(PASSION_PAGE, PASSION_SECTION).subscribe({
      next: (pages) => {
        this.sectionPage = pages[0] || null;
      },
      error: () => {
        this.sectionPage = null;
      }
    });
  }

  private loadPassionImages(): void {
    const album = this.mediaStateService.currentAlbums.find(
      a => a.page === PASSION_PAGE && a.section === PASSION_SECTION && a.isPublished
    );
    if (album && album.mediaIds.length > 0) {
      const mediaItems = this.mediaStateService.currentMedia.filter(m => album.mediaIds.includes(m.id));
      this.passionImages = mediaItems
        .filter((m: any) => m.type === 'image' && (m.url || m.imageUrl))
        .map((m: any) => this.getAbsoluteUrl(m.url || m.imageUrl))
        .slice(0, EXPECTED_PASSION_COUNT);
    } else {
      this.passionImages = [...this.defaultImages].slice(0, EXPECTED_PASSION_COUNT);
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
