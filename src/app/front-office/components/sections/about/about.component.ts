import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';
import { ContentService, ContentSectionPage } from '../../../../core/services/content.service';
import { MediaStateService } from '../../../../core/services/media-state.service';
import { environment } from '../../../../../environments/environment';
import { merge, Subject, takeUntil } from 'rxjs';

const ABOUT_PAGE = 'home';
const ABOUT_SECTION = 'about';
const EXPECTED_ABOUT_COUNT = 4;

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  aboutImages: string[] = [];
  isLoading = true;
  sectionPage: ContentSectionPage | null = null;

  private defaultImages: string[] = [
    'assets/images/home/home-about-1.jpg',
    'assets/images/home/home-about-2.jpg',
    'assets/images/home/home-about-3.jpg',
    'assets/images/home/home-about-4.jpg'
  ];

  private destroy$ = new Subject<void>();
  constructor(private contentService: ContentService, private mediaStateService: MediaStateService) {}

  ngOnInit(): void {
    this.mediaStateService.loadAll().subscribe({
      next: () => {
        this.loadAboutImages();
      }
    });

    merge(this.mediaStateService.albums$, this.mediaStateService.media$).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadAboutImages();
    });

    this.contentService.getSectionPages(ABOUT_PAGE, ABOUT_SECTION).subscribe({
      next: (pages) => {
        this.sectionPage = pages[0] || null;
      },
      error: () => {
        this.sectionPage = null;
      }
    });
  }

  private loadAboutImages(): void {
    const album = this.mediaStateService.currentAlbums.find(
      a => a.page === ABOUT_PAGE && a.section === ABOUT_SECTION && a.isPublished
    );
    if (album && album.mediaIds.length > 0) {
      const mediaItems = this.mediaStateService.currentMedia.filter(m => album.mediaIds.includes(m.id));
      this.aboutImages = mediaItems
        .filter((m: any) => m.type === 'image' && (m.url || m.imageUrl))
        .map((m: any) => this.getAbsoluteUrl(m.url || m.imageUrl))
        .slice(0, EXPECTED_ABOUT_COUNT);
    } else {
      this.aboutImages = [...this.defaultImages].slice(0, EXPECTED_ABOUT_COUNT);
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
